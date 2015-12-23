var zipdir = require('zip-dir');
var exec = require('shelljs').exec;

function checkWgtId(wgtId) {
  if (!(/^([a-zA-Z0-9]){10}([.]){1}([a-zA-Z0-9_]){1,52}$/.test(wgtId))) {
    throw new 'Invalid wgtId!';
  }
}

function checkWgtName(wgtName) {
  if (!(/^([a-zA-Z0-9_-]){1,50}([.]){1}([wgt]){3}$/.test(wgtName))) {
    throw 'Invalid wgtName!';
  }
}

var TizenUtils = function () {};

TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
  if (!dirPath) {
    throw 'dirPath is required!';
  }

  wgtName = wgtName ? checkWgtName(wgtName) : 'TizenApp_' + Math.round(Math.random()*1000) + '.wgt';

  callback = callback || function () {};

  zipdir(dirPath, {saveTo: wgt}, function (err) {
    if (err)
      throw 'Error packing wgt: ' + err;
    callback(wgt);
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
  exec('sdb shell su owner');
  exec('sdb shell pkgcmd -i -t wgt -p /tmp/' + wgtName);

  exec('sdb shell app_launcher -l', function (code, output) {
//    console.log('list: ');
//    console.log(code);
//    console.log(output);
  });
  exec('sdb shell exit');
};

TizenUtils.prototype.uninstall = function (wgtId) {
  checkWgtId(wgtId);
  exec('sdb root on');
  exec('sdb shell su owner');
  exec('sdb shell pkgcmd -u -n ' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.launch = function (wgtId) {
  checkWgtId(wgtId);
  exec('sdb root on');
  exec('sdb shell su owner');
  exec('sdb shell app_launcher -s ' + wgtId);
  exec('sdb shell exit');
};

module.exports = new TizenUtils();
