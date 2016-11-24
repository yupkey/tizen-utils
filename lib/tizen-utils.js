/**
 * The MIT License (MIT)
 * Copyright (c) 2016 yupk <yupk@yupk.pl>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function () {
  'use strict';
  /* globals require, process, __dirname, module */

  var zipdir = require('zip-dir');
  var exec = require('shelljs').exec;
  var fs = require('fs');
  var glob = require('glob');
  var log = require('./log');
  var config = require('./config-input');
  var pjson = require('../package');
  var tjson = require('../lib/tizen');

  /**
   * Check wgt id
   * @param {string} wgtId
   * @returns {Boolean}
   * @private
   * @static
   */
  function checkWgtId(wgtId) {
    if (!(/^([a-zA-Z0-9]){10}([.]){1}([a-zA-Z0-9_]){1,52}$/.test(wgtId))) {
      log('Invalid wgtId!', 'error');
      return false;
    }
    return wgtId;
  }

  /**
   * Check wgt name
   * @param {string} wgtName
   * @returns {Boolean}
   * @private
   * @static
   */
  function checkWgtName(wgtName) {
    if (!(/^([a-zA-Z0-9_-]){1,50}([.]){1}([wgt]){3}$/.test(wgtName))) {
      log('Invalid wgtName!', 'error');
      return false;
    }
    return wgtName;
  }

  /**
   * Check a target whether support wrt-launcher or app_launcher
   * @returns {checkTarget.data}
   * @private
   * @static
   */
  function checkTarget() {
    exec('sdb root on', {
      silent: true
    });
    var res = exec('sdb shell type wrt-launcher', {
      silent: true
    });
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

    return data;
  }

  /**
   * Show Tizen logo
   * @returns {string} logo
   * @private
   * @static
   */
  function printLogo() {
    var logo = fs.readFileSync(__dirname + '/../img/logo.txt');
    logo = logo.toString().replace("{:version:}", pjson.version);
    log(logo);
    return logo;
  }

  /**
   * Required files to create wgt file
   * @type Array
   * @private
   */
  var requiredFiles = ['config.xml'];

  /**
   * @class TizenUtils
   * @author yupk <yupk@yupk.pl>
   * @param {object} data - Device data
   */
  var TizenUtils = function (data) {
    this.version = pjson.version;
    this.author = pjson.author;
    this.device = data;
  };

  /**
   * Creates a widget file
   * @method wgt
   * @param {string} [dirPath=current dir] - A path to dir of your application
   * @param {string} [wgtName=current dir name] - ex: MyApp.wgt
   * @param {function} [callback]
   */
  TizenUtils.prototype.wgt = function (dirPath, wgtName, callback) {
    dirPath = dirPath || process.cwd();

    var appName = process.cwd().split('/').pop().replace(/-/g, '').replace(/_/g, '');
    wgtName = wgtName ? checkWgtName(wgtName) : appName + '.wgt';

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

      zipdir(dirPath, {
        saveTo: wgtName
      }, function (err) {
        if (err) {
          log('Error packing wgt: ' + err, 'error');
          return;
        }
        log('Widget created: ' + wgtName, 'info');
        callback(wgtName);
      });
    });
  };

  /**
   * Install widget (wgt file) on target
   * @method install
   * @param {string} [pathToWgt=wgt file in current dir] - A path to your wgt file on your PC
   */
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

      process.stdout.write('\nInstalling: ' + 0 + ' %\r');

      var progressStart = exec('sdb shell su ' + this.device.user + ' -c \'pkgcmd -i -t wgt -p /tmp/\'' + wgtName, {
        async: true,
        silent: true
      });

      progressStart.stdout.on('data', function (data) {

        var reProgressStart = /key\[start\]\s+val\[update\]/;
        var reProgressRun = /key\[install_percent\]\s+val\[(\d+)\]/;
        var reProgressStop = /key\[end\]\s+val\[ok\]/;
        var reProgressError = /processing\s+result\s+\:(.*)/;

        var progressData = reProgressStart.exec(data) || reProgressRun.exec(data) || reProgressStop.exec(data);

        if (progressData !== null) {
          if (progressData[1] !== undefined) {
            var progress = parseInt(progressData[1]);
            if (progress === 100) {
              log('Install completed');
              exec('sdb shell exit');
            } else {
              process.stdout.write('Installing: ' + progress + ' %\r');
            }

          }
        } else {

          var errorData = reProgressError.exec(data);

          if (errorData !== null) {
            var errorMsg = errorData[1];
            log('Install error: ' + errorMsg);
          }
        }

      });

    }.bind(this));
  };

  /**
   * Uninstall widget from target
   * @method uninstall
   * @param {string} wgtId
   */
  TizenUtils.prototype.uninstall = function (wgtId) {
    if (!checkWgtId(wgtId)) {
      return;
    }
    exec('sdb shell su ' + this.device.user + ' -c \' pkgcmd -u -n \'' + wgtId.split('.')[0]);
    exec('sdb shell exit');
  };

  /**
   * Start running application
   * @method run
   * @param {string} wgtId
   * @param {boolean} [debug=false]
   */
  TizenUtils.prototype.run = function (wgtId, debug) {
    if (!checkWgtId(wgtId)) {
      return;
    }
    var d = '';
    if (debug) {
      d = ' -d ';
    }
    var res = exec('sdb shell su ' + this.device.user + ' -c \' ' + this.device.launcher + d + ' -s \'' + wgtId);
    if (debug && res.output.indexOf('port') !== -1) { //version 3.0 doesn't return port for debug
      var port = res.output.split('\r\n')[0].split(':')[1].replace(/ /g, '');
      if (port > 0) {
        exec('sdb forward tcp:' + port + ' tcp:' + port);
        var url = 'http://localhost:' + port + '/inspector.html?page=1';
        log('Web inspector: ' + url);
        exec('google-chrome ' + url + ' --new-window --no-first-run --no-default-browser-check');
        exec('sdb shell dlogutil WRT_XWALK WEBAPI_PLUGINS ConsoleMessage ' + wgtId);
      }
    }
    exec('sdb shell exit');
  };

  /**
   * Start running application with debug mode
   * @method debug
   * @param {string} wgtId
   */
  TizenUtils.prototype.debug = function (wgtId) {
    this.run(wgtId, true);
  };

  /**
   * Get value from key stord in tizen.json
   * @method get
   * @param {string} key
   */
  TizenUtils.prototype.get = function (key) {
    if (key && tjson[key]) {
      log(key + ': ' + tjson[key]);
      return tjson[key];
    } else {
      for (var i in tjson) {
        log(i + ': ' + tjson[i]);
      }
    }
    return tjson;
  };

  /**
   * Set value of key stored in tizen.json
   * @method set
   * @param {string} key
   * @param {string} value
   */
  TizenUtils.prototype.set = function (key, value) {
    if (key && value && tjson[key]) {
      var fileName = __dirname + '/tizen.json';
      tjson[key] = value;
      fs.writeFile(fileName, JSON.stringify(tjson), 'utf8', function (err) {
        if (err) return log(err);
        log('Value of ' + key + ' has been changed to ' + value);
      });
    }
    log(tjson);
  };

  /**
   * Stop running application
   * @method close
   * @param {string} wgtId
   */
  TizenUtils.prototype.close = function (wgtId) {
    if (!checkWgtId(wgtId)) {
      return;
    }
    exec('sdb shell su ' + this.device.user + ' -c \' ' + this.device.launcher + ' -k \'' + wgtId);
    exec('sdb shell exit');
  };

  /**
   * Show list of installed applications
   * @method list
   */
  TizenUtils.prototype.list = function () {
    exec('sdb shell su ' + this.device.user + ' -c \' ' + this.device.launcher + ' -l \'');
    exec('sdb shell exit');
  };

  /**
   * Create a config.xml file
   * @method init
   */
  TizenUtils.prototype.init = function () {
    config.init();
  };

  /**
   * Opens Emulator Manager if installed
   * @method emulator
   */
  TizenUtils.prototype.emulator = function () {
    exec(tjson.emulator, function (err) {
      if (err) {
        log('No emulator found. Please set the path to emulator using `tizen set`', 'error');
        this.get('emulator');
      }
    }.bind(this));
  };

  /**
   * Show help message
   * @method help
   * @param {string} def
   */
  TizenUtils.prototype.help = function (def) {
    printLogo();
    switch (def) {
    case 'config':
      log('\nAdditional configuration elements used in the config.xml: https://goo.gl/3tjL8d\n');
      break;
    default:
      log('Usage:\ntizen <command> [args]\n' +
        '\tinit \t\t\t create config.xml\n' +
        '\twgt \t\t\t create wgt file\n' +
        '\tsign \t\t\t create signed wgt file\n' +
        '\tinstall \t\t install app/wgt on target\n' +
        '\tlist \t\t\t list all installed apps on target with wgtIds\n' +
        '\trun [wgtId] \t\t start running app\n' +
        '\tclose [wgtId] \t\t stop running app\n' +
        '\tuninstall [wgtId] \t uninstall wgt from target\n' +
        '\tdebug [wgtId] \t\t start running app with debug mode\n' +
        '\tget [key] \t\t get value of key stored in tizen.json\n' +
        '\tset [key] [value] \t set value for key stored in tizen.json\n' +
        '\temulator \t\t open Emulator Manager if installed\n');
    }
  };

  /**
   * Creates signed wgt file
   * @method sign
   * @param {string} [dirPath=current dir] - An absolute path to dir of your application
   * @param {function} callback
   */
  TizenUtils.prototype.sign = function (dirPath, callback) {
    dirPath = dirPath ? '-- ' + dirPath : '';
    callback = callback || function () {};
    exec(tjson.cli + ' certificate -a yupk -p yupk -f yupk ', {
      silent: true
    }, function (a, b) {
      if (!b.match(/Working path: .*/)) {
        console.log('Couln\'t sign widget. Please check you have cli installed `tizen get cli` or use `tizen wgt`');
        return;
      }
      var certPath = b.match(/Working path: .*/)[0].replace('Working path: ', '') + '/yupk.p12';
      exec(tjson.cli + ' security-profiles add -n yupk -p yupk -a ' + certPath, {
        silent: true
      }, function (a, b) {
        exec(tjson.cli + ' package --sign yupk --type wgt ' + dirPath, function (a, b) {
          callback(a, b);
        });
      }.bind(this));
    }.bind(this));
  };

  var data = checkTarget();

  /**
   * TizenUtils instance exported as a module
   * @module tizen-utils
   * @type TizenUtils
   */
  module.exports = new TizenUtils(data);
})();
