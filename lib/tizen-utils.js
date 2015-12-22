var zipdir = require('zip-dir');
var exec = require('shelljs').exec;

var TizenUtils = module.exports = function (options) {
  if (!(this instanceof TizenUtils)) {
    return new TizenUtils(options);
  }

  this.options = options || {};
};

TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
  if (!dirPath) {
    throw 'dirPath must be defined!';
  }

  var wgt = wgtName || 'TizenSample.wgt';
  var callback = callback || function () {};

  zipdir(dirPath, {saveTo: wgt}, function (err, buffer) {
    if (err)
      throw err;
    console.log('buffer: ', buffer.length);
    callback(wgt);
  });
};

TizenUtils.prototype.install = function (pathToWgt) {
  var wgtName = pathToWgt.split('/').pop();
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
  exec('sdb root on');
  exec('sdb shell su owner');
  exec('sdb shell pkgcmd -u -n ' + wgtId);
  exec('sdb shell exit');
};

TizenUtils.prototype.launch = function (wgtId) {
  exec('sdb root on');
  exec('sdb shell su owner');
  exec('sdb shell app_launcher -s ' + wgtId);
  exec('sdb shell exit');
};
