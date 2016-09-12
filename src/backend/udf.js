import request from './request';
import config from './config';

let getSymbolHistory = (postData, callback, errorCallback) => {
  const { patternOptions } = config;
  const options = { ...patternOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
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
    callback && callback(symbolListCache.getFromFile());
  }
  if (symbolListCache.isLegal()) {
    var cache = symbolListCache.getFromFile();
    callback && callback(cache);
    return cache;
  } else {
    request(options, requestCb, errorCb, JSON.stringify(postData));
  }
};

let getSymbolSearchResult = (postData, callback) => {
  const { searchOptions } = config;
  const options = { ...searchOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  }

  // TODO: define postData
  request(options, requestCb, errorCb, JSON.stringify(postData));
}

let getLoginInfo = (postData, callback) => {
  const { loginOptions } = config;
  const options = { ...loginOptions };

  const requestCb = (result) => {
    callback && callback(result);
  }

  const errorCb = (err) => {
    callback && callback(err);
  }

  console.log(options);
  request(options, requestCb, errorCb, postData);
}


let getLogoutInfo = (postData, callback) => {
  const { logoutOptions } = config;
  const options = { ...logoutOptions };

  const requestCb = (result) => {
    callback && callback(result);
  }

  const errorCb = (err) => {
    callback && callback(err);
  }

  request(options, requestCb, errorCb, postData);
}

module.exports = {
  getGroupCode,
  getSymbolHistory,
  getSymbolSearchResult,
  getSymbolList,
  getLoginInfo,
  getLogoutInfo
}
