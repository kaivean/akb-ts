/**
 * @file 工具
 * @author kaivean
 */

import os from 'os'

export function getIP() {
    let interfaces = os.networkInterfaces();
    for (let devName of Object.keys(interfaces)) {
        let iface = interfaces[devName];
        if (!iface) {
            continue;
        }
        for (let i = 0, len = iface.length; i < len; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '';
}

export function usage(config: any) {
    console.log('\n====================================================');
    console.log('PID          : ' + process.pid);
    console.log('node.js      : ' + process.version);
    console.log('====================================================');
    console.log('Name         : ' + config.globals.appname);
    console.log('Appdir       : ' + config.globals.appdir);
    console.log('Version      : ' + config.globals.version);
    console.log('Date         : ' + new Date());
    console.log('Mode         : ' + process.env.NODE_ENV);
    console.log('====================================================\n');
    console.log('Listen to    : http://' + getIP() + ':' + config.server.port);
    console.log('');
}

export function formater(str: string, data: {[key: string]: string}) {
    return str.replace(/\{(.*?)\}/g, (m, p) => data[p]);
};

export function sleep(time = 2000) {
    return new Promise(resove => {
        setTimeout(() => {
            resove('');
        }, time);
    });
}
