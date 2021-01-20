/**
 * @file 接口
 * @author kaivean
 */

import Koa, {Context} from 'koa';
import Logger from './logger';

export interface RouteOption {
    type?: 'static' | 'dynamic';
    allowedMethods?: string[];
    target?: string;
    root?: string;
    maxAge?: number;
    index?: boolean;
    dotfiles?: 'deny';
    lastModified?: true;
    etag?: true;
    params?: {[key: string]: string};
    redirect?: boolean;
    setHeaders?: (ctx: Context) => Promise<void> | void;
    handler?: (app: Koa) => ((ctx: Context) => Promise<void> | void);
}

export type RouteFunction = (app: Koa) => ((ctx: Context) => Promise<void> | void);
export type RouteConf = string | RouteOption | RouteFunction;
export interface Routes {
    [key: string]: RouteConf;
}
// export Koa from 'koa'

// declare
// interface Context {
//     route: RouteOption
// }

export interface AkbContext extends Context {
    route: RouteOption;
    app: any;
    logger: Logger;
}