var users = require('../../app/controllers/users');

module.exports = function(app, auth) {
    app.get('/', users.renderUser);

    app.authenticate({
        url: '/user/login',
        failureRedirect: '/signinError',
        failureFlash: true,
        badRequestMessage: '表单填写不全',
        handler: users.userLogin,
        setting: {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: 1,
            callback: users.passportCallback
        }
    });

    app.get('/signinError', users.signinError);
    //返回当前登录用户email
    app.get('/user/getuser',auth.requiresLogin, users.getemail);
    app.get('/signout', auth.requiresLogin, users.signout);
};
