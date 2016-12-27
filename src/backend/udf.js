import request from './request';
import config from './config';
var Cache  = require("./Cache");

let getSymbolHistory = (postData, callback, errorCallback) => {
  const { patternOptions } = config;
  const options = { ...patternOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    console.error('getSymbolHistory error', err);
    errorCallback && errorCallback(err);
  };

  request(options, requestCb, errorCb, JSON.stringify(postData));
};

let getGroupCode = (callback) => {
  const { groupOptions } = config;
  const options = { ...groupOptions };
  
  const requestCb = (result) => {
    result = dealGroupCode(result);
    if (JSON.parse(result)) {
        //result != "[]"
        if (result.length >= 5)
        Cache.setToFile(result, 'groupCode');
        callback && callback(result);
    } else if (Cache.isExist('groupCode')) {
        callback && callback(Cache.getFromFile('groupCode'));
    }
  };

  const errorCb = (err) => {
    callback && Cache.isExist('groupCode')  && callback(Cache.getFromFile('groupCode'));
  };

  if (Cache.isLegal('groupCode')) {
    callback && callback(Cache.getFromFile('groupCode'));
  } else {
    request(options, requestCb, errorCb, '');
  }
};

let uniq = (xs) => {
  var y = new Array();
  for (var i = 0; i < xs.length; i++) {
    var dup = false;
    for (var j = 0; j < i; j++) 
        if (xs[i] == xs[j]) { dup = true; break; } 
    if (!dup) y.push(xs[i]);
  }
  return y;
};

let dealGroupCode = (data) => {
  var groups = [];
  JSON.parse(data)['groups'].forEach(
    function (group) {
      groups.push(group['category']);
    });
  var uniqueGroups = uniq(groups);//Array.from(new Set(groups));
  //return JSON.stringify(groups);
  return JSON.stringify(uniqueGroups);
};

let getAllSymbolsList = (callback) => {
  if (Cache.isLegal('allSymbolsList')) {
    console.log('allSymbolsList isLegal');
    callback && callback(Cache.getFromFile('allSymbolsList'));
    return;
  }

  let cb = (_groupCodes) => {
    console.log(_groupCodes);
    var promises = [];
    JSON.parse(_groupCodes).forEach(function(code) {
      if (code != 'cf_m5')
      promises.push(new Promise((resolve, reject) => {
        getOneSymbolList({fileName: code, postData: { 'groupCode': code } }, function (data) {
          resolve(data);
        });
      }));

    });

    Promise.all(promises).then(function(result) {
      var arr = [];
      result.forEach( function(r) {
        arr = arr.concat(JSON.parse(r));
      });
      arr = JSON.stringify(arr);
      if (arr.length >= 100)
      Cache.setToFile(arr, 'allSymbolsList');
      callback && callback(arr);
    });

  };

  let expiredCb = (_groupCodes) => {
    callback && callback(Cache.getFromFile('allSymbolsList'));

    var promises = [];
    JSON.parse(_groupCodes).forEach(function(code) {
      if (code != 'cf_m5')
      promises.push(new Promise((resolve, reject) => {
        getOneSymbolList({fileName: code, postData: { 'groupCode': code } }, function (data) {
          resolve(data);
        });
      }));

    });

    Promise.all(promises).then(function(result) {
      var arr = [];
      result.forEach( function(r) {
        arr = arr.concat(JSON.parse(r));
      });
      arr = JSON.stringify(arr);
      if (arr.length >= 100)
      Cache.setToFile(arr, 'allSymbolsList');
    });

  };

  if (Cache.isExist('allSymbolsList')) 
    getGroupCode(expiredCb);
  else 
    getGroupCode(cb);
};

/*
data = {
  fileName: string,
  postData: { 'groupCode': string }
}
*/
let getOneSymbolList = (data, callback) => {
  console.log('get one');
  var fileName = data.fileName;
  var postData = data.postData;
  const { symbolListOptions } = config;
  const options = { ...symbolListOptions };

  const requestCb = (result) => {
    result = dealSymbolList(result);
    if (result.length >=100)
    Cache.setToFile(result, fileName);
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && Cache.isExist(fileName) &&callback(Cache.getFromFile(fileName));
  };

  if (Cache.isLegal(fileName)) {
    callback && callback(Cache.getFromFile(fileName));
  } else {
    request(options, requestCb, errorCb, JSON.stringify(postData));
  }
};

let dealSymbolList = (data) => {
  return JSON.stringify(JSON.parse(data)['symbols']);
};


let getSymbolList = (postData, callback) => {
  console.log("getAllSymbolList first");
  getAllSymbolsList(callback);/*
  return;
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
  }*/
};

let getSymbolSearchResult = (postData, callback) => {
  const { searchOptions } = config;
  const options = { ...searchOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  };

  request(options, requestCb, errorCb, JSON.stringify(postData));
}

let getLoginInfo = (postData, callback) => {
  const { loginOptions } = config;
  const options = { ...loginOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  };

  request(options, requestCb, errorCb, postData);
}


let getLogoutInfo = (postData, callback) => {
  const { logoutOptions } = config;
  const options = { ...logoutOptions };

  const requestCb = (result) => {
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(err);
  };

  request(options, requestCb, errorCb, postData);
}

module.exports = {
  getGroupCode,
  getSymbolHistory,
  getSymbolSearchResult,
  getSymbolList,
  getLoginInfo,
  getLogoutInfo,
  getAllSymbolsList,
}
