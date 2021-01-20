/**
 * @file config
 * @author kaivean
 */


export default {
    // 是否启用session
    enable: true,

    /**
     *  session store，默认本地内存
     *
     * ```javascript
     *
     * {
     *     set(sid, session, ttl) {
     *         return new Promise();
     *     },
     *
     *     get(sid) {
     *         return new Promise();
     *     },
     *
     *     destroy(sid) {
     *         return new Promise();
     *     }
     * }
     *
     * ```
     * @type {Object|undefined}
     */
    store: null,

    // 默认的store存储目录
    storeDir: './tmp/session',

    keys: ['akb'],

    // koa.session的配置
    // 参数配置参考 https://github.com/koajs/generic-session#options
    session: {
        secret: 'akb',
        key: 'NODE_SESSION_ID', // session name in cookie
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 // 单位ms,  1day = 24 * 60 * 60 * 1000
        }
    }
};
