# tizen-utils

Tizen-utils lets you pack your app and install on target.

## install

```
$ npm install tizen-utils -g
```

## example

```javascript
$ cd /path/to/your/app/directory/

$ tizen init //create config.xml
$ tizen wgt //create wgt file
$ tizen sign //create signed wgt file
$ tizen install //install app/wgt on target
$ tizen list //list all installed apps on target with wgtIds
$ tizen run wgtId //start running app
$ tizen close wgtId //stop running app
$ tizen uninstall wgtId //uninstall wgt from target
$ tizen debug wgtId //start running app with debug mode
$ tizen emulator //open Emulator Manager if installed
$ tizen get //get value in tizen.json
$ tizen set //set value in tizen.json
```

```javascript
$ npm install tizen-utils --save-dev

var tizen = require('tizen-utils');

tizen.wgt('/path/to/your/app/directory/', 'WgtName.wgt', function (wgt) {
  tizen.install(wgt);
});

```

## methods

### init()

It helps you create a config.xml file.


### wgt(dirPath, wgtName, callback)

Create wgt file. Zips up `dirPath` and returns
the wgt name into `callback` on success.

* `dirPath`[optional] A path to dir of your app.
* `wgtName`[optional] A widget name to be created. Default: (curent_dir_name.wgt).
* `callback`[optional] A function that is called on success. It returns `wgtName`.

### sign(dirPath, callback)

Create signed wgt file. It will automatically create certificate and security profile.

* `dirPath`[optional] An absolute path to dir of your app.
* `callback`[optional] A function that is called on success.


### install(pathToWgt)

Install widget on target from local directory `pathToWgt`.

* `pathToWgt` A path to your wgt file on your PC.


### uninstall(wgtId)

Uninstall widget from target by `wgtId`.


### list()

List all installed widgets with wgtIds.


### run(wgtId)

Run widget with `wgtId`.


### close(wgtId)

Close widget with `wgtId`.


### debug(wgtId)

Debug application with `wgtId`.


### emulator()

Open Emulator Manager if is installed.
