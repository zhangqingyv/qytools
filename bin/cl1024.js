#! /usr/bin/env node --harmony

const appInfo = require('../package.json')
const utils = require('../lib/utils');

const program = require('commander')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fsextra = require('fs-extra');
const inquirer = require('inquirer');
const color = require('chalk')

const path = require('path')
const url = require('url')

const publishUrl = 'http://www.caoliulala.com/index.php' // 发布页请求
var ROOT_URL, // 1024地址， 形式比如： http://cl.comcl.org
	START_URL
const FID = {
	technique: 7, //技术讨论区
	portrait: 8, // 新时代的我们
	movie: 22, // 在线小电影
	photo: 16, //达盖尔
	literature: 20 // 文学
}

const ERR_FIND_NO_CODE = 'find no codes even fakes',
	ERR_NO_CORRECT_CODE = 'no code is correct'

program
	.version(appInfo.version)
	.option('-o, --open', '找到可用地址并用默认浏览器打开网址')
	.option('-t, --today', '查看今日主题')
	.option('-c, --cookies <cookies>', '设置cookes,IP限制后需要重设 cookies')
	.option('-s, --settings', '配置注册相关信息')
	.parse(process.argv)

const cl1024FilePath = require('path').join(utils.home(), 'Downloads/cl1024.json');
var clInfo
try {
	clInfo = require(cl1024FilePath)
} catch (err) {
	clInfo = {}
}
const pageWhiteList = new Set(clInfo.pageWhiteList || [])
const pageBlackList = new Set(clInfo.pageBlackList || [])
const codeWhiteList = new Set(clInfo.codeWhiteList || [])
const codeBlackList = new Set(clInfo.codeBlackList || [])

const userName = clInfo.userName,
	userPwd = clInfo.userPwd,
	userEmail = clInfo.userEmail,
	cookies = clInfo.cookies || ''

if (program.cookies) {
	cookiesSetting()
} else if (program.settings || !userName || !userPwd || !userEmail) {
	settings()
} else {
	startMain()
}

/// 开始主流程
function startMain() {
	get1024url()
		.then((url1024) => {
			if (program.open) {
				utils.open(url1024)
				process.exit()
			}

			ROOT_URL = path.parse(url1024).dir
			START_URL = url.resolve(ROOT_URL, `thread0806.php?fid=${FID.technique}`)
			if (program.today) {
				START_URL = START_URL + '&search=today'
			} else if (pageWhiteList.size) {
				return Array.from(pageWhiteList).shift()
			}
			return crawerList(START_URL)
		})
		.then((briefs) => {

			if (!briefs.length) {
				console.log('可能进行性 IP 限制访问，请执行 cl1024 -c 设置 cookies 后重试....')
				process.exit()
			}

			if (program.today) {
				var today = utils.getToday()
				var todayBriefs = briefs
					.filter((item) => {
						return today == item.create && !pageBlackList.has(item.url)
					})
				console.log(todayBriefs)
				process.exit()
			}

			if (typeof briefs == 'string') {
				return crawPage(briefs)
			}

			briefs
			.filter(item => !pageBlackList.has(item.url))
			.forEach(item => pageWhiteList.add(item.url))

			var pageUrl
			if (pageWhiteList.size) {
				pageUrl = Array.from(pageWhiteList).shift()
				saveClInfoFile()
			} else {
				pageUrl = briefs.shift().url
			}
			return crawPage(pageUrl)
		})
		.then((fakes) => {
			if (pageWhiteList.size) {
				var pageUrl = Array.from(pageWhiteList).shift()
				pageWhiteList.delete(pageUrl)
				pageBlackList.add(pageUrl)
				saveClInfoFile()
			}

			if (!fakes.length) {
				throw new Error(ERR_FIND_NO_CODE)
			}

			var requests = []
			getPosiableCodes(fakes)
				.filter((code) => {
					return !codeBlackList.has(code)
				})
				.forEach((code) => {
					codeWhiteList.add(code)
					saveClInfoFile()
					requests.push(registe(userName, userPwd, encodeURIComponent(userEmail), code))
				})
			return Promise.all(requests)
		})
		.then((results) => {
			if (results && results.indexOf(true) > -1) {
				console.log('注册成功啦！')
			} else {
				throw new Error(ERR_NO_CORRECT_CODE)
			}
		})
		.catch((error) => {
			if (error.message == ERR_FIND_NO_CODE
				|| error.message == ERR_NO_CORRECT_CODE) {
				console.log(`****** ${error.message} ******`)
			} else {
				console.log(error)
				ROOT_URL = ''
			}
			setTimeout(startMain,2000);
		})
}

function saveClInfoFile() {
	clInfo.pageWhiteList = Array.from(pageWhiteList)
	clInfo.pageBlackList = Array.from(pageBlackList)
	clInfo.codeWhiteList = Array.from(codeWhiteList)
	clInfo.codeBlackList = Array.from(codeBlackList)
	fsextra.outputJson(cl1024FilePath, clInfo, (err) => {
		if (err) {
			console.log(err)
		}
	})
}

//////////////////////////////////// 从发布页获取地址 ////////////////////////////////////

