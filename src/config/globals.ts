/**
 * @file config
 * @author kaivean
 */

import fs from 'fs';

export default {

    /**
     * appdir, will be changed after config loaded.
     *
     * @type {string}
     */
    appdir: process.cwd(),

    /**
     * env, at most time, this property should be development or production
     *
     * @type {string}
     */
    version: JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8')).version,

    /**
     * app name
     *
     * @type {string}
     */
    appname: JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8')).name
};