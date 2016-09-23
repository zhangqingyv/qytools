var mkdirp = require('mkdirp'),
    wget = require('wget'),
    utils = require('./utils');

var images = [];

exports.images = function(girls, imagesCount) {

    var imagesDir = `${utils.home()}\/${utils.imagePath}`
    mkdirp(imagesDir, function (err) {
        if (err) console.error(err)
    });

    for( var i = 0; i < imagesCount; i ++) {
        downloadImages(girls[i], imagesDir, imagesCount);
    }
};

function downloadImages(imageSource, imagesDir, imagesCount) {
    imageName = utils.getRandomString(8) + '.jpg';
    var output = imagesDir  + imageName;
    var download = wget.download(imageSource, output);
    download.on('error', function(err) {
        images.push(null);
        if(images.length == imagesCount) {
            var imagesString = images.join(' ').toString();
            utils.open(imagesString)
        }
        console.log(err);
    });
    download.on('end', function(output) {
        console.log(` * * * * * * 努力下载中（${images.length + 1}/${imagesCount}）* * * * * * * * `);
        images.push(output);
        if(images.length == imagesCount) {
            var imagesString = images.join(' ').toString();
            utils.open(imagesString)
        }
    });
}
