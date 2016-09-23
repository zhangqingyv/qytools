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
