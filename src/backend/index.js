import KSSearch from './KSSearch';
import KSDataService from './KSDataService';
import { getIndustry } from './SymbolDataLocal';
import store from '../store';
import lodash from 'lodash';
import updateEchartImage from '../components/helper/updateEchartImage';
let callFunc = updateEchartImage.callFunc;

let _growSimilarity = (similarity) => {
	if (similarity > 0.9999) {
		return similarity;
	} else {
		return similarity - 0.01 * Math.log((1 - similarity) * 10000);
	}
}

let __ksSearchXhr = null;
let __ksDataXhr_1 = null;
let __ksDataXhr_2 = null;

let __ksDataXhr_3 = null; //50 - 100
let __ksDataXhr_4 = null; //101 - 150
let __ksDataXhr_5 = null; //151 - 200

let cancelSearch = () => {
	__ksSearchXhr && __ksSearchXhr.abort && __ksSearchXhr.abort();
	__ksDataXhr_1 && __ksDataXhr_1.abort && __ksDataXhr_1.abort();
	__ksDataXhr_2 && __ksDataXhr_2.abort && __ksDataXhr_2.abort();
	__ksDataXhr_3 && __ksDataXhr_3.abort && __ksDataXhr_3.abort();
	__ksDataXhr_4 && __ksDataXhr_4.abort && __ksDataXhr_4.abort();
	__ksDataXhr_3 && __ksDataXhr_3.abort && __ksDataXhr_3.abort();

	__ksSearchXhr = null;
	__ksDataXhr_1 = null;
	__ksDataXhr_2 = null;
	__ksDataXhr_3 = null;
	__ksDataXhr_4 = null;
	__ksDataXhr_5 = null;
};

let __data = [];
/**
 * args: {symbol: , bars: , dateRange:{from: , to: }, additionDate:{type:'days', value: 30} }
 */
let __closePrice = [];

let searchPattern = (args, cb, errorCb) => {

	const { symbol, kline, bars, dateRange, searchConfig, dataCategory, interval} = args;

	let { additionDate, searchLenMax, isLatestDate, similarityThreshold, vsimilarityThreshold, dateThreshold} = searchConfig;

	let dr = searchConfig.dateRange;

	let searchArgs = { symbol, kline, dateRange, bars, additionDate, searchLenMax, isLatestDate, dataCategory, dr};

	let searchCb = (resObj) => {
		// console.info(`第一步: 搜索 [ 正常结束 ], 匹配到 ${resObj.results.length} 个`);
		__data = [];
		__closePrice = [];
		var args = [];
		var index = 0; //注意id永远是连续的!

		resObj.results.forEach((pattern, i) => {

			const {id, similarity= resObj.similarities && resObj.similarities[i], begin, end, industry=getIndustry(id), type=interval} = pattern;
			const vsimilarity = resObj.volumeSim && resObj.volumeSim[i] || 0;
			const lastDate = resObj.lastDates && resObj.lastDates[i];
			const _return = resObj.returns ? resObj.returns[i] : undefined;
			let kLine = [];
			//let id = i;
			//没有定义, 或者为false, 或者为true的时候在过滤范围内 , 这3个条件push
			var threshold0 = (!similarityThreshold) || (!similarityThreshold.on) || (similarityThreshold.on && (similarity >= similarityThreshold.value));
			var threshold1 = (!vsimilarityThreshold) || (!vsimilarityThreshold.on) || (vsimilarityThreshold.on && (vsimilarity >= vsimilarityThreshold.value));
			var threshold2 = true;
			if(dateRange && (dateRange.length > 0) && dateThreshold && dateThreshold.on && (id == symbol) && (i < 5)) {
				console.log(id, symbol, [begin.time, end.time], dateRange);
				var maxPercent = parseFloat(dateThreshold.value);
				var range1 = new Date(dateRange[0]),
						range2 = new Date(dateRange[1]);
				var d1 = new Date(begin.time),
						d2 = new Date(end.time);
				var percent = 0;
				if((d1 > range1) && (d1 < range2)) {      //有区间重合1
					percent = (range2 - d1) / (range2 - range1);
					console.log('percent', percent);
				} else if ((d2 > range1) && (d2 < range2)) {  //有区间重合2
					percent = (d2 - range1) / (range2 - range1);
					console.log('percent2', percent);
				}
				if(percent > maxPercent) {                     //比如超过30% 时间重合
					threshold2 = false;
				}
			}
			if(threshold0 && threshold1 && threshold2) {
				__data.push({
					id: index++,
					symbol: id,
					similarity: similarity,//_growSimilarity(similarity),
					vsimilarity: vsimilarity,//交易量相似度
					begin: begin.time,
					end: end.time,
					lastDate,
					industry,
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

		//获取kline具体数据
		let dataCb = (startIndex, klineArr) => {
			
			// console.info(`第二步: 获取kline具体数据 [ 正常结束 ], 返回 ${klineArr.length} 条记录`);

			klineArr.forEach(({ metaData, kLine, yieldRate }, i) => {
				let index = i + startIndex;
				__data[index].kLine = kLine;
				__data[index].metaData = metaData;
				__data[index].yield = __data[index].yield === undefined ? yieldRate : __data[index].yield;
				__data[index].industry = __data[index].industry || metaData.className || '未知行业';
			});

			if(startIndex === 0) { //获取到前五个 刷新state
				if(__data.length == 0) {
					errorCb && errorCb({type:'no_data', name:'error'});
				} else {
					cb && cb(__data, __closePrice);
				}
			} else {
				let endIndex = startIndex + klineArr.length;
				callFunc([startIndex, endIndex], __data);
			}
		};

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

		// console.log(resObj.results);
		// console.info('第二步: 获取kline具体数据 [ 开始 ]');
		//TODO: 需要配置初始获取数据的数量, 如 5 组数据
		let startIndex = 0,
				nextIndex = 3;
		__ksDataXhr_1 =  KSDataService.postSymbolData(startIndex, args.slice(0, nextIndex), bars, dataCb, (err) => {
			// console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
			errorCb && errorCb(err);
		});
		__ksDataXhr_2 = KSDataService.postSymbolData(nextIndex, args.slice(nextIndex, 31), bars, dataCb, (err) => {
			// console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
			errorCb && errorCb(err);
		});
		if(args.length > 30) {
			__ksDataXhr_3 = KSDataService.postSymbolData(31, args.slice(31), bars, dataCb, (err) => {
				// console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
				errorCb && errorCb(err);
			});
		}		
		// if(args.length > 100) {
		// 	__ksDataXhr_4 = KSDataService.postSymbolData(101, args.slice(101, 151), bars, dataCb, (err) => {
		// 		console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
		// 		errorCb && errorCb(err);
		// 	});
		// }		
		// if(args.length > 150) {
		// 	__ksDataXhr_5 = KSDataService.postSymbolData(151, args.slice(151, 201), bars, dataCb, (err) => {
		// 		console.warn(`第二步: 获取kline具体数据 [ 失败 ]`, err);
		// 		errorCb && errorCb(err);
		// 	});
		// }
	};
	
	// console.info('第一步: 搜索 [ 开始 ]');
	//	取消已有的搜索
	cancelSearch();
	//获取搜索结果
	console.log(searchArgs);
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
	cancelSearch,
};
