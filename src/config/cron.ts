/**
 * @file config
 * @author kaivean
 */

export default {

    /**
     * the directory of cron tasks
     *
     * @type {string}
     */
    cronDir: './app/cron',

    /**
     * cron tasks
     *
     * example:
     *
     * ```javascript
     * {
     *     'task1': '* * * * * *' // this task will be executed every second
     * }
     * ```
     */
    crons: {
        checkTime: '*/20 * * * * *' // every 20 seconds
    }
};
