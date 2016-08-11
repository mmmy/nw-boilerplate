import * as types from '../constants/ActionTypes';
import ajaxData from '../../backend/ajaxData';
import backend from '../../backend';
import crossfilter from 'crossfilter';
import store from '../../store';
import datafeedCache from '../../cache/datafeedCache';
let { getDataCategory } = datafeedCache;

import stockviewController from '../../ksControllers/stockviewController';
let historyController = stockviewController.historyController;
// window._historyController2 = historyController;
// import { setComparatorVisibleRange } from '../../shared/actionTradingview';
/**
 * 异步获取patterns
 * @param  {string}   symbol    [股票代码]
 * @param  {array}   dateRange  [日按]
 * @param  {Function} cb        [回调]
 * @return {[type]}             [description]
 */

const devLocal = false;
let _lastSearch = {};

let getPatterns = ({symbol, dateRange, bars, interval, type, lastDate, kline, edited=false, searchConfig, dataCategory}, cb) => {
	//console.log('patternActions: getPatterns',symbol, dateRange);
	let klineClone = [];
	kline.forEach((arr) => { //消除echart 的bug
		let prices = []; 
		arr.forEach((e) => {
			prices.push(e);
		});
		klineClone.push(prices);
	});
	kline = klineClone;
	console.assert(kline[0].length == 5 && (kline instanceof Array));

	//保存历史
	let isNewSearch = false;
	if(symbol) isNewSearch = true;

	symbol = symbol || _lastSearch.symbol;
	dateRange = dateRange || _lastSearch.dateRange;
	bars = bars || _lastSearch.bars;
	dataCategory = dataCategory || getDataCategory();
	// setComparatorVisibleRange({from: +new Date(dateRange[0])/1000, to: +new Date(lastDate)/1000}, '0');
	//缓存上一次的
	_lastSearch.symbol = symbol;
	_lastSearch.dateRange = dateRange;
	_lastSearch.bars = bars;
	_lastSearch.dataCategory = dataCategory;

	return (dispacth) => {

		const startTime = new Date();

		if (devLocal) {
			
			ajaxData.getPatterns(
				
				{symbol, dateRange},
				
				(res) => {
					let patterns = JSON.parse(res);
					patterns.crossFilter = crossfilter(patterns.rawData);
					let searchTimeSpent = 100;
					dispacth({type: types.CHANGE_PATTERNS, patterns, searchTimeSpent});
					cb && cb();
				},

				(error) => {
					//请求错误后的处理
					console.error(error);
					dispacth({type: types.GET_PATTERNS_ERROR, error: error});
				}
			);

		} else {

			// let { searchConfig } = store.getState();
			searchConfig = searchConfig || store.getState().searchConfig;

			backend.searchPattern({symbol, dateRange, bars, searchConfig, dataCategory},

				(resArr, closePrice) => {

					let patterns = {
						rawData: resArr,
						closePrice: closePrice || [],
						searchMetaData: { symbol, dateRange, bars, lastDate, kline, edited }
					};
					patterns.crossFilter = crossfilter(patterns.rawData);
					patterns.searchConfig = searchConfig;
					let searchTimeSpent = new Date() - startTime;
					//保存历史
					setTimeout(() => { historyController.pushHistory({symbol, dateRange,bars, interval, type, kline, edited, lastDate, searchConfig, dataCategory, name:'未命名'}); });
					dispacth({type: types.CHANGE_PATTERNS, patterns, searchTimeSpent});
					cb && cb();

				}, (error) => {
					//请求错误后的处理
					console.error(error);
					dispacth({type: types.GET_PATTERNS_ERROR, error: error});
				}
			);
		}

	};
};

let resetError = () => {
	return {type: types.RESET_ERROR};
};

module.exports = {
	getPatterns,
	resetError,
};