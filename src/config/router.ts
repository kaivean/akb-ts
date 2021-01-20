/**
 * @file config
 * @author kaivean
 */

import {Routes} from '../interface';

export default {
    enableDefaultRoutes: true,

    routes: {
        // 页面路由配置
        '/': 'index',
        // for api
        '/api/base/:action': {
            target: '/api/{action}',
            setHeaders(ctx) {
                ctx.set('Access-Control-Allow-Origin', '*');
                ctx.set('Access-Control-Allow-Credentials', 'true');
                ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            }
        },
        // 静态文件
        // 除type, target, root 等其他配置参考  https://github.com/pillarjs/send#api
        '/static/(.*)': {
            type: 'static',
            target: '/static/{0}',
            root: './public',
            // max age
            maxAge: 365 * 24 * 3600 * 1000,
            index: false,
            dotfiles: 'deny',
            lastModified: true,
            etag: true
        },

        '/monitor'() {
            return async ctx => {
                ctx.body = '<!-- STATUS 200 -->';
            };
        }
        // 防止前端路由刷新，定位到首页，让js接管路由
        // '*': 'index'
    } as Routes
};

