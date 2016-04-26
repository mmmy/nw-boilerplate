import KSSearch from './KSSearch';
import KSData from './KSData';
import KSChunk from './KSChunk';

/**
 * args: {symbol:, {from: , to: }}
 */

let searchPatterns = (args, cb, errorCb) => {

	let searchCb = (resStr) => {
		let resObj = JSON.parse(resStr);
		//
		//获取具体数据
		KSData.postSymbolData(resObj, cb, errorCb);
	};
	//获取搜索结果
	KSSearch.searchPatterns(args, searchCb, errorCb);
};

module.exports = {
	searchPatterns,
};