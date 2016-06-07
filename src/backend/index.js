import KSSearch from './KSSearch';
import KSDataService from './KSDataService';
import { getIndustry } from './SymbolDataLocal';
import store from '../store';
import lodash from 'lodash';
import { callFunc } from '../components/helper/updateEchartImage';

let __ksSearchXhr = null;
let __ksDataXhr_1 = null;
let __ksDataXhr_2 = null;
let cancelSearch = () => {
	__ksSearchXhr && __ksSearchXhr.abort && __ksSearchXhr.abort();
	__ksDataXhr_1 && __ksDataXhr_1.abort && __ksDataXhr_1.abort();
	__ksDataXhr_2 && __ksDataXhr_2.abort && __ksDataXhr_2.abort();

	__ksSearchXhr = null;
	__ksDataXhr_1 = null;
	__ksDataXhr_2 = null;
};

let __data = [];
/**
 * args: {symbol: , bars: , dateRange:{from: , to: }, additionDate:{type:'days', value: 30} }
 */
let __closePrice = [];

let searchPattern = (args, cb, errorCb) => {

	const { symbol, bars, dateRange, searchConfig } = args;

	let { additionDate } = searchConfig;

	let searchArgs = { symbol, dateRange, bars, additionDate };

	let searchCb = (resObj) => {
		
		console.info(`第一步: 搜索 [ 正常结束 ], 匹配到 ${resObj.results.length} 个`);

		__data = resObj.results.map((pattern, i) => {

			const {id, similarity= resObj.similarities && resObj.similarities[i] || (0.95 - 0.01*i), begin, end, industry=getIndustry(id), type='D'} = pattern;
			const _return = resObj.returns ? resObj.returns[i] : undefined;
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
				'yield': _return
			};

		});

		__closePrice = resObj.closePrices || [];
		//获取kline具体数据
		let dataCb = (startIndex, klineArr) => {
			
			console.info(`第二步: 获取kline具体数据 [ 正常结束 ], 返回 ${klineArr.length} 条记录`);

			klineArr.forEach(({ metaData, kLine, yieldRate }, i) => {
				let index = i + startIndex;
				__data[index].kLine = kLine;
				__data[index].metaData = metaData;
				__data[index].yield = __data[index].yield === undefined ? yieldRate : __data[index].yield;
				__data[index].industry = __data[index].industry || metaData.className || '未知行业';
			});

			if(startIndex === 0) { //获取到前五个 刷新state
				cb && cb(__data, __closePrice);
			} else {
				callFunc([startIndex, __data.length]);
			}
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
		let startIndex = 0,
				nextIndex = 5;
		__ksDataXhr_1 =  KSDataService.postSymbolData(startIndex, args.slice(0, nextIndex), bars, dataCb, (err) => {
			console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
			errorCb && errorCb(err);
		});
		__ksDataXhr_2 = KSDataService.postSymbolData(nextIndex, args.slice(nextIndex), bars, dataCb, (err) => {
			console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
			errorCb && errorCb(err);
		});

	};
	
	console.info('第一步: 搜索 [ 开始 ]');
	//	取消已有的搜索
	cancelSearch();
	//获取搜索结果
	__ksSearchXhr = KSSearch.searchPattern(searchArgs, searchCb, (err) => { 
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