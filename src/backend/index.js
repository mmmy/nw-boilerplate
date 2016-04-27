import KSSearch from './KSSearch';
import KSDataService from './KSDataService';

let __data = [];
/**
 * args: {symbol:, {from: , to: }}
 */

let searchPattern = (args, cb, errorCb) => {

	let searchCb = (resObj) => {

		__data = resObj.patterns.map((pattern) => {

			const {symbol, similarity, begin, end, industry, type} = pattern;
			let kline = {};
			
			return {
				symbol,
				similarity,
				begin,
				end,
				industry,
				type,
				kline	
			};

		});

		//获取kline具体数据
		let dataCb = (klineArr) => {

			klineArr.forEach((kline, i) => {
				__data[i].kline = kline;
			});

			cb && cb(__data);
		};

		//let args = [{'symbol':'ss600000',dateRange:[3, 5]}, {'symbol':'ss600000', dateRange:[7, 8]}];
		let args = resObj.patterns.map((pattern) => {
			return {
				'symbol': pattern.symbol,
				'dateRange': [pattern.begin, pattern.end]
			};
		});
		//TODO: 需要配置初始获取数据的数量, 如 5 组数据
		KSDataService.postSymbolData(args, dataCb, errorCb);
	};
	//获取搜索结果
	KSSearch.searchPattern(args, searchCb, errorCb);

};
//TODO: 获取新数据 类似push
let appendPattern = (n = 4) => {

};

let getData = () => {
	return __data;
};

module.exports = {
	searchPattern,
	appendPattern,
	getData,
};