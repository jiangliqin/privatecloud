var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    util = require('util'),
    nodePath = require('path'),
    nodeUrl = require('url'),
    events = require('events'),
    unzip = require('unzip'),
    Q = require('q'),
    moment = require('moment'),
    z = require('bauer-zip'),
    path = require('path'),
    moment = require('moment');
var logger = process.common.logger;

var Upgrader = function(config) {
    events.EventEmitter.call(this);
    this._init(config);
};

util.inherits(Upgrader, events.EventEmitter);

Upgrader.prototype._init = function(config) {
    this.config = config;
    config.dest = config.dest || './';
    mkdirs(config.dest);
};
Upgrader.prototype.check = function(callback) {

    /* var _self = this,
     config = this.config,
     version = config.version,
     localData = null,
     req = this._getReqest(version.remote);

     callback = callback || function() {};

     try {
     localData = JSON.parse(fs.readFileSync(version.local));
     } catch (e) {}

     req.on('response', function(res) {
     var body = '';

     res.on('data', function(chunk) {
     body += chunk;
     });

     res.on('error', function(err) {
     callback.call(_self, null, null);
     });

     res.on('end', function() {
     var remoteData;
     try {
     remoteData = JSON.parse(body);
     _self.remoteData = remoteData;
     callback.call(_self, localData, remoteData);
     _self.emit('checked', localData, remoteData);
     } catch (e) {
     callback.call(_self, localData, null);
     }
     });
     });

     req.end();*/
};
Upgrader.prototype.download = function(url, callback) {
    var deferred = Q.defer();

    if (typeof url === 'function' || !url) {
        callback = url || function() {
            };
        url = this.config.url;
    }

    callback = callback || function() {
        };

    var _self = this,
        req = this._getReqest(url),
        config = this.config,
        fileName = nodeUrl.parse(url).pathname.split('/').pop();
    this.fileName = fileName;
    var message = '';
    var filePath = nodePath.join(config.dest, fileName);
    var newpath = '';
    //检测本地是否有siteid的zip包
    fs.exists(filePath, function(exists) {
        console.log(exists ? '存' : '不');

        console.log(filePath.split('.')[0]);
        if (exists) {
            console.log(filePath);
            newpath = 'download/file/path/' + filePath.split('/')[3].split('.')[0] + '-' + moment().format('YYYY-MM-DD HH:mm:ss') + '.zip';
            console.log('新' + newpath);
            fs.rename(filePath, newpath, function(e) {
                if (e) {
                    logger.error('重命名失败');
                } else {
                    console.log('done!');
                }
            });
        }
    });
    req.on('response', function(res) {
        var len = parseInt(res.headers['content-length'], 10),
            file = fs.createWriteStream(filePath),
            current = 0,
            count = 0;

        _self.on('downloading', function(len, current) {

            console.log(len + '---' + current);
            if (len === current && count == 0) {
                logger.error('download failed ');
                message = '同步失败';
                //删除同步失败的下载垃圾数据
                fs.unlink(filePath, function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('删除成功');
                    }
                });
                deferred.resolve(message);
            } else {
                count++;
            }

            if (count != 0) {
                message = '正在同步';
            }
        });

        _self.on('downloaded', function(len) {
            message = '同步成功';
            //解压下载正确的zip包
            console.log('全路径' + newpath);
            z.unzip(newpath, path.dirname(filePath), function(error) {
                if (error) {
                    console.error('解压失败' + error);
                } else {
                    //删除解压成功的zip包
                    /* fs.unlink(filePath,function(err){
                     if(err){
                     console.log('删除zip失败');
                     }
                     });*/
                }
            });
            deferred.resolve(message);
        });

        _self.on('downloadError', function(err) {
            return false;
            //删除同步失败的下载垃圾数据
            fs.unlink(filePath, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('删除成功');
                }
            });
            deferred.resolve('同步失败');
        });

        res.on('data', function(chunk) {
            file.write(chunk);
            current += chunk.length;
            _self.emit('downloading', len, current);
        });

        res.on('error', function(err) {
            callback.call(_self, err);
            _self.emit('downloadError', err);
        });

        res.on('end', function() {
            file.end();
            callback.call(_self, len);
            _self.emit('downloaded', len);
        });
    });
    req.end();

    return deferred.promise;

};
Upgrader.prototype.extract = function(delzip, callback) {
    if (typeof delzip === 'function' || typeof delzip === 'undefined') {
        callback = delzip || function() {
            };
        delzip = !!this.config.delzip;
    }

    callback = callback || function() {
        };

    var _self = this,
        dest = this.config.dest,
        extract, filePath, file;

    extract = unzip.Extract({
        path: dest
    });

    extract.on('close', function() {
        if (delzip) {
            fs.unlink(filePath);
        }
        callback.call(_self);
        _self.emit('extracted');
    });

    filePath = nodePath.join(dest, this.fileName);
    file = fs.createReadStream(filePath).pipe(extract);
    this.emit('extract');
};
Upgrader.prototype._getReqest = function(url) {
    var req,
        matcher,
        param;
    if (!url) {
        throw new Error('Download url is required');
    }
    console.log('url值  ' + JSON.stringify(url));
    url = nodeUrl.parse(url);
    matcher = url.protocol.match(/^http[s]?/i);
    param = {
        host: url.host,
        port: url.port || 80,
        path: url.path
    };

    if (matcher && matcher[0] === 'http') {
        req = http.request(param);
    } else if (matcher && matcher[0] === 'https') {
        param.port = url.port || 443;
        req = https.request(param);
    } else {
        throw new Error('Protocol ' + url.protocol + ' is not supported');
    }
    return req;
};

Upgrader.prototype.greaterThan = function(v1, v2) {
    var v1Arr = v1.split('.'),
        v2Arr = v2.split('.'),
        arr = v1Arr,
        value1, value2;

    function prefixInteger(num, len) {
        return (Array(len).join('0') + num).slice(-len);
    }

    if (v1Arr.length < v2Arr.length) {
        arr = v2Arr;
    }
    arr.forEach(function(item, i) {
        var item1 = v1Arr[i] || '0',
            item2 = v2Arr[i] || '0',
            length = Math.max(item1.length, item2.length);
        v1Arr[i] = prefixInteger(item1, length);
        v2Arr[i] = prefixInteger(item2, length);
    });
    return v1Arr.join('.') > v2Arr.join('.');
};

function mkdirs(dirPath, mode, cb) {
    var dirs = dirPath.replace(/\/?[^\/]+\/?/g, '$`$&,').split(',');
    dirs.pop();
    (function next(e) {
        var finished = !dirs.length,
            dir = dirs.shift();
        if (!e) {
            if (dir && !fs.existsSync(dir)) {
                fs.mkdir(dir, mode, next);
            } else if (!finished) {
                next();
            }
        } else {
            throw e;
        }
        if (finished && typeof cb === 'function') {
            cb(e);
        }
    })(null);
}

module.exports = function(config) {
    return new Upgrader(config);
};


