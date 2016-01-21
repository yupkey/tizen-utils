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

/* globals require, process, __dirname, module */
(function () {
  'use strict';

  var prompt = require('prompt');
  var fs = require('fs');
  var path = require('path');
  var log = require('./log');

  /**
   * Object contains methods for createing config.xml file
   */
  var Config = {
    /**
     * @method init
     */
    init: function () {
      log('This utility will walk you through creating a config.xml file. \n');
      log('See `tizen help config` for definitive documentation on these fields'
              + ' and exactly what they do. \n');
      log('Press ^C at any time to quit.');

      var appName = process.cwd().split('/').pop().replace(/-/g, '').replace(/_/g, '');

      var schema = {
        properties: {
          app_name: {
            pattern: /^\w+$/,
            type: 'string',
            message: 'Name must be letters',
            default: appName
          },
          start_file: {
            pattern: /^([a-zA-Z0-9_-]){1,50}([.]){1}([a-z]){2,4}$/,
            message: 'Wrong file name',
            default: 'index.html'
          }
        }
      };
      prompt.start();
      prompt.get(schema, function (err, result) {
        if (err) {
          log(err, 'error');
          return;
        }
        this.save(result);
      }.bind(this));
    },
    /**
     * @method save
     * @param {object} data - Data from user {start_file: '', app_name: ''}
     */
    save: function (data) {
      var configDefault = path.dirname(__dirname) + '/sample/config.xml';
      var indexDefault = path.dirname(__dirname) + '/sample/index.html';
      var startFile = process.cwd() + '/' + data.start_file;

      fs.readFile(configDefault, 'utf8', function (err, config) {
        if (err) {
          log(err, 'error');
          return;
        }
        var id = 'yupk' + Math.round(Math.random() * 1000000);
        config = config.replace(/a234567890/g, id)
                .replace(/index.html/g, data.start_file)
                .replace(/TizenUtilsApp/g, data.app_name);

        fs.writeFile('config.xml', config, 'utf8', function (err) {
          if (err) {
            log(err, 'error');
            return;
          }
          log('config.xml has been created succesfully (wgtId: ' + id + '.' + data.app_name + ')');
        });
      });
      if (!fs.existsSync(startFile)) {
        fs.readFile(indexDefault, 'utf8', function (err, index) {
          if (err) {
            log(err, 'error');
            return;
          }

          index = index.replace(/App/g, 'App - ' + data.app_name);

          fs.writeFile(data.start_file, index, 'utf8', function (err) {
            if (err) {
              log(err, 'error');
              return;
            }
            log('Start file ' + data.start_file + ' has been created succesfully');
          });
        });
      }
    }
  };

  module.exports = Config;
})();
