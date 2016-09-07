import request from './request';
import config from './config';
//import {setToFile, isLegal, readFromFile, haha} from './ksSymbolListCache';
//import isLegal from './ksSymbolListCache';
//import readFromFile from './ksSymbolListCache';
//import haha from './ksSymbolListCache';

let getSymbolHistory = (postData, callback, errorCallback) => {
  const { patternOptions } = config;
  const options = { ...patternOptions };

  const requestCb = (result) => {
    callback(result);
  };

  const errorCb = (err) => {
    callback(err);
  }

  request(options, requestCb, errorCb, JSON.stringify(postData));
};

let getSymbolList = (postData, callback) => {
  const { symbolListOptions } = config;
  const options = { ...symbolListOptions };

  var  symbolListCache  = require("./ksSymbolListCache");
    console.log(symbolListCache);
    console.log("hello, i am getSymbolList");
    symbolListCache.haha();

  const requestCb = (result) => {
    console.log(result);
    console.log("ready to set to file");
    symbolListCache.setToFile(result);
    callback(result);
  };

  const errorCb = (err) => {
    callback(err);
  }
  if (symbolListCache.isLegal()) {
       var cache = symbolListCache.getFromFile();
       console.log("cache is legal");
       callback(cache);
       return cache;
  } else
  // TODO: define postData
  request(options, requestCb, errorCb, JSON.stringify(postData));
}

let getSymbolSearchResult = (postData, callback) => {
  const { searchOptions } = config;
  const options = { ...searchOptions };

  const requestCb = (result) => {
    callback(result);
  };

  const errorCb = (err) => {
    callback(err);
  }

  // TODO: define postData
  request(options, requestCb, errorCb, JSON.stringify(postData));
}

module.exports = {
  getSymbolHistory,
  getSymbolSearchResult,
  getSymbolList
}
