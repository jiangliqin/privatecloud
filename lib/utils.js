'use strict';

var utilModule = require('util'),
    crypto = require('crypto'),
    moment = require('moment'),
    _ = require('lodash'),
    request = require('request'),
    Q = require('q'),
    os = require('os'),
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    uuid = require('uuid');

//Q.longStackSupport = true;

/**
 * util工具函数集
 * 工具函数来自 lodash和内建util模块
 * @type {[type]}
 */
_.extend(_, utilModule);

var util = module.exports = _;
var _labels = {};
util.time = function(label) {
    _labels[label] = Date.now();
};

util.timeEnd = function(label) {
    var time = _labels[label];
    if (!time) {
        throw new Error('No such label: ' + label);
    }
    var duration = Date.now() - time;
    return duration;
};

/**
 * Date格式化
 *
 * @param  {Date} date
 * @param  {String} format @optional 默认为 YYYY-MM-DD HH:mm
 * @return {String}
 * @api public
 */
util.getDateTime = function(date, format) {
    if (!util.isDate(date)) {
        return date;
    }
    format = format || "YYYY-MM-DD HH:mm";
    return moment(date).utcOffset('+08:00').format(format);
};

/**
 * Date格式化
 *
 * @param  {Date} date
 * @param  {String} format @optional 默认为 YYYY-MM-DD HH:mm
 * @return {Function}
 * @api public
 */
util.dateFormat = function(format) {
    return function(date) {
        return util.getDateTime(date, format);
    };
};
util.dateTimestamp = function() {
    return function(date) {
        return moment(date).utcOffset('+08:00').unix();
    };
};

util.getDateParticularTime = function(format) {
    format = format || "YYYY-MM-DD HH:mm:ss";
    return moment(new Date()).utcOffset('+08:00').format(format);
};


/**
 * Encrypt Text
 *
 * @param {String} text
 * @param {String} key 默认为 allmobilize
 * @return {String}
 * @api public
 */
util.encrypt = function(text, key) {
    key = key || 'allmobilize';
    if (!text) {
        return '';
    }
    return crypto.createHmac('sha1', key).update(text).digest('hex');
};

/**
 * Encrypt Text
 *
 * @param {String} text
 * @param {String} key 默认为 allmobilize
 * @return {String}
 * @api public
 */
util.md5 = function(text, key) {
    key = key || 'allmobilize';
    return crypto.createHmac('md5', key).update(text).digest('hex');
};

util.base64 = function(buf) {
    if (!Buffer.isBuffer(buf)) {
        buf = new Buffer(buf);
    }
    return buf.toString('base64');
};

util.unbase64 = function(base64, encoding) {
    encoding = encoding || 'utf8';
    return new Buffer(base64, 'base64').toString(encoding);
};


util.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};


util.callParent = function(parent, methodName, self, args) {
    var method = parent.prototype[methodName] || function() {
            throw new Error('not find method.' + methodName);
        };
    return method.apply(self, args);
};
/**
 * 得到网站的host  http://www.baidu.com:80/re?asdfasdf=123   www.baidu.com:80
 * @param str
 */
util.getHost = function(str) {
    if (!str) {
        return;
    }
    var u = url.parse(str);
    if (u.protocol != 'http:' && u.protocol != 'https:') {
        u = url.parse('http://' + str);
    }
    if (u.host) {

    } else {
        u = url.parse('http://' + str); // TODO: HTTPS没有判断
    }
    return u.host;

}
/**
 * 得到一个uuid
 * @param str
 * @returns {*}
 * @constructor
 */
util.UUID = function() {
    return uuid.v1().replace(/\-/g, '');
}
/**
 * 验证邮箱是否正确
 * @param email
 * @returns {*}
 */
util.testEmail = function(email) {
    var regex = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    return regex.test(email);
}

