#! /usr/bin/env node --harmony

const appInfo = require('../package.json')

const program = require('commander')
const fetch = require('node-fetch')

const utils = require('../lib/utils');

// 发布页请求
const publishUrl = 'http://www.caoliulala.com/index.php'

program
	.version(appInfo.version)
	.option('-g, --get <num>', '下载几张图片 小于20')
	.option('-c, --clear', ' 清空下载图片')

program.parse(process.argv)

get1024url()
	.then((url) => {
		utils.open(url)
	})

//////////////////////////////////// 从发布页获取地址 ////////////////////////////////////

function get1024url() {
	return new Promise((resolve, reject) => {
		fetch(publishUrl)
			.then((res) => {
				console.log(res.url)
				resolve(res.url)
			}, (error) => {
				console.log(error)
				reject(error)
			})
	})
}
