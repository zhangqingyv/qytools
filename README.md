# QYTOOLS

在学习 Node.js 过程中编写的一些工具

[TOC]

## 安装

使用 NPM 安装

```
$ npm install qytools
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
* node-jqurey 使用 DOM 内容搜索
* wget 工具下载
* 文件/目录的保存和删除
