var utils = process.common.utils,
    config = process.common.config,
    uuid = require('uuid'),
    moment = require('moment'),
    Q = require('q'),
    crypto = require('crypto'),
    jsonfile = require('../../lib/jsonEditor');


exports.renderUser = function(req, res) {
    if (!req.user) {
        return res.redirect('/index.html');
    }
    res.redirect('/sites.html');
}


exports.passportCallback = function(req, email, password, done) {
    var email = req.body.email,
        passwd = utils.createMD5(req.body.password),
        login = jsonfile.login;
    login(email, passwd).done(function(user) {
        if (user.length == 0) {
            return done(null, false, {
                message: '账号不存在'
            });
        } else if (jsonfile.authenticate(user, passwd)) {
            return done(null, user);
        } else {
            return done(null, false, {message: '密码不匹配'});
        }
    }, done);
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.userLogin = function(req, res) {
    var user = req.user;
    return utils.sendSuccess(res, '登录成功');
}
/**
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.signinError = function(req, res) {
    return res.json({
        status: 0,
        message: req.flash('error')[0]
    });
}
exports.getemail = function(req, res) {
    jsonfile.getuseremail(req.user[0].id).then(function(result) {
        return res.send({user: result[0].email});
    }).done();
}
/**
 *
 * @param req
 * @param res
 */
exports.signout = function(req, res) {
    delete req.user;
    req.logout();
    res.redirect('/signin.html');
    // res.send({status: 1, message: '用户已登出'});
}
