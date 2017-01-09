import * as types from '../constants/ActionTypes';
import UDF from '../../backend/udf';


/**
 * 异步获取patterns
 * @param  {object}   postData    [请求参数]
 * @param  {Function} cb          [回调]
 * @return {[type]}               [description]
 */

let getSymbolHistory = (postData, cb, errorCb) => {
  UDF.getSymbolHistory(postData, cb, errorCb);
};

let getSymbolSearchResult = (postData, cb) => {
  UDF.getSymbolSearchResult(postData, cb);
}

let getSymbolList = (postData, cb) => {
  UDF.getSymbolList(postData, cb);
}

module.exports = {
  getSymbolHistory,
  getSymbolSearchResult,
  getSymbolList
}
