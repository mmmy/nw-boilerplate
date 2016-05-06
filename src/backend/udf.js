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
  getSymbolSearchResult
}
