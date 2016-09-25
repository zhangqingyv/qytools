var open = (process.platform === 'win32') ? 'start' : 'open';

exports.imagePath = 'Downloads/girls/'

exports.home = function() {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

exports.getRandomString = (length) => {
	var originalString = "0123456789qwertyuioplkjhgfdsazxcvbnm";
	var randomString = "";
	for(var i=0;i<length;i++){
		var stringPosition = Math.random()*originalString.length;
		randomString += originalString.charAt(Math.ceil(stringPosition)%originalString.length);
	}
	return randomString;
}

exports.getRandomInt = (fromNum, toNum) => {
	var ttt = toNum - fromNum;
	var randomNumber = Math.random() * ttt
	return fromNum + Math.floor(randomNumber)
}

exports.open = (file) => {
	var open;
  if(process.platform === 'win32'){
      open = 'start';
  }else if(process.platform === 'darwin'){
      open = 'open';
  }
  else if(process.platform === 'linux'){
      open='xdg-open';
  }else{
      console.log('当前平台不支持命令打开图片，请到'+imagesDir+'下自撸');
      return;
  }
  var openFileCmd = open + ' ' + file;
  require('child_process')
  	.exec(openFileCmd, (error, stdout, stderr) => {
  	});
}

exports.getToday = () => {
  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  // 例子：
  // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
  // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
  Date.prototype.Format = function(fmt) { //author: meizz
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
