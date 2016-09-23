#! /usr/bin/env node --harmony

const appInfo = require('../package.json')
const utils = require('../lib/utils');

const program = require('commander')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

const path = require('path')
const url = require('url')

const publishUrl = 'http://www.caoliulala.com/index.php'	// 发布页请求
const PATH_DIR = require('path').join(utils.home(), 'Downloads/cl1024');

var ROOT_URL,		// 1024地址， 形式比如： http://cl.comcl.org
	START_URL
const FID = {
	technique: 7,	//技术讨论区
	portrait: 8,	// 新时代的我们
	movie: 22,		// 在线小电影
	photo: 16,	//达盖尔
	literature: 20	// 文学
}

program
	.version(appInfo.version)
	.option('-t, --today', '查看今日主题')
program.parse(process.argv)

get1024url()
	.then((url1024) => {
		ROOT_URL = path.parse(url1024).dir
		var search = ''
		if (program.today) {
			search = '&search=today'
		}
		START_URL = url.resolve(ROOT_URL, `thread0806.php?fid=${FID.technique}${search}`)
		crawerList(START_URL, (briefs) => {
			var today = getToday()
			console.log(briefs.filter((item) => {
				if (program.today) {
					return today == item.create
				}
				return true
			}))

		})
	})

//////////////////////////////////// 从发布页获取地址 ////////////////////////////////////

function get1024url() {
	return new Promise((resolve, reject) => {
		fetch(publishUrl)
			.then((res) => {
				resolve(res.url)
			}, (error) => {
				console.log(error)
				reject(error)
			})
	})
}

//////////////////////////////////// 爬文章 ////////////////////////////////////

function crawerList (listUrl, handler) {
	fetch(listUrl)
		.then(res => {
			return res.text()
		})
		.then(body => {
			var $ = cheerio.load(body)
			var dom = $('tr[class="tr3 t_one"]')

			var briefs = []
			$(dom).each((i, elem) => {
				var brief = {}
				var a = $('h3', elem).children('a')
				brief.url = url.resolve(ROOT_URL, $(a).attr('href'))
				brief.title = $(a).text()
				brief.author = $('a[class=bl]', elem).text()
				brief.create = $('div[class=f10]', 'td[class="tal y-style"]', elem).text()
				briefs.push(brief)
			})

			handler(briefs)
		}, (error) => {
			console.log(error)
		})
}

function getToday() {
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	// 例子：
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
	Date.prototype.Format = function (fmt) { //author: meizz
	    var o = {
	        "M+": this.getMonth() + 1, //月份
	        "d+": this.getDate(), //日
	        "h+": this.getHours(), //小时
	        "m+": this.getMinutes(), //分
	        "s+": this.getSeconds(), //秒
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
	        "S": this.getMilliseconds() //毫秒
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
	}

	return new Date().Format("yyyy-MM-dd");
}

