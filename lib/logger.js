'use strict';

var log = require('./log');
var util = require('./utils');
var config = require('../config/config');

var options = {
    ExtendConsole: {
        timestamp: function() {
            return util.getDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS').grey;
        },
        level: config.log.level,
        colorize: true,
        prettyPrint: true,
        handleExceptions: true
    },
    ExtendDailyRotateFile: {
        timestamp: function() {
            return util.getDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
        },
        prettyPrint: true,
        datePattern: '/yyyy-MM-dd.log',
        level: 'silly',
        maxFiles: 15,
        filename: config.log.dir
    }
};

module.exports = log(options);
