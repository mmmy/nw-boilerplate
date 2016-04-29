import KSSearch from './KSSearch';
import KSDataService from './KSDataService';

let __data = [];
/**
 * args: {symbol: , bars: , dateRange:{from: , to: }, additionDate:{type:'days', value: 30} }
 */

let searchPattern = (args, cb, errorCb) => {

	const { symbol, bars, dateRange, additionDate } = args;

	let searchArgs = { symbol, dateRange, bars };

	let searchCb = (resObj) => {

		__data = resObj.results.map((pattern, i) => {

			const {id, similarity=0.2, begin, end, industry='1', type='D'} = pattern;
			let kLine = {};
			//let id = i;

			return {
				id: i,
				symbol: id,
				similarity,
				begin: begin.time,
				end: end.time,
				industry,
				type,
				baseBars: bars,
				kLine,
				'yield': 0	
			};

		});

		//获取kline具体数据
		let dataCb = (klineArr) => {

			klineArr.forEach(({ metaData, kLine, yieldRate }, i) => {
				__data[i].kLine = kLine;
				__data[i].metaData = metaData;
				__data[i].yield = yieldRate;
			});

			cb && cb(__data);
		};

		//let args = [{'symbol':'ss600000',dateRange:[3, 5]}, {'symbol':'ss600000', dateRange:[7, 8]}];
		let args = resObj.results.map((pattern) => {
			
			const {id, begin, end} = pattern;

			return {
				'symbol':id,
				'dateRange': [begin.time, end.time],
				'additionDate': additionDate,
				'bars': bars,
			};
		});
		//TODO: 需要配置初始获取数据的数量, 如 5 组数据
		KSDataService.postSymbolData(args, dataCb, errorCb);
	};
	//获取搜索结果
	KSSearch.searchPattern(searchArgs, searchCb, errorCb);

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