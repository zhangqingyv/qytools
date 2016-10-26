'use strict';

var path = require('path');
var fs = require('fs');
var program = require('commander');

var root;
if (process.platform === 'win32') {
  root = process.env.USERPROFILE || process.env.APPDATA || process.env.TMP || process.env.TEMP;
} else {
  root = process.env.HOME || process.env.TMPDIR || '/tmp';
}

var config = module.exports = {
	dpPodspecFileName : 'DPOverseas.podspec',
	mtPodspecFileName : 'MTOverseas.podspec',
	mtCIBuildPage : 'http://ios.ci.sankuai.com/job/component-admittance-test/build?delay=0sec'
};
