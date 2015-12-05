var Q = require('q'),
    url = require('url'),
    paths = require('path'),
    config = process.common.config,
    logger = process.common.logger,
    request = require('request'),
    querystring = require('querystring'),
    moment = require('moment'),
    os = require('os'),
    path = require('path'),
    http = require('http'),
    utils = process.common.utils,
    fs = process.common.fs,
    async = require('async'),
    z = require('bauer-zip'),
    jsonfile = require('../../lib/jsonEditor'),
    paginate = require('../../lib/paginate'),
    md5File = require('md5-file'),
    unzip = require('unzip');


//显示 allmobilize.min.js 的路径地址
var allmobilizeJs = path.join(__dirname, '../../static/allmobilize.min.js');
if (fs.existsSync(allmobilizeJs)) {
    logger.info('引用js路径为: http://' + utils.getLocalIP() + ':' + config.port + '/allmobilize.min.js ');
}

/**
 * 用户增加siteID,返回sites文档对应的信息
 */
exports.getsiteinfo = function(req, res) {
    var id = req.query.id.trim();
    var getsiteinfo = jsonfile.getsiteinfo;
    getsiteinfo(id).then(function(result) {
        res.send({status: 1, name: result[0]});
    }).done();
}

/**
 * 得到当前用户的site列表
 * @param req
 * @param res
 * @returns {*}
 */
exports.getSiteList = function(req, res) {
    var sites = jsonfile.listsites;
    sites(req.user[0].id).then(function(result) {
        var list = utils.map(result, function(obj) {
            return {
                name: obj.name,
                siteID: obj.id,
                synchtime: obj.synchtime,
                info: obj.detail,
                noconvert: obj.noconvert,
                appIcon: obj.appIcon,
                webIcon: obj.webIcon
            }
        });
        res.send(list);
    }).catch(function(err) {
        res.send(err);
    }).done();
}


var downloadFile = function(siteID) {
    var defer = Q.defer();
    var url = 'http://a.yunshipei.com/' + siteID + '/' + siteID + '.zip';

    var filePath = path.join(__dirname, '../../', 'download');
    var staticFilePath = path.join(__dirname, '../../static');

    var fileName = utils.getDateParticularTime('YYYY-MM-DD-HH-mm-ss');

    var zipName = fileName + '.zip';

    var md5Name = siteID + '.md5';

    fs.ensureDirSync(filePath);

    var zipPath = path.join(filePath, zipName);
    var md5Path = path.join(filePath, md5Name);

    var writeStream = fs.createWriteStream(zipPath);

    writeStream.on('finish', function() {
        var unzipFile = function(newMD5, callback) {
            z.unzip(zipPath, staticFilePath, function(err) {
                if (err) {
                    callback(err);
                }
              /*  var oldFileName = path.join(staticFilePath, siteID);
                var newFileName = path.join(staticFilePath, 'static');
                fs.deleteSync(newFileName);
                fs.renameSync(oldFileName, newFileName);*/
                fs.writeFileSync(md5Path, newMD5);
                callback(null);
            });
        }
        Q.nfcall(md5File, zipPath)
            .then(function(newMD5) {
                var md5Exists = fs.existsSync(md5Path);
                //以前已经存有md5
                if (md5Exists) {
                    //读取现有的md5
                    var oldMD5 = fs.readFileSync(md5Path);
                    if (oldMD5 == newMD5) {
                        //如果没有更新删除下载好的文件
                        fs.deleteSync(zipPath);
                        defer.resolve({
                            status: 1,
                            msg: '同步成功,文件没有更新'
                        });
                    } else {
                        //有更新,更新文件
                        unzipFile(newMD5, function() {
                            defer.resolve({
                                status: 1,
                                msg: '同步成功,文件更新成功'
                            });
                        })
                    }
                } else {
                    //重新创建文件
                    unzipFile(newMD5, function() {
                        defer.resolve({
                            status: 1,
                            msg: '同步成功'
                        });
                    })
                }
            }).catch(function(err) {
                defer.reject(err);
            })
            .done();
    })
    request
        .get(url)
        .on('response', function(response) {
            if (response.statusCode != 200) {
                //删除同步失败的下载垃圾数据
                fs.unlink(zipPath,function(err){
                    if(err){
                        console.error(err);
                    }else{
                        console.log('删除成功');
                    }
                });
                defer.reject(new Error('访问出错 ' + response.statusCode));
            }
        })
        .on('error', function(err) {
            defer.reject(err);
        })
        .pipe(writeStream);
    return defer.promise;
}

/**
 * 下载yunshipei官网zip包
 * @param req
 * @param res
 * @param next
 */
