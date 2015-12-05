var path = require('path');
var utils = require('../lib/utils.js');
var config = {
    name: 'AllMobilize/am-privatecloud',
    version: '1.0',
    port: 30000,
    pkg: require('../package.json'),
    session: {
        key: 'privatecloud_sid',
        secret: 'privatecloud',
        cookie: {
            path: "/",
            expires: 1 * 24 * 60 * 60 * 1000
        },
        filePath: path.join(__dirname, '../', 'db/sessions')
    },
    log: {
        dir: path.join(__dirname, '../', 'log'),
        level: 'silly'
    },
    PERPAGE: 15
};
config.URL = {
    PRIVATE_CLOUD: 'http://localhost:' + config.port + '/',
    PLATFORM: 'http://localhost:20000/'
}

module.exports = utils.loadEnvFile(__dirname, config);
