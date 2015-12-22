# tizen-utils

Tizen-utils lets you pack your app and install on target.

## install

```
$ npm install tizen-utils --save
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


### install(pathToWgt)

Install widget on target from local directory `pathToWgt`.


### uninstall(wgtId)

Uninstall widget from target `wgtId`.
