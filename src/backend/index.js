import KSSearch from './KSSearch';
import KSDataService from './KSDataService';
import store from '../store';
import lodash from 'lodash';

let __data = [];
/**
 * args: {symbol: , bars: , dateRange:{from: , to: }, additionDate:{type:'days', value: 30} }
 */

let searchPattern = (args, cb, errorCb) => {

	const { symbol, bars, dateRange, searchConfig } = args;

	let { additionDate } = searchConfig;

	let searchArgs = { symbol, dateRange, bars };

	let searchCb = (resObj) => {
		
		console.info(`第一步: 搜索 [ 正常结束 ], 匹配到 ${resObj.results.length} 个`);

		__data = resObj.results.map((pattern, i) => {

			const {id, similarity= resObj.similarities && resObj.similarities[i] || (0.95 - 0.01*i), begin, end, industry='1', type='D'} = pattern;
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
			
			console.info(`第二步: 获取kline具体数据 [ 正常结束 ], 返回 ${klineArr.length} 条记录`);

			klineArr.forEach(({ metaData, kLine, yieldRate }, i) => {
				__data[i].kLine = kLine;
				__data[i].metaData = metaData;
				__data[i].yield = yieldRate;
				__data[i].industry = metaData.className || '未知行业';
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
		console.info('第二步: 获取kline具体数据 [ 开始 ]');
		//TODO: 需要配置初始获取数据的数量, 如 5 组数据
		KSDataService.postSymbolData(args, bars, dataCb, (err) => {
			console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
			errorCb && errorCb(err);
		});
	};
	
	console.info('第一步: 搜索 [ 开始 ]');
	//获取搜索结果
	KSSearch.searchPattern(searchArgs, searchCb, (err) => { 
		console.warn(`第一步: 搜索 [ 失败 ]`, err);
		errorCb && errorCb(err);
	});

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