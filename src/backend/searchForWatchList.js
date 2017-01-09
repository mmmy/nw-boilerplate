import KSSearch from './KSSearch';
// import KSDataService from './KSDataService';
// import { getIndustry } from './SymbolDataLocal';
// import store from '../store';
// import lodash from 'lodash';
// import updateEchartImage from '../components/helper/updateEchartImage';
// let callFunc = updateEchartImage.callFunc;


/**
 * args: {symbol: , bars: , dateRange:{from: , to: }, additionDate:{type:'days', value: 30} }
 */

let SearchPattern = function() {

	this.__data = [];
	this.__closePrice = [];
	
	this.__ksSearchXhr = null;
	this.__ksDataXhr_1 = null;
	this.__ksDataXhr_2 = null;
}

SearchPattern.prototype._cancelSearch = function() {
		this.__ksSearchXhr && this.__ksSearchXhr.abort && this.__ksSearchXhr.abort();
		this.__ksDataXhr_1 && this.__ksDataXhr_1.abort && this.__ksDataXhr_1.abort();
		this.__ksDataXhr_2 && this.__ksDataXhr_2.abort && this.__ksDataXhr_2.abort();

		this.__ksSearchXhr = null;
		this.__ksDataXhr_1 = null;
		this.__ksDataXhr_2 = null;
}

SearchPattern.prototype.search = function(args, cb, errorCb) {
	const { symbol, kline, bars, dateRange, searchConfig, dataCategory, interval} = args;

	let { additionDate, searchLenMax, isLatestDate, similarityThreshold, vsimilarityThreshold, dateThreshold } = searchConfig;

	let dr = searchConfig.dateRange;

	let searchArgs = { symbol, kline, dateRange, bars, additionDate, searchLenMax, isLatestDate, dataCategory, dr};
	let that = this;
	let searchCb = (resObj) => {
		// console.info(`第一步: 搜索 [ 正常结束 ], 匹配到 ${resObj.results.length} 个`);
		let __data = [];
		let __closePrice = [];
		var args = [];
		var index = 0;

		resObj.results.forEach((pattern, i) => {

			const {id, similarity= resObj.similarities && resObj.similarities[i], begin, end, type=interval} = pattern;
			const vsimilarity = resObj.volumeSim && resObj.volumeSim[i] || 0;
			const lastDate = resObj.lastDates && resObj.lastDates[i];
			const _return = resObj.returns ? resObj.returns[i] : undefined;
			let kLine = [];
			//let id = i;
			var threshold0 = (!similarityThreshold) || (!similarityThreshold.on) || (similarityThreshold.on && (similarity >= similarityThreshold.value));
			var threshold1 = (!vsimilarityThreshold) || (!vsimilarityThreshold.on) || (vsimilarityThreshold.on && (vsimilarity >= vsimilarityThreshold.value));
			var threshold2 = true;
			if(dateRange && (dateRange.length > 0) && dateThreshold && dateThreshold.on && (id == symbol) && (i < 5)) {
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
			console.warn({type:'no_data', name:'error'}, symbol, searchConfig);
		} else {
			// cb && cb(__data, __closePrice);
		}
		cb && cb(__data, __closePrice);
		that.__data = __data;
		that.__closePrice = __closePrice;
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
	that._cancelSearch();
	//获取搜索结果
	that.__ksSearchXhr = KSSearch.searchPattern(searchArgs, searchCb, (err) => { 
		console.warn(`第一步: 搜索 [ 失败 ]`, err);
		errorCb && errorCb(err);
	});

};

module.exports = { SearchPattern }
