var openDB = require('json-file-db'),
    Q = require('q'),
    debug = require('debug')('jsonEditor'),
    logger = process.common.logger,
    uuid = require('uuid'),
    _ = require('lodash'),
    path = require('path'),
    moment = require('moment'),
// fop = require('file-op'),
    fs = require('fs'),
    async = require('async');
var users = openDB(path.join(__dirname, '../', 'db/user.json')),
    sites = openDB(path.join(__dirname, '../', './db/sites.json')),
    utils = require('./utils'),
    logs = openDB(path.join(__dirname, '..', './db/log.json'));

exports.login = function(email, passwd) {
    return Q().then(function() {
        var result = utils.filter(require('../db/user.json'), function(chr) {
            return chr.email === email;
        });
        if (result.length != 0) {
            return result;
        } else {
            throw ('账号不存在')
        }
    })
}
/**
 *
 * @param userid
 */
exports.getuseremail = function(userid) {
    var deferred = Q.defer();
    users.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            var user = utils.filter(data, {'id': userid});
            deferred.resolve(user);
        }

    });
    return deferred.promise;
}
exports.findOne = function(id) {
    var deferred = Q.defer();
    users.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            var flag = utils.filter(data, function(chr) {
                return chr.id === id;
            });
            if (flag) {
                deferred.resolve(flag);
            }
        }
    });
    return deferred.promise;
}

exports.listsites = function(id) {
    var deferred = Q.defer();
    sites.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            var sitearr = utils.filter(data, {'user': id});
            sitearr = utils.sortBy(sitearr, 'createTime');
            deferred.resolve(utils(sitearr).reverse().value());
        }
    });
    return deferred.promise;
}
exports.getlogs = function(id) {
    var deferred = Q.defer();
    logs.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            var sitearr = utils.filter(data, {'user': id});
            sitearr = utils.sortBy(sitearr, 'time');
            deferred.resolve(utils(sitearr).reverse().value());
        }
    });

    return deferred.promise;
}
exports.getsiteinfo = function(id) {
    var deferred = Q.defer();
    sites.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            // var sitearr = data.sites;
            var site = utils.filter(data, {'id': id});
            var name = utils.pluck(site, 'name');
            deferred.resolve(name);
        }

    });
    return deferred.promise;
}

exports.insertsite = function(chunk, userid) {
    chunk = JSON.parse(chunk);
    var deferred = Q.defer();
    var siteobf = {
        name: chunk['name'],
        id: chunk['siteID'],
        user: userid,
        appIcon: chunk['appIcon'],
        webIcon: chunk['webIcon'],
        noconvert: chunk['noconvert'],
        createAt: chunk.createdAt,
        createTime: moment().format('YYYY-MM-DD HH:mm')
    }
    sites.put(siteobf, function(err) {
        deferred.reject(new Error(err));
    });
    deferred.resolve({status: 1, success: true});
    return deferred.promise;
}

exports.authenticate = function(user, passwd) {
    return user[0].password === passwd;
}

exports.insertlog = function(siteid, info) {
    var loginfo = {
        id: siteid,
        synchtime: moment().format('YYYY-MM-DD HH:mm'),
        detail: info
    }
    sites.put(loginfo, function(err) {
        if (err) {
            logger.error('记录日志同步信息失败' + err);
        }
    });

}

exports.failCreate = function(id) {
    var loginfo = {
        id: uuid.v1(),
        user: id,
        time: moment().format('YYYY-MM-DD HH:mm'),
        detail: '创建项目失败'
    }
    logs.put(loginfo, function(err) {
        if (err) {
            logger.error('记录日志失败' + err);
        }
    });
}

exports.converlog = function(id, message) {
    var convert = {
        id: uuid.v1(),
        user: id,
        time: moment().format('YYYY-MM-DD HH:mm'),
        detail: message
    }
    logs.put(convert, function(err) {
        if (err) {
            logger.error('记录日志失败' + err);
        }
    });
}

exports.createlog = function(userid) {
    var loginfo = {
        id: uuid.v1(),
        user: userid,
        time: moment().format('YYYY-MM-DD HH:mm'),
        detail: '创建项目成功'
    }
    logs.put(loginfo, function(err) {
        if (err) {
            logger.error('记录日志失败' + err);
        }
    });
}

exports.downloadlog = function(userid, result) {
    var loginfo = {
        id: uuid.v1(),
        user: userid,
        time: moment().format('YYYY-MM-DD HH:mm'),
        detail: result
    }
    logs.put(loginfo, function(err) {
        if (err) {
            logger.error('记录日志失败' + err);
        }
    });
}


exports.changeconvert = function(siteid, noconvervalue) {
    var deferred = Q.defer();
    sites.get(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            var site = utils.filter(data, {'id': siteid});

            var newsite = {
                id: siteid,
                noconvert: noconvervalue
            }
            sites.put(newsite, function(err) {
                if (err) {
                    logger.error('修改状态失败' + err);
                }

            });
        }

    });
    return deferred.promise;
}

exports.convert = function(noconvervalue, siteid) {
    var phonepath = path.join(__dirname, '../', 'static/' + siteid + '/allmobilize.phone.min.js'),
        minpath = path.join(__dirname, '../', 'static/' + siteid + '/allmobilize.min.js'),
        devpath = path.join(__dirname, '../', 'static/' + siteid + '/allmobilize.dev.min.js'),
        pkgpath = path.join(__dirname, '../', 'static/' + siteid + '/__am_pkg.txt');
    async.each([phonepath, minpath, pkgpath], function(file, callback) {
        fs.exists(file, function(exists) {
            if (exists) {
                fs.readFile(file, {encoding: 'utf8'}, function(error, data) {
                    if (error) {
                        console.error('读取出错' + error);
                    } else {
                        var dataString = String(data.toLocaleString()),
                            index = dataString.indexOf('noconvert') + 10;
                        console.log(dataString.indexOf('noconvert'));
                        var stringdata = dataString.substr(0, index) + noconvervalue + dataString.substr(index + 1);
                        fs.writeFile(file, stringdata, {encoding: 'utf8'}, function(err, data) {
                            if (err) {
                                console.error('写进文件失败');
                            } else {
                                console.log('finishid-written');
                            }
                        });
                    }
                });
            } else {
                console.error('文件不存在');
            }
        });
    });

    async.each([devpath], function(file, callback) {
        fs.exists(file, function(exists) {
            if (exists) {
                fs.readFile(file, {encoding: 'utf8'}, function(error, data) {
                    if (error) {
                        console.error('读取出错' + error);
                    } else {
                        var dataString = String(data.toLocaleString()),
                            index = dataString.indexOf('noconvert') + 11;
                        console.log(dataString.indexOf('noconvert'));
                        var stringdata = dataString.substring(0, index) + noconvervalue + dataString.substring(index + 1);
                        fs.writeFile(file, stringdata, {encoding: 'utf8'}, function(err, data) {
                            if (err) {
                                console.error('写进文件失败');
                            } else {
                                console.log('finishid-written');
                            }
                        });
                    }
                });
            } else {
                console.error('文件不存在');
            }
        });
    });
}


