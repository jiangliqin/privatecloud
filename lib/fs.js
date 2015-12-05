/**!
 * 文件系统操作 工具函数
 * Copyright (c) 2013 Allmobilize Inc
 */

'use strict';

var Q = require('q');
var extra = require('fs-extra');
var util = require('./utils');

var fs = module.exports = util.extend({}, extra);
