
'use strict';

var common = module.exports;
common.utils = require('./utils'); // 工具类 基于lodash 内建util模块.
common.log = require('./log');  // 日志扩展  基于Winston
common.fs = require('./fs');  // 文件系统工具类 基于FS-EXTRA