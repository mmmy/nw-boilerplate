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
    callback && callback(err);
  }

  request(options, requestCb, errorCb, JSON.stringify(postData));
};

let getGroupCode = (callback) => {
  const { groupOptions } = config;
  const options = { ...groupOptions };
  
  const requestCb = (result) => {
    result = dealGroupCode(result);
    Cache.setToFile(result, 'groupCode');
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(Cache.getFromFile('groupCode'));
  };

  if (Cache.isLegal('groupCode')) {
    callback && callback(Cache.getFromFile('groupCode'));
  } else {
    request(options, requestCb, errorCb, '');
  }
};

let dealGroupCode = (data) => {
  var groups = [];
  JSON.parse(data)['groups'].forEach(
    function (group) {
      groups.push(group['code']);
    });
  return JSON.stringify(groups);
};

let getAllSymbolsList = (callback) => {
  let cb = (_groupCodes) => {
    console.log(_groupCodes);
    var promises = [];
    JSON.parse(_groupCodes).forEach(function(code) {
      
      promises.push(new Promise((resolve, reject) => {
        getOneSymbolList({fileName: code, postData: { 'groupCode': code } }, function (data) {
          resolve(data);
        });
      }));

    });

    Promise.all(promises).then(function(result) {
      var arr = [];
      console.log('promise result', result);
      result.forEach( function(r) {
        console.log(typeof(r));
        console.log(typeof(JSON.parse(r)));
        console.log(JSON.parse(r)[0]);
        arr = arr.concat(JSON.parse(r));
      });
      callback(JSON.stringify(arr));
    });

  };
  getGroupCode(cb);
};


let getOneSymbolList = (data, callback) => {
  console.log('get one');
  var fileName = data.fileName;
  var postData = data.postData;
  const { symbolListOptions } = config;
  const options = { ...symbolListOptions };

  const requestCb = (result) => {
    result = dealSymbolList(result);
    Cache.setToFile(result, fileName);
    callback && callback(result);
  };

  const errorCb = (err) => {
    callback && callback(Cache.getFromFile(fileName));
  }

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
  console.log("getSymbolList first");
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
  getLogoutInfo,
  getAllSymbolsList,
}
