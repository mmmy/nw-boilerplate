import KSSearch from './KSSearch';
// import KSDataService from './KSDataService';
// import { getIndustry } from './SymbolDataLocal';
// import store from '../store';
// import lodash from 'lodash';
// import updateEchartImage from '../components/helper/updateEchartImage';
// let callFunc = updateEchartImage.callFunc;

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

	const { symbol, kline, bars, dateRange, searchConfig, dataCategory, interval} = args;

	let { additionDate, searchLenMax, isLatestDate, similarityThreshold } = searchConfig;

	let dr = searchConfig.dateRange;

	let searchArgs = { symbol, kline, dateRange, bars, additionDate, searchLenMax, isLatestDate, dataCategory, dr};

	let searchCb = (resObj) => {
		// console.info(`第一步: 搜索 [ 正常结束 ], 匹配到 ${resObj.results.length} 个`);
		__data = [];
		__closePrice = [];
		var args = [];

		resObj.results.forEach((pattern, i) => {

			const {id, similarity= resObj.similarities && resObj.similarities[i], begin, end, type=interval} = pattern;
			const lastDate = resObj.lastDates && resObj.lastDates[i];
			const _return = resObj.returns ? resObj.returns[i] : undefined;
			let kLine = [];
			//let id = i;
			if(!similarityThreshold || (similarityThreshold.on && (similarity >= similarityThreshold.value))) {
				__data.push({
					id: i,
					symbol: id,
					similarity: similarity,//_growSimilarity(similarity),
					begin: begin.time,
					end: end.time,
					lastDate,
					// industry,
					type,
					baseBars: bars,
					kLine,
					'yield': _return
				});
				if(resObj.closePrices) {
					__closePrice.push(resObj.closePrices[i]);					
				}
				args.push({
					'symbol':id,
					'dateRange': [begin.time, end.time],
					'lastDate': resObj.lastDates && resObj.lastDates[i],
					'additionDate': additionDate,
					'bars': bars,
					'dataCategory': dataCategory,
				});
			}
		});
		if(__data.length == 0) {
			errorCb && errorCb({type:'no_data', name:'error'});
		} else {
			cb && cb(__data, __closePrice);
		}

		//let args = [{'symbol':'ss600000',dateRange:[3, 5]}, {'symbol':'ss600000', dateRange:[7, 8]}];
		// let args = resObj.results.map((pattern, i) => {
			
		// 	const {id, begin, end} = pattern;

		// 	return {
		// 		'symbol':id,
		// 		'dateRange': [begin.time, end.time],
		// 		'lastDate': resObj.lastDates && resObj.lastDates[i],
		// 		'additionDate': additionDate,
		// 		'bars': bars,
		// 		'dataCategory': dataCategory,
		// 	};
		// });
	};
	
	// console.info('第一步: 搜索 [ 开始 ]');
	//	取消已有的搜索
	cancelSearch();
	//获取搜索结果
	__ksSearchXhr = KSSearch.searchPattern(searchArgs, searchCb, (err) => { 
		console.warn(`第一步: 搜索 [ 失败 ]`, err);
		errorCb && errorCb(err);
	});

};

let getData = () => {
	return __data;
};

module.exports = {
	searchPattern,
	getData,
	cancelSearch,
};
