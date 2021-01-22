/**
 * @file server入口
 * @author kaivean
 */

import path from 'path';

import Koa from 'koa';
import cron from 'cron';
import fs from 'fs-extra';
import _ from 'lodash';
// import glob from 'glob'
import {pathToRegexp} from 'path-to-regexp';

// import {formater} from './util';
import Logger from './logger';
import {RouteOption} from './interface';


export async function loadConfigs(dir: string) {
    const config = {} as {[propName: string]: any};
    const list = await fs.readdir(path.join(dir, 'config'));
    for (let name of list) {
        let filepath = path.join(path.join(dir, 'config'), name);
        let stat = await fs.stat(filepath);
        if (stat.isFile()) {
            try {
                if (name.endsWith('.ts')) {
                    name = name.replace('.ts', '');
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    config[name] = require(filepath.replace('.ts', ''));
                }
                else {
                    name = name.replace('.js', '');
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    config[name] = require(filepath.replace('.js', ''));
                }
                config[name] = config[name].default || config[name];
            }
            catch (e) {
                console.error('Load Configs Error', name);
                throw e;
            }
        }
    }

    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
        /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
        const mod = require(path.join(dir, 'config', 'env', process.env.NODE_ENV));
        const devConf = mod.default || mod;
        _.merge(config, devConf);
    }
    return config;
}

export async function loadMiddlewares(config: {[propName: string]: any}, dir: string) {
    // console.log('config', config);
    const middlewares = [] as Array<(app: Koa) => any>;
    for (const name of (config.middleware.all.concat(config.middleware.dynamic))) {
        let filepath = path.join(dir, config.middleware.dir, name + '.js');
        if (!fs.existsSync(filepath)) {
            filepath = path.join(dir, config.middleware.dir, name + '.ts');
        }
        const stat = await fs.stat(filepath);
        if (stat.isFile()) {
            try {
                /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
                const mod = require(filepath);
                middlewares.push(mod.default || mod);
            }
            catch (e) {
                console.error('Load Middlewares Error', name);
                throw e;
            }
        }
    }

    return middlewares;
}

export async function loadComponents(config: {[propName: string]: any}, dir: string) {
    // console.log('config', config);
    const components = {} as {[propName: string]: (app: Koa) => any};
    if (!config.component) {
        return components;
    }

    for (const item of config.component.components) {
        let name: string;
        let subfile: string;
        if (typeof item === 'string') {
            name = item;
            subfile = name;
        }
        else {
            name = item.name;
            subfile = item.filepath;
        }

        let filepath = path.join(dir, config.component.dir, subfile + '.js');

        const stat = await fs.stat(filepath);
        if (stat.isFile()) {
            try {
                /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
                const mod = require(filepath);
                components[name] = mod.default || mod;
            }
            catch (e) {
                console.error('Load Components Error', name, subfile);
                throw e;
            }
        }
    }

    return components;
}

export async function loadCron(config: {[propName: string]: any}, dir: string, app: Koa, logger: Logger) {
    // console.log('config', config);
    const components = {} as {[propName: string]: (app: Koa, logger?: Logger) => any};
    for (const name of Object.keys(config.cron.crons)) {
        let cronStr = config.cron.crons[name];
        let filepath = path.join(dir, config.cron.cronDir, name + '.js');
        if (!fs.existsSync(filepath)) {
            filepath = path.join(dir, config.cron.cronDir, name + '.ts');
        }

        const stat = await fs.stat(filepath);
        if (stat.isFile()) {
            try {
                /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
                const mod = require(filepath);
                const func = (mod.default || mod)(app, logger);
                new cron.CronJob(cronStr, () => {
                    func();
                }).start();
            }
            catch (e) {
                console.error('Load Cron Error', name, cronStr);
                throw e;
            }
        }
    }

    return components;
}

export async function loadControllers(config: {[propName: string]: any}) {
    // console.log('config', config);
    // const components = {} as {[propName: string]: Function};
    const allowedMethods = ['get', 'head', 'post', 'put', 'delete', 'trace', 'options', 'connect', 'patch'];
    const routeMatches = [] as Array<{regexp: RegExp, keys: any[], option: RouteOption}>;
    for (const urlpath of Object.keys(config.router.routes)) {
        let item = config.router.routes[urlpath];
        if (typeof item === 'string') {
            item = {
                target: item
            };
        }
        if (typeof item === 'function') {
            item = {
                handler: item
            };
        }

        if (!item.allowedMethods) {
            item.allowedMethods = allowedMethods;
        }

        const keys = [];
        const regexp = pathToRegexp(urlpath, keys);

        routeMatches.push({
            regexp,
            keys,
            option: item as RouteOption
        });
    }

    if (config.router.enableDefaultRoutes) {
        const keys = [];
        const regexp = pathToRegexp('/(.*)', keys);
        routeMatches.push({
            regexp,
            keys,
            option: {allowedMethods, target: '/{0}'} as RouteOption
        });
    }

    return routeMatches;
}