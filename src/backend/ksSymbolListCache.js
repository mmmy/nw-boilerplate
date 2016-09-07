'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj  };  }
var _fs = require('fs');
var _fs2 = _interopRequireDefault(_fs);
var _path = require('path');
var _path2 = _interopRequireDefault(_path);

var BASEPATH = './Cache'; var _filename = "kssymbollistcache.json";
var _cacheFilePath = _path2.default.join(BASEPATH, _filename);

var _symbolListCache = [];

var _createCacheFolder = function() {
    console.log("gg");
    try {
        console.log(BASEPATH);
        if (!_fs2.default.existsSync(BASEPATH)) {
            _fs2.default.mkdirSync(BASEPATH);
        }
   } catch (e) {
        console.log(e);
   }
}

let isLegal = () => {
  console.log("islegal");
  _createCacheFolder();
  try {
    if (_fs2.default.existsSync(_cacheFilePath) && new Date() - _fs2.default.statSync(_cacheFilePath).mtime <= 3600 * 1000) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

let getFromFile = () => {
  console.log("read from file");
  _createCacheFolder();
  try {
    console.log("read from file");
    _symbolListCache = _fs2.default.readFileSync(_cacheFilePath, 'utf-8');
    return _symbolListCache;
  } catch (e) {
    console.log(e);
  }
}

let setToFile = (result) => {
  console.log("settofile");
  _createCacheFolder();
  try {
    _symbolListCache = result;
    _fs2.default.writeFileSync(_cacheFilePath, result);
  } catch (e) {
    console.log(e);
  }
}


/*
if (fs.existsSync(_cacheFilePath)) {
    try {
        _symbolListCache = JSON.parse(_fs2.readFileSync(_cacheFilePaht, 'utf-8'));
    }
    catch (e) {console.log(e); _symbolListCache = [];}
}else getSymbolListCache();

console.log("hello, i'm ksSymbolListCache");

/*
let getSymbolListCache = function() {
    if (new Date() - _lastUpdateTime >= 10 || _symbolListCache.length == 0) {
        _createCacheFolder();
//        _symbolListCache = download
        _symbolListCache.push(new Date());
        if (true download success) {
            fs.writeFileSync(, JSON.stringify());
            _lastUpdateTime = new Date();
        }
    } //else _symbolListCache.push("t");
    return _symbolListCache;
}*/

      /*
        var d = JSON.parse(_fs2.readFileSync(_cacheFilePaht, 'utf-8'));
        console.log(d);
        */
        /*
        _fs2.readFile(_cacheFilePath, {encoding:'utf-8'}, function (err, bytesRead) {
            if (err) throw err;
            console.log(bytesRead);
            _symbolListCache = JSON.parse(bytesRead);
            console.log("readFile success");
        });
        */

function haha() {
    console.log("i am func");
}
/*
export isLegal;
export getFromFile;
export setToFile;
export default haha;
*/
module.exports = {
  isLegal,
  getFromFile,
  setToFile,
    haha
};
