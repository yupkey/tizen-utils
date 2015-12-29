var zipdir = require('zip-dir');
var exec = require('shelljs').exec;
var fs = require('fs');

function checkWgtId(wgtId) {
  if (!(/^([a-zA-Z0-9]){10}([.]){1}([a-zA-Z0-9_]){1,52}$/.test(wgtId))) {
    throw new 'Invalid wgtId!';
  }
  return wgtId;
}

function checkWgtName(wgtName) {
  if (!(/^([a-zA-Z0-9_-]){1,50}([.]){1}([wgt]){3}$/.test(wgtName))) {
    throw 'Invalid wgtName!';
  }
  return wgtName;
}

var requiredFiles = ['config.xml', 'index.html'];

var TizenUtils = function () {};

TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
  if (!dirPath) {
    throw 'dirPath is required!';
  }
  wgtName = wgtName ? checkWgtName(wgtName) : 'TizenApp_' + Math.round(Math.random()*1000) + '.wgt';

  callback = callback || function () {};

  fs.readdir(dirPath, function (err, files) {
    if (err) throw 'Invalid dirPath!';
//    console.log(files);
    for (var i = 0; i < requiredFiles.length; i++) {
      if (files.indexOf(requiredFiles[i]) < 0) throw requiredFiles[i] + ' file missing!';
    }

    zipdir(dirPath, {saveTo: wgtName}, function (err) {
      if (err) throw 'Error packing wgt: ' + err;
      callback(wgtName);
    });
  });
};

TizenUtils.prototype.install = function (pathToWgt) {
  if (!pathToWgt) {
    throw 'pathToWgt is required!';
  }

  var wgtName = pathToWgt.split('/').pop();
  checkWgtName(wgtName);

  exec('sdb root on');
  exec('sdb push ' + pathToWgt + ' /tmp/');
  exec('sdb shell su owner -c \'pkgcmd -i -t wgt -p /tmp/\'' + wgtName);
  exec('sdb shell exit');
};

TizenUtils.prototype.uninstall = function (wgtId) {
  checkWgtId(wgtId);
  exec('sdb root on');
  exec('sdb shell su owner -c \' pkgcmd -u -n \'' + wgtId);
  exec('sdb shell su owner -c \' pkgcmd -u -n \'' + wgtId.split('.')[0]);
  exec('sdb shell exit');
};

TizenUtils.prototype.launch = function (wgtId) {
  checkWgtId(wgtId);
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -s \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.close = function (wgtId) {
  checkWgtId(wgtId);
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -k \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.list = function () {
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -l \'');
  exec('sdb shell exit');
};

module.exports = new TizenUtils();
