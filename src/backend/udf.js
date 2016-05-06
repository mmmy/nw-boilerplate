import request from './request';
import config from './config';

let getSymbolHistory = (postData, callback) => {
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

module.exports = {
	getSymbolHistory,
}
