var zipdir = require('zip-dir');
var exec = require('shelljs').exec;
var fs = require('fs');
var path = require('path');
var glob = require('glob');
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

function checkTarget() {
  exec('sdb root on');
  var res = exec('sdb shell type wrt-launcher');
  var data;

  if (!/not/.test(res.output)) {
    data = {
      user: 'root',
      version: '2.4',
      launcher: 'wrt-launcher'
    };
  } else {
    data = {
      user: 'owner',
      version: '3.0',
      launcher: 'app_launcher'
    };
  }
  log(data);
  return data;
}

var requiredFiles = ['config.xml'];

var TizenUtils = function (data) {
  this.data = data;
};

TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
  dirPath = dirPath || process.cwd();

  wgtName = wgtName ? checkWgtName(wgtName) : 'TizenApp_' + Math.round(Math.random()*1000) + '.wgt';

  callback = callback || function () {};

  fs.readdir(dirPath, function (err, files) {
    if (err) {
      log('Invalid dirPath: ' + dirPath, 'error');
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
  pathToWgt = pathToWgt || (process.cwd() + '/*.wgt');

  glob(pathToWgt, null, function (err, files) {
    if (err) {
      log('Error packing wgt: ' + err, 'error');
      return;
    }
    if (!files.length) {
      log('No wgt file found!', 'error');
      log('You can create one using command: `tizen wgt`');
      return;
    }
    var wgtName = files[0].split('/').pop();
    if (!checkWgtName(wgtName)) {
      return;
    }

    exec('sdb push ' + pathToWgt + ' /tmp/');
    exec('sdb shell su ' + this.data.user + ' -c \'pkgcmd -i -t wgt -p /tmp/\'' + wgtName);
    exec('sdb shell exit');
  }.bind(this));
};

TizenUtils.prototype.uninstall = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  }
  exec('sdb shell su ' + this.data.user + ' -c \' pkgcmd -u -n \'' + wgtId.split('.')[0]);
  exec('sdb shell exit');
};

TizenUtils.prototype.run = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  };
  exec('sdb shell su ' + this.data.user + ' -c \' ' + this.data.launcher + ' -s \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.close = function (wgtId) {
  if (!checkWgtId(wgtId)) {
    return;
  };
  exec('sdb shell su ' + this.data.user + ' -c \' ' + this.data.launcher + ' -k \'' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.list = function () {
  exec('sdb shell su ' + this.data.user + ' -c \' ' + this.data.launcher + ' -l \'');
  exec('sdb shell exit');
};

TizenUtils.prototype.init = function () {
  config.init();
};

TizenUtils.prototype.emulator = function () {
  var emuPath = '~/tizen-sdk/tools/emulator/bin/emulator-manager';
  exec(emuPath, function (err) {
    if (err) {
      log('Could not found emulator!', 'error');
      return;
    }
  });
};

var data = checkTarget();
module.exports = new TizenUtils(data);
