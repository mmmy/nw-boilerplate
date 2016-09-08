'use strict';

var fs = require('fs');
var path = require('path');

var BASEPATH = './Cache'; var _filename = "kssymbollistcache.json";
var _cacheFilePath = path.join(BASEPATH, _filename);

var _symbolListCache = [];

var _createCacheFolder = function() {
    try {
        if (!fs.existsSync(BASEPATH)) {
            fs.mkdirSync(BASEPATH);
        }
   } catch (e) {
        console.log(e);
   }
}

let isLegal = () => {
   _createCacheFolder();
  try {
    if (fs.existsSync(_cacheFilePath) && new Date() - fs.statSync(_cacheFilePath).mtime <= 3600 * 1000) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

let getFromFile = () => {
  _createCacheFolder();
  try {
    _symbolListCache = fs.readFileSync(_cacheFilePath, 'utf-8');
    return _symbolListCache;
  } catch (e) {
    console.log(e);
  }
}

let setToFile = (result) => {
  _createCacheFolder();
  try {
    _symbolListCache = result;
    fs.writeFileSync(_cacheFilePath, result);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  isLegal,
  getFromFile,
  setToFile
};
