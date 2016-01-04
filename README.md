# tizen-utils

Tizen-utils lets you pack your app and install on target.

## install

```
$ npm install tizen-utils --save-dev
```

## example

```javascript
var tizen = require('tizen-utils');

tizen.wgt('/path/to/your/app/directory/', 'WgtName.wgt', function (wgt) {
  tizen.install(wgt);
});

```

```
$ npm install tizen-utils -g

$ cd /path/to/your/app/directory/

$ tizen init //create config.xml
$ tizen wgt //create wgt file
$ tizen install //install app/wgt on target
$ tizen list //list all installed apps on target with wgtIds
$ tizen run wgtId //start running app
$ tizen close wgtId //stop running app
$ tizen uninstall wgtId //uninstall wgt from target

```

## methods

### init()

It helps you create a config.xml file.


### wgt(dirPath, wgtName, callback)

Create wgt file. Zips up `dirPath` and returns
the wgt name into `callback` on success.

* `dirPath`[optional] A path to dir of your app.
* `wgtName`[optional] A widget name to be created. Default: (TizenApp_xxx.wgt).
* `callback`[optional] A function that is called on success. It returns `wgtName`.


### install(pathToWgt)

Install widget on target from local directory `pathToWgt`.

* `pathToWgt` A path to your wgt file on your desktop.


### uninstall(wgtId)

Uninstall widget from target by `wgtId`.


### list()

List all installed widgets with wgtIds.


### run(wgtId)

Run widget with `wgtId`.


### close(wgtId)

Close widget with `wgtId`.
