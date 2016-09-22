#! /usr/bin/env node --harmony

const appInfo = require('../package.json')

const program = require('commander')
const color = require('chalk')
const fetch = require('node-fetch');
const jquery = require('jquery')
const env = require('jsdom').env
const rmdir = require('rimraf')

const utils = require('../lib/utils');
const display = require('../lib/display');

program
	.version(appInfo.version)
	// .option('-g, --get <num>', '下载几张图片 小于20')
	.option('-c, --clear', ' 清空下载图片')

program.parse(process.argv)

//////////////////// 清空图片

if (program.clear) {
	clearAll()
}

function clearAll() {
	rmdir(`${utils.home()}\/${utils.imagePath}`, function(err) {
		if (err) {
			console.log(`Error remove : ${utils.home()}\/${utils.imagePath}`);
			return;
		} else {
			console.log('美女图片删除干净，可以安心写代码了');
			return;
		}
		process.exit()
	});
}

///////////////////// 下载展示

var getNum = program.get || 20

if (!program.clear) { getBaiduImage(getNum) }

function getBaiduImage(keyword, num) {

	var cid = getRandomInt(0, 5)
		page = getRandomInt(0, 1000)
	var url = `http://www.dbmeinv.com/dbgroup/show.htm?cid=${cid}&pager_offset=${page}`

	fetch(url)
		.then((res) => {
			return res.text()
		}).then((body) => {
			parseHtmlPage(body)
		});
};

function getRandomInt (fromNum, toNum) {
	var ttt = toNum - fromNum;
	var randomNumber = Math.random() * ttt
	return fromNum + Math.floor(randomNumber)
}

function parseHtmlPage (html) {

	env(html, (errors, window) => {
		if (errors) {
			console.log(errors)
		}

		var dom = jquery(window)('img')
		var girls = []

		for (var i = 0; i < dom.length; i++) {
			var url = dom[i]['src']
			if (url) { girls.push(url) }
		}

		if (dom.length < 5) {
			getBaiduImage(getNum)
		} else {
			display.images(girls, Math.min(getNum, dom.length))
		}
	})

}