exports.download = function(req, res, next) {
    var siteid = req.query.siteid,
        userid = req.user[0].id;
    downloadFile(siteid)
        .then(function(result) {
            jsonfile.insertlog(siteid, result.msg);//将必要信息写进sites.json中
            jsonfile.downloadlog(userid, result.msg);//在log.json中记录相关日志

            res.send(result)
        })
        .catch(function(err) {
            logger.error(err.message);
            if(err.message == '访问出错 404'){
                err.message = '同步失败';
            }

            jsonfile.insertlog(siteid, err.message);//将必要信息写进sites.json中
            jsonfile.downloadlog(userid, err.message);//在log.json中记录相关日志
            res.send({
                stauts: 0,
                msg: err.message
            })
        })
        .done();
}
/**
 * 从platform中根据siteid拿到site相关信息
 * @param req
 * @param res
 */
exports.createSite = function(req, res) {
    var siteid = req.body.id,
        userid = req.user[0].id;
    Q.nfcall(request, {
        method: "GET",
        url: config.URL.PLATFORM + 'p/sites/getSiteInfo/' + siteid
    })
        .then(function(result) {
            var response = result[0];
            var body = result[1];
            if (response.statusCode != 200) {
                throw new Error('地址错误');
            }
            var obj = JSON.parse(body);
            if (obj.status == 0) {
                throw new Error(obj.message);
            }
            jsonfile.insertsite(body, userid);
            // 将创建site成功写进log.json文件
            jsonfile.createlog(userid);
            res.send(obj);
        }).catch(function(err) {
            jsonfile.failCreate(userid);
            utils.sendError(res, err.message);
        })
        .done();

}
/**
 * 修改适配的状态
 * @param req
 * @param res
 */
exports.noconvert = function(req, res) {
    var siteid = req.body.id,
        noconvervalue = req.body.convalue;
    request.post({
        url: config.URL.PLATFORM + 'p/sites/noconvert/' + siteid,
        form: {
            message: '更改noconvert',
            noconvert: noconvervalue
        }
    },function(err, response, body){

        if(err){
            jsonfile.converlog(req.user[0].id,'修改失败');
            return res.send({status:0,message:'修改失败'});
        }else if (response.statusCode === 200) {

            if (body == 'error id'+siteid) {
                jsonfile.converlog(req.user[0].id, '修改失败');
                return res.json({
                    status: 0,
                    message: 'siteID不存在,修改失败'
                })
            } else {
                //写进日志
                jsonfile.converlog(req.user[0].id, '修改成功');
                //更改sites.json中noconvert状态
                jsonfile.changeconvert(siteid, noconvervalue);
                //更改下载的zip包中noconvert值
                jsonfile.convert(noconvervalue, siteid);
                return res.json(JSON.parse(body));
            }
        }
    });
}
/**
 * 检测域名是否合法
 * @param req
 * @param res
 */
exports.hostDetect = function(req, res) {
    var host = req.query.host;
    async.retry(5, function(callback) {
        request.get({
            url: 'http://' + host,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1941.3 Safari/537.36 (compatible; Allmobilize Spider/2.1; +http://www.yunshipei.com/bot.html)'
            },
            followAllRedirects: false,
            followRedirect: false,
            timeout: 5 * 1000,
            encoding: false
        }, function(err, response, body) {
            if (err) {
                return callback(new Error('网站无法打开'));
            } else if (response.statusCode === 200) {
                return callback();
            } else if ((response.statusCode === 302) || (response.statusCode === 301)) {
                return callback(null, response.headers.location);
            } else {
                return callback(new Error('网站无法打开'));
            }
        });
    }, function(err, result) {
        if (err) {
            //写进日志
            jsonfile.failCreate(req.user[0].id);
            return res.send({satus: 0, message: '网站无法打开'});
        }
        return res.send({status: 1, message: '网站合法'});
    });
}
/**
 * 获得当前用户所有操作日志
 * @param req
 * @param res
 */
exports.getlogs = function(req, res) {
    var userid = req.user[0].id,
        thispage = req.query.page;
    var getlogs = jsonfile.getlogs;
    getlogs(userid).then(function(result) {
        var deferred = Q.defer();

        var list = utils.map(result, function(obj) {
            return {
                time: obj.time,
                detail: obj.detail
            }
        });

        thispage = (thispage < 0 || thispage > list.length) ? 1 : thispage;
        var loglist = list.slice((thispage - 1) * 15, thispage * 15);
        var Paginate = new paginate(loglist, 15, list.length);
        res.send(Paginate);
        return deferred.promise;
    }).done();
}
/**
 * 检测适配服务器的连接状态
 * @param req
 * @param res
 */
exports.hostTest = function(req, res) {
    var options = {
        hostname: 'platform.yunshipei.com',
        method: 'GET'
    }
    var request = http.request(options, function(response) {
        res.send('连接正常');
    });
    request.on('error', function(e) {
        res.send('连接中断');
    });
    request.end();
}
/**
 * 返回log日志条数
 * @param req
 * @param res
 */
exports.logCount = function(req, res) {
    var page = req.param('page') > 0 ? req.param('page') : 1,
        perPage = config.PERPAGE;
    var userid = req.user[0].id;
    var getlogs = jsonfile.getlogs;
    getlogs(userid).then(function(result) {
        return res.send({
            count: result.length,
            perPage: perPage
        });
    }).done();
}


