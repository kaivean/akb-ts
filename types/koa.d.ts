/**
 * @file 声明
 * @author kaivean
 */

import {RouteOption} from '../src/interface';

declare module 'koa' {
    export interface ExtendableContext {
        route: RouteOption;
    }
}
