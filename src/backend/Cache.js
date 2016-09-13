'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var _BASEPATH = './Cache'; 
var _Cache = {};
var _mTime = {};
var _limitTime = 3600 * 1000;

var _createCacheFolder = function(BASEPATH) {
    try {
        if (!fs.existsSync(BASEPATH)) {
            fs.mkdirSync(BASEPATH);
        }
   } catch (e) {
        console.log(e);
   }
}

let isLegal = (_filename) => {

  assert(typeof(_filename) == 'string', 'getFromFile arguments error');
  _createCacheFolder(_BASEPATH);
  var _cacheFilePath = path.join(_BASEPATH, _filename+'.json');

  try {
    if (!_mTime[_filename]) {
      _mTime[_filename] = new Date() - _limitTime - 1000;
      if (fs.existsSync(_cacheFilePath)) 
        _mTime[_filename] = fs.statSync(_cacheFilePath).mtime;
    }
    if (new Date() - _mTime[_filename] <= _limitTime) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

let getFromFile = (_filename) => {
  assert(typeof(_filename) == 'string', 'getFromFile arguments error');
  _createCacheFolder(_BASEPATH);
  var _cacheFilePath = path.join(_BASEPATH, _filename+'.json');

  try {
    if (!_Cache[_filename]) _Cache[_filename] = [];
    if (_Cache[_filename].length == 0 && fs.existsSync(_cacheFilePath)) 
      _Cache[_filename] = fs.readFileSync(_cacheFilePath, 'utf-8');
    return _Cache[_filename];
  } catch (e) {
    console.log(e);
  }
}

let setToFile = (result, _filename) => {

  assert(typeof(_filename) == 'string', 'getFromFile arguments error');
  _createCacheFolder(_BASEPATH);
  var _cacheFilePath = path.join(_BASEPATH, _filename+'.json');

  console.log(_cacheFilePath);
  console.log(result);
  try {    
    _Cache[_filename] = result;
    console.log(_Cache[_filename]);
    console.log(typeof(result));
    _mTime[_filename] = new Date();
    fs.writeFileSync(_cacheFilePath, result, 'utf-8');
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  isLegal,
  getFromFile,
  setToFile
};
