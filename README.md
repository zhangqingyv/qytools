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

通过发布页获取可用的地址，并使用默认浏览器打开

```
$ cl1024 -o
```

查询```技术讨论区```今日最新的主题

```
$ cl1024 -t
```

查询```技术讨论区```最近一条帖子是否有邀请码

```
$ cl1024 -c
```

### TODO

自动查询邀请码并自动补全少的位进行注册

### 技术点

* ES6 标准的 Promise 使用
* open 方法封装
* 复杂页面的 DOM query
* 负责页面的 正则匹配
* node-fetch POST 请求

