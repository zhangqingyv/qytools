# QYTOOLS

在学习 Node.js 过程中编写的一些工具

[TOC]

## 安装

使用 NPM 安装

```
$ npm install -g qytools
```

## girls

随机下载美女图片，来源[豆瓣美女](http://www.dbmeinv.com)

### 使用

自动下载并展示图片

```
$ girls
```

清空下载图片

```
$ girls -c
```

### 技术点

* 使用Fetch 进行 http 请求
* 随机数的生成
* 使用 cheerio 进行 DOM 内容解析
* wget 工具下载
* 文件/目录的保存和删除

## cl1024

**请注意身体， 你懂得**

### 使用

设置抢码注册相关的参数

```
$ cl1024 -s
```

自动查询邀请码并根据设置的用户名、密码、邮箱尝试注册

```
$ cl1024
```

通过发布页获取可用的地址，并使用默认浏览器打开

```
$ cl1024 -o
```

设置 ```cookies``` ，如果 有 IP 限制，需要设置 cookies

```
$ cl1024 -c
```

查询```技术讨论区```今日最新的主题

```
$ cl1024 -t
```

### 技术点

* ES6 标准的 Promise 使用
* open 方法封装
* 复杂页面的 DOM query
* 复杂页面的 正则匹配，利用正则匹配
* node-fetch POST 请求
* inquirer 命令行交互
* URLEncode
* setTimeOut 延迟

## publish_mdoversea

### 使用

海外团队 MDOversea 发版本工具

```

// 自动获取版本号 （当前版本号加1）
$ publish_mdoversea


// 手动指定版本号
$ publish_mdoversea 9.0.6.2

```

### 技术点

* git-promise 的使用
* 正则表达式匹配分组使用
