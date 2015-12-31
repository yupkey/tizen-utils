var zipdir = require('zip-dir');
var exec = require('shelljs').exec;
var fs = require('fs');
var log = require('./log');
var config = require('./config-input');

function checkWgtId(wgtId) {
  if (!(/^([a-zA-Z0-9]){10}([.]){1}([a-zA-Z0-9_]){1,52}$/.test(wgtId))) {
    log('Invalid wgtId!', 'error');
    return false;
  }
  return wgtId;
}

function checkWgtName(wgtName) {
  if (!(/^([a-zA-Z0-9_-]){1,50}([.]){1}([wgt]){3}$/.test(wgtName))) {
    log('Invalid wgtName!', 'error');
    return false;
  }
  return wgtName;
}

var requiredFiles = ['config.xml', 'index.html'];

var TizenUtils = function () {};

TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
  if (!dirPath) {
    log('dirPath is required!', 'error');
    return;
  }
  wgtName = wgtName ? checkWgtName(wgtName) : 'TizenApp_' + Math.round(Math.random()*1000) + '.wgt';

  callback = callback || function () {};

  fs.readdir(dirPath, function (err, files) {
    if (err) {
      log('Invalid dirPath!', 'error');
      return;
    }
    for (var i = 0; i < requiredFiles.length; i++) {
      if (files.indexOf(requiredFiles[i]) < 0) {
        log(requiredFiles[i] + ' file missing!', 'error');
        return;
      }
    }

    zipdir(dirPath, {saveTo: wgtName}, function (err) {
      if (err) {
        log('Error packing wgt: ' + err, 'error');
        return;
      }
      log('Widget created: ' + wgtName, 'info');
      callback(wgtName);
    });
  });
};

TizenUtils.prototype.install = function (pathToWgt) {
  if (!pathToWgt) {
    log('pathToWgt is required!', 'error');
    return;
  }

  var wgtName = pathToWgt.split('/').pop();
  if (!checkWgtName(wgtName)) {
    return;
  }

  exec('sdb root on');
  exec('sdb push ' + pathToWgt + ' /tmp/');
  exec('sdb shell su owner -c \'pkgcmd -i -t wgt -p /tmp/\'' + wgtName);
  exec('sdb shell exit');
};

TizenUtils.prototype.uninstall = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  }
  exec('sdb root on');
  exec('sdb shell su owner -c \' pkgcmd -u -n \'' + wgtId.split('.')[0]);
  exec('sdb shell exit');
};

TizenUtils.prototype.launch = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  };
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -s \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.run = function (wgtId) {
  this.launch(wgtId);
};

TizenUtils.prototype.close = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  };
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -k \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.list = function () {
  exec('sdb root on');
  exec('sdb shell su owner -c \'app_launcher -l \'');
  exec('sdb shell exit');
};

TizenUtils.prototype.init = function () {
  log('This utility will walk you through creating a config.xml file.');
  log('Press ^C at any time to quit.');
  config.init();
};

module.exports = new TizenUtils();
