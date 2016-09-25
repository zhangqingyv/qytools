#! /usr/bin/env node --harmony

const appInfo = require('../package.json')
const utils = require('../lib/utils');

const program = require('commander')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

const path = require('path')
const url = require('url')

const publishUrl = 'http://www.caoliulala.com/index.php' // 发布页请求
const PATH_DIR = require('path').join(utils.home(), 'Downloads/cl1024');

var ROOT_URL, // 1024地址， 形式比如： http://cl.comcl.org
	START_URL
const FID = {
	technique: 7, //技术讨论区
	portrait: 8, // 新时代的我们
	movie: 22, // 在线小电影
	photo: 16, //达盖尔
	literature: 20 // 文学
}

program
	.version(appInfo.version)
	.option('-o, --open', '找到可用地址并用默认浏览器打开网址')
	.option('-t, --today', '查看今日主题')
	.option('-c, --code', '显示找到的伪码')

program.parse(process.argv)

startMain()

//crawPage ('http://cl.gfhyu.com/htm_data/7/1301/842247.html')	//测试验证码抓取

/// 开始主流程
function startMain() {
	get1024url()
		.then((url1024) => {
			if (program.open) {
				utils.open(url1024)
				process.exit()
			}

			ROOT_URL = path.parse(url1024).dir
			var search = '&search=today'
			START_URL = url.resolve(ROOT_URL, `thread0806.php?fid=${FID.technique}${search}`)
			return crawerList(START_URL)
		})
		.then((briefs) => {
			var today = utils.getToday()
			var todayBriefs = briefs
				.filter((item) => {
					//TODO 除此功能还要 加上黑名单功能
					return today == item.create
				})
			console.log(todayBriefs)
			if (program.today) {
				process.exit()
			}
			return crawPage(todayBriefs[0].url)
		})
		.then((fakes) => {
			if (program.code) {
				process.exit()
			}

			if (!fakes.length) {
				startMain()
				return;
			}
			//TODO
		})
		.catch((error) => {
			console.log(error)
			ROOT_URL = ''
		})

	/*
	registe('hehe123qwe', 'hehe123qwe', '1390557546%40qq.com', 'd68f028abe9e5ef3', (success) => {
		if (success) {

			process.exit()
		}
	})
	 */
}

//////////////////////////////////// 从发布页获取地址 ////////////////////////////////////

function get1024url() {
	return new Promise((resolve, reject) => {
		if (ROOT_URL) {
			console.log(`****** 可用地址：${ROOT_URL} ******`)
			resolve(url.resolve(ROOT_URL, 'index.php'))
			return
		}
		console.log('****** 正在从发布页获取可用地址 ******')
		fetch(publishUrl)
			.then((res) => {
				console.log(`****** 获取到可用地址：${res.url} ******`)
				resolve(res.url)
			}, (error) => {
				console.log(error)
				reject(error)
			})
	})
}

//////////////////////////////////// 爬文章 ////////////////////////////////////

function crawerList(listUrl) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在爬取列表页：${listUrl} ******`)
		fetch(listUrl)
			.then((res) => {
				return res.text()
			}, (error) => {
				console.log(error)
				reject(error)
			})
			.then((body) => {
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

				resolve(briefs)
			})
	})

}

/// 爬取页面内容 -> codes
function crawPage(detailUrl) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在爬取页面 ${detailUrl} ******`)
			// var fakeRegExp = /(\W|\u8bf7|\u7801|^)([0-9a-f\u4e00-\u9fa5\\*\@\￥\$]{16})(\W|[\u4e00-\u9fa5])/g // 貌似不太可能有中文
		var fakeRegExp = /(\W|[\u4e00-\u9fa5]|^)([0-9a-f\\*\@\￥\$]{16})(\W|[\u4e00-\u9fa5])/g
		fetch(detailUrl)
			.then((res) => {
				return res.text()
			}, (error) => {
				console.log(error)
				reject(error)
			})
			.then((body) => {
				console.log(`****** 正在查找可能的邀请码 ******`)
				var fakes = []
				var $ = cheerio.load(body)
				$(body).text()
					.split('\n')
					.filter((line) => {
						return line.length >= 16
					})
					.forEach((item) => {
						var result = item.match(fakeRegExp)
						if (!result) {
							return
						}
						// console.log('----------------------------')
						// console.log(item + '\n' +result)
						fakes = fakes
							.concat(result)
							.filter((str) => {
								if (!str) {
									return false
								}
								return str.includes('a') || str.includes('b') || str.includes('c') || str.includes('d') || str.includes('e') || str.includes('f')
							})
							.map((str) => {
								if (str.length < 18) {
									str.substring(0, 16)
								}
								return str.substring(1, 17)
							})
					})

				if (fakes.length) {
					console.log(`****** 找到${fakes.length}个可能的验证码 ******`)
					console.log(fakes)
				} else {
					console.log('****** 什么码都没有找到 ******')
				}
				resolve(fakes)
			})
	})
}

/// 注册
function registe(user, pwd, email, code) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在利用邀请码：${code} 注册 ******`)
		var registeUrl = url.resolve(ROOT_URL, 'register.php?')
		fetch(registeUrl, {
				method: 'POST',
				body: `regname=${user}&regpwd=${pwd}&regpwdrepeat=${pwd}&regemail=${email}&invcode=${code}&forward=&step=2`,
				headers: {
					'Cookie': ' __utma=101733331.362123468.1474690364.1474690364.1474690364.1; __utmb=101733331.1.10.1474690364; __utmc=101733331; __utmt=1; __utmz=101733331.1474690364.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); 227c9_lastfid=0; 227c9_lastvisit=0%091474690360%09%2Fregister.php%3F; __cfduid=d6d2ccd60f08656c453bf9e1eae7b48e91474690360',
					'DNT': 1,
					'Accept-Language': 'en-us',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0'
				}
			})
			.then((res) => {
				return res.text()
			}, (error) => {
				reject(error)
			})
			.then((body) => {
				var $ = cheerio.load(body)
				var dom = $('tr[class="f_one"]').text()
				if (dom.includes('錯誤!')) {
					console.log(`邀請碼錯誤! ： ${code}`)
					resolve(false)
				} else {
					console.log(`邀請碼成功？： ${code}`)
					resolve(true)
				}
			})
	})

}
