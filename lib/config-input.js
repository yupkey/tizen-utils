var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var exec = require('shelljs').exec;
var log = require('./log');

var Config = {
  init: function () {
    log('This utility will walk you through creating a config.xml file. \n');
    log('See `tizen help config` for definitive documentation on these fields'
      + ' and exactly what they do. \n');
    log('Press ^C at any time to quit.');

    var schema = {
      properties: {
        app_name: {
          pattern: /^\w+$/,
          type: 'string',
          message: 'Name must be letters',
          default: 'TizenApp' + Math.round(Math.random()*1000)
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
  save: function (data) {
    var configDefault = path.dirname(__dirname) + '/sample/config.xml';

    if (!fs.existsSync(configDefault)) {
      log('Could not find ' + configDefault);
      return;
    }

    fs.readFile(configDefault, 'utf8', function(err, config){
      if (err) {
        log(err, 'error');
        return;
      }
      var id = 'yupk' + Math.round(Math.random()*1000000);
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
  }
};

module.exports = Config;
