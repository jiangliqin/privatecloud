var fs = require('fs'),
    utils = process.common.utils,
    routes_path = __dirname;

module.exports = function(app, auth) {
    utils.blockHiddenFile(fs.readdirSync(routes_path)).forEach(function(file) {
        var absoluteFilePath = routes_path + '/' + file;
        require(absoluteFilePath)(app, auth);
    });
};
