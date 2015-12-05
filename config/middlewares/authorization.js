var utils = process.common.utils;


/**
 * 以后要用到的权限登录
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.user) {
        //return res.redirect('/signin.html');
        return utils.sendError(res, '请登录');
    } else {
        return next();
    }
};
