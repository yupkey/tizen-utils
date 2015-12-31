var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var exec = require('shelljs').exec;
var log = require('./log');

var Config = {
  init: function () {
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
    var xml = '/node_modules/tizen-utils/sample/config.xml';
    var configDefault = exec('npm config get prefix').output.replace('\n', '') + '/lib' + xml;

    if (!fs.existsSync(configDefault)) {
      configDefault = path.dirname(__dirname) + xml;

      if (!fs.existsSync(configDefault)) {
        log('Could not create config.xml file');
        log('Could not find ' + configDefault);
        return;
      }
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
        log('config.xml has been created succesfully');
      });
    });
  }
};

module.exports = Config;
