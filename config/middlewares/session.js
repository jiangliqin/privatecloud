var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var config = process.common.config,
    logger = process.common.logger;

module.exports = function(express, app, options) {
    // Cookie Setting
    options.cookie = options.cookie;


    /**FileStore options
     *
     path The directory where the session files will be stored. Defaults to ./sessions
     ttl Time to live in seconds. Defaults to 3600
     retries The number of retries to get session data from a session file. Defaults to 5
     factor Defaults to 1
     minTimeout Defaults to 50
     maxTimeout Defaults to 100
     reapInterval Interval to clear expired sessions in seconds or -1 if do not need. Defaults to 1 hour
     reapAsync use distinct worker process for removing stale sessions. Defaults to false
     reapSyncFallback reap stale sessions synchronously if can not do it asynchronously. Default to false
     logFn log messages. Defaults to console.log
     fallbackSessionFn returns fallback session object after all failed retries. No defaults
     */
    app.use(session({
        secret: options.secret,
        store: new FileStore({
            path: config.session.filePath
        }),
        resave: false,
        saveUninitialized: true,
        cookie: options.cookie,
        key: options.key
    }));


    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user[0].id);
    });

    passport.deserializeUser(function(id, done) {
        var findOne = require('../../lib/jsonEditor').findOne;
        findOne(id).then(function(found) {
            return found;
        }).done(function(user) {
            done(null, user);
        }, done);
    });

    app.authenticate = function(options) {
        options.strategy = options.strategy || 'local';
        options.method = options.method || 'POST';
        passport.use(new LocalStrategy(options.setting, options.setting.callback));
        app[options.method.toLowerCase()](options.url, passport.authenticate(options.strategy, {
            failureRedirect: options.failureRedirect,
            failureFlash: options.failureFlash,
            badRequestMessage: options.badRequestMessage
        }), options.handler);
    };
};
