var _fileData;
var fs = require('./fs'),
    utils = require('./utils');

var Query = function(data) {
    if (!data) {
        throw new Error('data 不能为空');
    }
    _fileData = data;
}
module.exports = Query;
/**
 *  _.find(users, { 'age': 1, 'active': true })
 * @param query
 * @returns {*}
 */
Query.prototype.find = function(query) {
    return utils.filter(_fileData, query);
}
Query.prototype.findOne = function(query) {
    return utils.find(_fileData, query);
}


