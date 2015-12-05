var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    logger = require('./lib/logger'),
    utils = require('./lib').utils,
    multer = require('multer'),
    flash = require('connect-flash'),
    router = express.Router(),
    config = require('./config/config'),
    errorhandler = require('errorhandler'),
    fs = require('fs');


var env = process.env.NODE_ENV || 'development';
//注册到全局变量
process.common = {
    config: config,
    utils: utils,
    logger: logger,
    fs: require('./lib').fs
};
var sessionSupport = require('./config/middlewares/session');

var auth = require('./config/middlewares/authorization');

var app = express();
app.set('port', process.env.PORT || config.port);
app.use(multer());
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/qianduan-public'));
app.use(express.static(__dirname + '/static'));
app.use(require('morgan')('dev'));

if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler())
}

//session支持信息
sessionSupport(express, app, {
    cookie: config.session.cookie,
    key: config.session.key,
    secret: config.session.secret
});
require('./config/routes')(app, auth);
// require('./qianduan-public/router.js')(app);
app.listen(app.get('port'), function(err) {
    if (err) {
        logger.error(err);
    } else {
        logger.info('[%s] listening on port %d in  %s mode', config.pkg.name, app.get('port'), app.get('env'));
    }
});
