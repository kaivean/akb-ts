/**
 * @file config
 * @author kaivean
 */

export default {

    /**
     * enable logger or disable
     *
     * @type {boolean}
     */
    enable: true,

    /**
     * dir of saved logs, default is ${appdir}/logs
     *
     * @type {string}
     */
    dir: './logs',

    /**
     * debug info warn error
     *
     */
    level: 'info',

    /**
     * default size of single log file 4GB
     *
     * @type {number}
     */
    maxsize: 4 * 1024 * 1024 * 1024 * 1024,

    /**
     * auto ratote pattern
     *
     * @type {string}
     */
    dailyRotatePattern: 'YYYY-MM-DD',

    /**
     * transports of debug and info.
     *
     * file transport is default, and console transport will be added under debug
     * developer can add custom transport here
     *
     * @type {Array.<winston.transports.Transport>}
     */
    transports: [],

    /**
     * transports of warn and error
     *
     * file transport is default, and console transport will be added under debug
     * developer can add custom transport here
     *
     * @type {Array.<winston.transports.Transport>}
     */
    wfTransports: []
};
