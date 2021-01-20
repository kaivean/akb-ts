/**
 * @file server入口
 * @author kaivean
 */

import path from 'path';
import fs from 'fs-extra';
import {EventEmitter} from 'events';

import Koa from 'koa';
// import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import send from 'send';
// import fs from 'fs-extra';
// import glob from 'glob'
import session from 'koa-session';

import {usage, formater} from './util';
import Logger from './logger';
import {AkbContext, Routes, RouteOption} from './interface';
import FileStore from 'koa-generic-session-file2';
import {loadComponents, loadConfigs, loadControllers, loadCron, loadMiddlewares} from './loader';
import {Socket} from 'net';

function sendStatic(ctx: AkbContext, config: {[propName: string]: any}) {
    return new Promise((resolve, reject) => {
        const sendOpt = ctx.route as any;
        sendOpt.root = path.join(config.globals.appdir, sendOpt.root || '');

        send(ctx.req, ctx.route.target || ctx.path, sendOpt).on('error', function (err) {
            reject(err);
        }).on('headers', function (req, path, stat) {
            // support setHeaders
            if (sendOpt.setHeaders) {
                sendOpt.setHeaders.call(undefined, ctx, path, stat);
            }
            ctx.status = 200;
        }).on('end', function () {
            resolve('');
        }).pipe(ctx.res);
    });
}

function registerProcessEvents(app: Koa, logger: Logger) {
    process.on('uncaughtException', (error: Error) => {
        console.error('UncaughtException', error);
    });

    process.on('unhandledRejection', (reason: any, promise: any) => {
        console.error('unhandledRejection', reason, promise);
    });

    process.on('SIGTERM', async () => {
        console.info('Starting graceful shutdown');
        process.exit(0);
    });
}

export {AkbContext as Context} from './interface';
export {Koa, Logger, Routes, RouteOption};
export type ErrorCallback = (error: Error, opt: {app: Koa, ctx: AkbContext}) => void;
export type StartedCallback = (opt: {app: Koa, ctx: AkbContext}) => void;

export default class App extends EventEmitter {
    projectDir: string;

    constructor() {
        super();
        this.projectDir = process.cwd();
    }

    on(event: 'error' | 'started', listener: ErrorCallback | StartedCallback) {
        super.on(event, listener);
        return this;
    }

    async run() {

        try {
            // Starting the HTTP server
            console.info('Initializing application');

            const app = new Koa();
            // const router = new Router();

            global.akb = app as any;

            const config = await loadConfigs(this.projectDir);

            // 兼容旧akb
            (app as any).config = config;
            const logger = new Logger(config);
            (app as any).logger = logger;
            (app as any).appdir = config.globals.appdir;

            registerProcessEvents(app, logger);

            app.use(async (ctx: AkbContext, next) => {
                ctx.app = app;
                ctx.logger = logger;

                // 兼容旧akb
                ctx.json = (data) => {
                    // set content-type
                    if (!ctx.response.get('Content-Type')) {
                        ctx.set('Content-Type', 'application/json');
                    }

                    ctx.body = JSON.stringify(data);
                };

                try {
                    // const start = Date.now();
                    await next();
                    // const ms = Date.now() - start;
                }
                catch (error) {
                    ctx.status = 500;

                    this.emit('error', error, {app, ctx});

                    const errorFile = path.join(config.globals.appdir, 'app', 'controllers', 'error.js');
                    if (fs.existsSync(errorFile)) {
                        /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
                        const mod = require(errorFile);
                        const realMod = mod.default || mod;
                        await realMod.handle(ctx, error);
                    }

                    console.error(error);
                }
            });

            if (config.http.bodyParser) {
                app.use(bodyParser({}));
            }

            // 初始化路由导航
            const routeMatches = await loadControllers(config);
            app.use(async (ctx: AkbContext, next) => {
                for (const routeMatch of routeMatches) {
                    // console.log('routeMatch', routeMatch.option.allowedMethods, ctx.method);
                    if (!(routeMatch.option.allowedMethods || []).includes(ctx.method.toLowerCase())) {
                        continue;
                    }
                    let regexp = routeMatch.regexp;
                    let matches = regexp.exec(ctx.path);

                    let keys = routeMatch.keys;
                    let params = {} as {[key: string]: string};
                    let routeOption = Object.assign({}, routeMatch.option);
                    if (matches) {
                        for (let i = 0, len = keys.length; i < len; i++) {
                            params[keys[i].name] = matches[i + 1];
                        }

                        routeOption.params = params;
                        // matchRoute.option = option;
                        routeOption.type = routeOption.type || 'dynamic';

                        // 将配置中的占位符替换
                        for (let key of Object.keys(routeOption)) {
                            let value = routeOption[key];
                            if (typeof value === 'string') {
                                routeOption[key] = formater(value, params);
                            }
                        }

                        if (routeOption.redirect) {
                            routeOption.redirect = routeOption.redirect;
                        }
                        ctx.route = routeOption;

                        break;
                    }
                }

                await next();
            });

            // session中间件
            if (config.session.enable) {
                // 没有定义的，就用默认的 ，写入文件
                let store = config.session.store;
                if (!store) {
                    store = new FileStore({
                        sessionDirectory: path.join(config.globals.appdir, config.session.storeDir)
                    });
                }


                app.keys = config.session.keys;
                app.use(
                    session(
                        Object.assign(
                            {store},
                            config.session.session,
                            config.session.session.cookie || {}
                        ),
                        app
                    )
                );
            }

            // 用户所有中间件
            const middlewares = await loadMiddlewares(config, this.projectDir);
            for (const middleware of middlewares) {
                app.use(await middleware(app));
            }

            // 兼容：用户所有组件
            const components = await loadComponents(config, this.projectDir);
            for (const name of Object.keys(components)) {
                app[name] = await components[name](app);
            }

            // 用户所有定时器
            await loadCron(config, this.projectDir, app, logger);

            // Routes
            // app.use(async (ctx, next) => {
            //     ctx.body = { msg: 'Hey! Not Found' };

            //     await next();
            // })

            // 都低
            app.use(async (ctx: AkbContext, next) => {
                if (ctx.route) {
                    // ctx.body = ctx.route;
                    if (ctx.route.setHeaders) {
                        ctx.route.setHeaders(ctx);
                    }

                    if (ctx.route.handler) {
                        const func = ctx.route.handler(app);
                        await func(ctx);
                        return next();
                    }
                    else if (ctx.route.type === 'static') {
                        await sendStatic(ctx, config);
                        return next();
                    }
                    else if (ctx.route.type === 'dynamic') {
                        const filepath = path.join(
                            config.globals.appdir, config.http.controllerDir, ctx.route.target || ctx.path
                        );
                        /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
                        const mod = require(filepath);
                        const func = mod.default || mod;
                        await func(ctx);
                        return next();
                    }
                }
                ctx.status = 404;
                ctx.body = 'Not Found';
                await next();
            });

            console.info('Starting HTTP server');
            const server = app.listen(config.server.port, config.server.host, () => {
                console.log('Server started');

                this.emit('started', {app, server});
                usage(config);
            });

            // 设置 timeout
            const timeout = config.http.timeout || 30000;
            server.setTimeout(timeout);
            server.on('timeout', (socket: Socket) => {
                socket.end();
            });
        }
        catch (e) {
            console.error(e, 'An error occurred while initializing application.');
        }
    }
}
