# tizen-utils

Tizen-utils lets you pack your app and install on target.

## install

```
$ npm install tizen-utils -g
$ npm install tizen-utils --save-dev
```

## example

```javascript
var tizen = require('tizen-utils');

tizen.wgt('/path/to/your/app/directory/', 'WgtName.wgt', function (wgt) {
  tizen.install(wgt);
});

```

## methods

```
var tizen = require('tizen-utils');
```

### wgt(dirPath, wgtName, callback)

Zips up `dirPath` recursively preserving directory structure and returns
the file name into `callback` on success.

* `dirPath` A path to dir of your app.
* `wgtName`(optional) A widget name to be created. Default: (TizenApp_xxx.wgt).
* `callback`(optional) A function that is called on success. It returns `wgtName`.


### install(pathToWgt)

Install widget on target from local directory `pathToWgt`.

* `pathToWgt` A path to your wgt file on your desktop.


### uninstall(wgtId)

Uninstall widget from target `wgtId`.


### launch(wgtId)

Launch widget `wgtId`.


### close(wgtId)

Close widget `wgtId`.


### list()

List all installed widgets.
