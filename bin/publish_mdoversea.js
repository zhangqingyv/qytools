#! /usr/bin/env node --harmony
'use strict'

const cwd = process.cwd()
const appInfo = require('../package.json')
const utils = require('../lib/utils');
const config = require('../config/config')

const program = require('commander')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const inquirer = require('inquirer');
const color = require('chalk')
const git = require("git-promise");
const minimist = require('minimist')

const path = require('path')
const url = require('url')
const fs = require('fs')
const fsextra = require('fs-extra');

program
	.version(appInfo.version)
	.parse(process.argv)

// 获取最新版本
var version = getNewVersion()
console.log(`开始发布版本: ${version}`)

// 执行主流程
publish_mdoversea_pod()

// 主流程
function publish_mdoversea_pod() {

	ggpull()
		.then(res => {
			console.log(res)
			return Promise.all([
				handlePodspec(config.dpPodspecFileName, version),
				handlePodspec(config.mtPodspecFileName, version)
			])
		})
		.then(resArr => {
			console.log(`git commit -am \"升级podspec版本号 ${version}\"`)
			return git(`commit -am \"升级podspec版本号 ${version}\"`)
		})
		.then(res => {
			console.log(res)
			console.log(color.yellow(`git tag ${version}`))
			return git(`tag ${version}`)
		})
		.then(res => {
			console.log(res)
			return ggpush()
		})
		.then(res => {
			console.log(res)
			return git('push origin --tags')
		})
		.then(res => {
			console.log(color.yellow(`点击链接进行美团发包！`))
			console.log(color.green(config.mtCIBuildPage))
			console.log(color.yellow(`执行下面命令进行点评发包`))
			console.log(color.green(`turbo ${config.dpPodspecFileName}`))
			/*
			//美团发版
			utils.open(config.mtCIBuildPage)
			//点评发版
			nvTurbo()
			*/
		})
		.catch(error => {
			console.log(error)
		})

}

// ------------------ 自动获取版本号
function getNewVersion() {
	let versionArg = minimist(process.argv.slice(2))._[0]
	var mtPodspec = fs.readFileSync(config.mtPodspecFileName, {encoding:'utf-8'})
	var mtLastVersion = findVersion(mtPodspec)
	console.log(`当前美团podspec版本是${mtLastVersion}`)

	var dpPodspec = fs.readFileSync(config.dpPodspecFileName, {encoding:'utf-8'})
	var dpLastVersion = findVersion(dpPodspec)
	console.log(`当前点评podspec版本是${dpLastVersion}`)

	if (mtLastVersion != dpLastVersion) {
		console.log(color.red('无法自动升级版本号，请指定podspec版本'))
		process.exit()
	}
	return versionArg || plusVersion(mtLastVersion)
}

// ------------------- 修改 podspec 文件
function handlePodspec(fileName, version) {
	return new Promise((resolve, reject) => {
		let podspecPath = path.join(cwd, fileName)
		var podspec = fs.readFileSync(podspecPath, {encoding:'utf-8'})
		// 替换版本号
		podspec = replaceVersion(podspec, version)
		// 保存替换
		fs.writeFileSync(podspecPath, podspec, {encoding:'utf-8'});
		resolve(version)
	})
}

// 替换版本号
function replaceVersion(podspec, newVersion) {
	var originVersion = findVersion(podspec)
	var regex = new RegExp(originVersion)
	podspec = podspec.replace(regex, newVersion);
	return podspec;
}

// 查找版本号
function findVersion(podspec) {
	let versionRegExp = /s.version\W=\W\"(.+)\".*/
	var result = podspec.match(versionRegExp)
	return result[1] || null
}

//版本号 + 1
function plusVersion(version) {
	var newVersion = '0.0.1'
	let lastVersionReg = /.(\d*\1)$/
	var result = version.match(lastVersionReg);
	if (result) {
			var lastNum = parseInt(result[1])
			lastNum += 1
			newVersion = version.replace(lastVersionReg, `.${lastNum}`)
	}
	return newVersion;
}

// --------  提交， tag， push --tags

function childProcess(command) {
	return new Promise((resolve, reject) => {
		require('child_process')
	  	.exec(command, (error, stdout, stderr) => {
	  		console.log(error)
	  		if (error) {
	  			reject(error)
	  			return
	  		}
	  		console.log(stdout)
	  		console.log(stderr)
	  		resolve(stdout)
	  	});
	})
}

function ggpull() {
	return git("rev-parse --abbrev-ref HEAD")
		.then(branch => {
			console.log(color.yellow(`git pull origin ${branch}`))
			return git(`pull origin ${branch}`)
		})
}

function ggpush() {
	return git("rev-parse --abbrev-ref HEAD")
		.then(branch => {
			console.log(color.yellow(`git push origin ${branch}`))
			return git(`push origin ${branch}`)
		})
}

// -------- 执行 turbo --------
function nvTurbo() {
	let turboCmd = `turbo ${config.dpPodspecFileName}`
	return childProcess(turboCmd)
}
