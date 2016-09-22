#! /usr/bin/env node --harmony

const appInfo = require('../package.json')

const program = require('commander')
const color = require('chalk')
const fetch = require('node-fetch');
const rmdir = require('rimraf')
const cheerio = require('cheerio')

const utils = require('../lib/utils');
const display = require('../lib/display');

program
	.version(appInfo.version)
	.option('-g, --get <num>', '下载几张图片 小于20')
	.option('-c, --clear', ' 清空下载图片')

program.parse(process.argv)

//////////////////// 清空图片 ////////////////////

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

///////////////////// 下载并展示 /////////////////////

var getNum = program.get || 20

if (!program.clear) { getGirlsImage(getNum) }

function getGirlsImage(keyword, num) {

	var cid = utils.getRandomInt(0, 5)
		page = utils.getRandomInt(0, 1000)
	var url = `http://www.dbmeinv.com/dbgroup/show.htm?cid=${cid}&pager_offset=${page}`

	fetch(url)
		.then((res) => {
			return res.text()
		}).then((body) => {
			parseHtmlPage(body)
		});
};

function parseHtmlPage (html) {

	var $ = cheerio.load(html)

	var dom = $('img')
	var girls = []

	dom.each((i, elem) => {
		var url = $(elem).attr('src')
		if (url) { girls.push(url) }
	})

	if (dom.length < 5) {
			getGirlsImage(getNum)
	} else {
		display.images(girls, Math.min(getNum, dom.length))
	}
}
