/**
 * @file config
 * @author kaivean
 */

export default {

    /**
     * the dir of all middlewares
     *
     * @type {string}
     */
    dir: './app/middlewares',

    /**
     * all requests will pass through these middlewares.
     *
     * @type {Array.<string>}
     */
    all: ['log'],


    /**
     * only dynamic requests will pass through these middlewares.
     *
     * @type {Array.<string>}
     */
    dynamic: ['auth'],

    /**
     * only static requests will pass through these middlewares.
     *
     * @type {Array.<string>}
     */
    static: []
};
