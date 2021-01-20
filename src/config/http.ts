/**
 * @file config
 * @author kaivean
 */

export default {
    /**
     * timeout of every requests
     *
     * @type {boolean}
     */
    timeout: 120000, // 120s

    /**
     * directory of controller
     *
     * @type {string}
     */
    controllerDir: './app/controllers',

    /**
     * config of body parser. set `bodyParser: false` can disable `bodyParser`
     *
     * see `https://github.com/koajs/bodyparser` for more options.
     *
     * @type {Object}
     */
    bodyParser: true
};