util.getPassword = function(minLength, maxLength) {
    if (minLength <= 0) {
        throw new Error('无效的参数.');
    }
    minLength = minLength || 8;
    maxLength = maxLength || minLength;
    var text = ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '1234567890', '!@#$*'];
    var rand = function(min, max) {
        return Math.floor(Math.max(min, Math.random() * (max + 1)));
    }
    var len = rand(minLength, maxLength);
    var pw = [];
    for (var i = 0; i < len; ++i) {
        var strpos = rand(0, text.length - 1);
        var charPostion = rand(0, text[strpos].length);
        pw.push(text[strpos].charAt(charPostion));
    }
    return pw.join('');
};

util.retry = require('qretry');


/**
 *
 * ?表示 不确定这个对象存在
 * https://github.com/juliangruber/deep-access
 *
 * var obj = {
  foo: 'bar',
  bar: {
    baz: {
      beep: 'boop'
    }
  }
};

 console.log(deepObject(obj, 'foo'));
 // => "bar"

 console.log(deepObject(obj, 'bar.baz.beep'));
 // => "boop"

 console.log(deepObject(obj, 'foo.beep.boop'));
 // throws


 console.log(deepObject(obj, 'foo.beep?.boop'));
 // => undefined

 * @param obj
 * @param prop
 * @returns {*}
 */
util.deepObject = function(obj, prop) {
    var segs = prop.split('.');
    while (segs.length) {
        var seg = segs.shift();
        var existential = false;
        if (seg[seg.length - 1] == '?') {
            seg = seg.slice(0, -1);
            existential = true;
        }
        obj = obj[seg];
        if (!obj && existential) return obj;
    }
    return obj;
}

util.blockHiddenFile = function(list) {
    var newList = [];
    list.forEach(function(item) {
        if (/(^\..+|index)/.test(item)) {
        } else {
            newList.push(item);
        }
    });
    return newList;
};

/**
 * 给没有添加 http 的域名添加host
 * @param host
 * @returns {*}
 */
util.handleHost = function(host) {
    if (!(/http:\/\//i.test(host))) {
        host = 'http://' + host;
    }
    return host;
}

/**
 * 删除对象里面的空参数  utils.removeEmpty(user,['a','c']);
 * @param obj
 * @param ignoreArr
 */
util.removeEmpty = function(obj, ignoreArr) {
    var keys = util.keys(obj);
    //忽略空参数
    util.each(keys, function(key) {
        if (!obj[key] || (obj[key] === 'undefined') || (obj[key] === 'null')) {
            //表示 当前key 不需要删除
            if (util.indexOf(ignoreArr, key) < 0) {
                delete obj[key];
            }
        }
    });
}

/**
 * 返回成功信息
 * @param res
 * @param message
 * @returns {*}
 * @private
 */
util.sendSuccess = function(res, message) {
    return res.json({
        status: 1,
        message: message
    });
};
/**
 * 返回失败信息
 * @param res
 * @param message
 * @returns {*}
 * @private
 */
util.sendError = function(res, message) {
    return res.json({
        status: 0,
        message: message
    });
};
/*
 包装request对象
 */
util.getUrlContent = function(options) {
    return Q.nfcall(request, options);
}

/**
 * 字符串的md5
 * @param str
 * @returns {*}
 */
util.createMD5 = function(str) {
    var md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
}
util._apiErrors = function(res, message) {
    return res.json({
        status: 0,
        message: message
    });
};
/**
 * 加载当前环境下的配置文件
 * @param configDir
 * @param baseConfig
 */
util.loadEnvFile = function(configFilePath, config) {
    var env = process.env.NODE_ENV;
    var result = config;
    try {
        result = this.merge(config, require(path.join(configFilePath, 'config.' + env)))
    } catch (e) {
        if (~e.message.indexOf('Cannot find module')) {
            console.error('-************** Unable load to <NODE_ENV> Config. **************-');
        } else {
            throw e;
        }
    }
    return result;
}

util.getLocalIP = function() {
    var interfaces = os.networkInterfaces(),
        addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }
    return (addresses.length > 0) ? addresses[0] : '127.0.0.1';
};