function get1024url() {
	return new Promise((resolve, reject) => {
		if (ROOT_URL) {
			console.log(`****** 可用地址：${url.resolve(ROOT_URL, 'index.php')} ******`)
			resolve(url.resolve(ROOT_URL, 'index.php'))
			return
		}
		console.log('****** 正在从发布页获取可用地址 ******')
		fetch(publishUrl, {
				headers: {
					'Cookie': cookies,
					'DNT': 1,
					'Accept-Language': 'en-us',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0'
				}
			})
			.then((res) => {
				console.log(`****** 获取到可用地址：${res.url} ******`)
				resolve(res.url)
			}, (error) => {
				reject(error)
			})
	})
}

//////////////////////////////////// 爬文章 ////////////////////////////////////

function crawerList(listUrl) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在爬取列表页：${listUrl} ******`)
		fetch(listUrl, {
				headers: {
					'Cookie': cookies,
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
				var dom = $('tr[class="tr3 t_one"]')

				var briefs = []
				$(dom).each((i, elem) => {
					var brief = {}
					var a = $('h3', elem).children('a')
					brief.url = url.resolve(ROOT_URL, $(a).attr('href'))
					if (!brief.url.includes('htm_data')) {
						return
					}
					brief.title = $(a).text()
					brief.author = $('a[class=bl]', elem).text()
					brief.create = $('div[class=f10]', 'td[class="tal y-style"]', elem).text()
					briefs.push(brief)
				})

				resolve(briefs)
			})
	})

}

//////////////////////////////////// 爬取页面内容 -> codes ////////////////////////////////////
function crawPage(detailUrl) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在爬取页面 ${detailUrl} ******`)
			// var fakeRegExp = /(\W|\u8bf7|\u7801|^)([0-9a-f\u4e00-\u9fa5\\*\@\￥\$]{16})(\W|[\u4e00-\u9fa5])/g // 貌似不太可能有中文
		var fakeRegExp = /(\W|[\u4e00-\u9fa5]|^)([0-9a-f\\*\@\￥\$]{16})(\W|[\u4e00-\u9fa5])/g
		fetch(detailUrl, {
				headers: {
					'Cookie': cookies,
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

//////////////////////////////////// 获取需要尝试的所有密码 ////////////////////////////////////
function getPosiableCodes(fakes) {
	var posiableCodes = []
	const codeRegx = /([0-9a-f]{16})/
	fakes.forEach((fake) => {
		if (codeRegx.test(fake)) {
			posiableCodes.push(fake)
			return
		}
		['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
		.forEach((ch) => {
			posiableCodes.push(fake.replace(/[^0-9a-f]/g, ch))
		})
	})
	return posiableCodes
}

//////////////////////////////////// 注册 ////////////////////////////////////
function registe(user, pwd, email, code) {
	return new Promise((resolve, reject) => {
		console.log(`****** 正在利用邀请码：${code} 注册 ******`)
		var registeUrl = url.resolve(ROOT_URL, 'register.php?')

		fetch(registeUrl, {
				method: 'POST',
				body: `regname=${user}&regpwd=${pwd}&regpwdrepeat=${pwd}&regemail=${email}&invcode=${code}&forward=&step=2`,
				headers: {
					'Cookie': cookies,
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
					codeWhiteList.delete(code)
					codeBlackList.add(code)
					saveClInfoFile()
					resolve(false)
				} else {
					console.log(`邀請碼成功？： ${code}`)
					resolve(true)
				}
			})
	})
}

//测试验证码抓取
//crawPage ('http://cl.gfhyu.com/htm_data/7/1301/842247.html')

function settings() {
	inquirer.prompt(getAskQuestions())
		.then((answers) => {
			clInfo.userName = userName = answers.name
			clInfo.userPwd = userPwd = answers.password
			clInfo.userEmail = userEmail = answers.email
			saveClInfoFile()
			console.log(color.green('设置成功!! 运行 cl1024 可以进行抢码了！'));
		}, (error) => {
			console.log(color.red('出错啦....'));
		})
}

function getAskQuestions() {
	var askQuesArr = []

	// 注册用户名
	if (!userName) {
		askQuesArr.push({
			type: 'input',
			name: 'name',
			message: '请输入注册用户名，中文格式可能会有问题',
			validate: function(input) {
				if (!input) {
					return '账号不能为空';
				}
				return true;
			}
		})
	}

	// 注册用户密码
	if (!userName) {
		askQuesArr.push({
			type: 'input',
			name: 'password',
			message: '注册密码',
			validate: function(input) {
				if (!input) {
					return '密码不能为空';
				}
				return true;
			}
		})
	}
	// 注册用户邮箱
	if (!userName) {
		askQuesArr.push({
			type: 'input',
			name: 'email',
			message: '注册邮箱,确保格式正确',
			validate: function(input) {
				if (!input) {
					return '邮箱不能为空';
				}
				return true;
			}
		})
	}
	return askQuesArr
}

function cookiesSetting() {
	clInfo.cookies = cookies = program.cookies
	saveClInfoFile()
	console.log(color.green('cookies设置成功!! 运行 cl1024 可以进行抢码了！'));
}
