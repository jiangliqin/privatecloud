//var LocalStrategy = require('passport-local').Strategy;
var loadModel = require('platform-model').loadModel;
var AdminModel = loadModel('account.Admin');
var UserModel = loadModel('account.User');
var fs = require('platform-common').fs;
var utils = process.common.utils;
module.exports.call = function(req, email, password,done){

    console.log(1111111111);
    
     email = email.toLocaleLowerCase();
     password = password.toLocaleLowerCase();
     var dbjson = JSON.parse(fs.readFileSync('././././db.json'));
     if(dbjson.users.email === email){
        if(dbjson.users.password !== password){
            return done(null, false, {
                    message: '帐号不存在'
                });
          /* var data ={
            status: 0,
            message: '密码不匹配'
           }
           return data;*/
         /* done(null, false, {
                    message: '密码或账号错误'
                });*/
        }else{
             return done(null, false, {
                    message: '帐号不存在'
                });
           // return {status: 1, message: '登录成功'};
            //done(null, req.body.user);
        }
     }else{
        return done(null, false, {
                    message: '帐号不存在'
                });
       // return {status: 0, message: '账号不存在'};
       /* done(null, false, {
                    message: '帐号不存在'
                });*/
     }
}
module.exports.callback = function (req, email, password, done) {
    email = email.toLocaleLowerCase();
    if (req.body.admin) {
        AdminModel.findOne('email', email).done(function (admin) {
            if (!admin) {
                return done(null, false, {
                    message: '帐号不存在'
                });
            }
            if (!admin.authenticate(password)) {
                return done(null, false, {
                    message: '密码或账号错误'
                });
            }
            if (admin.status == 30) {
                return done(null, false, {
                    message: '账号被禁用'
                });
            }
            return done(null, admin);
        }, function (err) {
            return done(err);
        });
    } else {
        UserModel.findOne('email', email).done(function (user) {
            if (!user) {
                return done(null, false, {
                    message: 'Email不存在'
                });
            }
            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: '密码错误'
                });
            }
            if (user.status == 10) {
                return done(null, false, {
                    message: '账号未激活'
                });
            }
            if (user.status == 30) {
                return done(null, false, {
                    message: '账号被禁用'
                });
            }
            return done(null, user);
        }, function (err) {
            return done(err);
        })
    }
}
