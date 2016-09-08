import request from './request';
import config from './config';

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

let getGroupCode = (callback, errorCallback) => {
  const { groupOptions } = config;
  const options = { ...groupOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  }

  request(options, requestCb, errorCb, JSON.stringify([]));
};


let getSymbolList = (postData, callback) => {
  const { symbolListOptions } = config;
  const options = { ...symbolListOptions };

  var  symbolListCache  = require("./ksSymbolListCache");

  const requestCb = (result) => {
    symbolListCache.setToFile(result);
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  }
  if (symbolListCache.isLegal()) {
    var cache = symbolListCache.getFromFile();
    callback(cache);
    return cache;
  } else {
    request(options, requestCb, errorCb, JSON.stringify(postData));
  }
};

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
  getGroupCode,
  getSymbolHistory,
  getSymbolSearchResult,
  getSymbolList
}
