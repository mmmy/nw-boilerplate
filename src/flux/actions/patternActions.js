import * as types from '../constants/ActionTypes';
import ajaxData from '../../backend/ajaxData';
import backend from '../../backend';
import crossfilter from 'crossfilter';
import store from '../../store';
import datafeedCache from '../../cache/datafeedCache';
let { getDataCategory } = datafeedCache;

import stockviewController from '../../ksControllers/stockviewController';
import searchResultController from '../../ksControllers/searchResultController';
import wavesController from '../../ksControllers/wavesController';
import { afterSearchMessage } from '../../ksControllers/messager';
// import { updateCanvasVisible } from '../../components/helper/updateEchartImage';

let historyController = stockviewController.historyController;
// window._historyController2 = historyController;
// import { setComparatorVisibleRange } from '../../shared/actionTradingview';

let startSearch = ()=>{
	// searchResultController.removeErrorPanel();
	searchResultController.reportSlideDown(true);
	wavesController.start();
	wavesController.speedUp();
	// updateCanvasVisible(true);
};
let searchSuccess = (patterns, searchTimeSpent)=>{
	$(document.body).removeClass('watchlist');
	searchResultController.removeErrorPanel();
	searchResultController.reportSlideDown(false, ()=>{
		// afterSearchMessage(patterns.rawData.length, searchTimeSpent);
	});
	wavesController.stop();
};
let searchError = (searchKline, error)=>{
	searchResultController.reportSlideDown(false);
	searchResultController.showErrorPanel(searchKline, error);
	wavesController.stop();
};

/**
 * 异步获取patterns
 * @param  {string}   symbol    [股票代码]
 * @param  {array}   dateRange  [日按]
 * @param  {Function} cb        [回调]
 * @return {[type]}             [description]
 */

const devLocal = false;
let _lastSearch = {};

let getPatterns = ({symbol, dateRange, bars, interval, type, lastDate, kline, edited=false, searchConfig, dataCategory, name='未命名', favoriteFolder='', state={isTrashed: false, trashDate:null}}, cb) => {
	//console.log('patternActions: getPatterns',symbol, dateRange);
	startSearch();
	if(kline) {
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
	}
	//console.log(kline);

	//保存历史
	let isNewSearch = false;
	if(symbol) isNewSearch = true;

	symbol = symbol || _lastSearch.symbol;
	dateRange = dateRange || _lastSearch.dateRange;
	bars = bars || _lastSearch.bars;
	dataCategory = dataCategory || $.keyStone.resolutionToDataCategory({type:type, resolution:interval}) || getDataCategory();
	kline = kline || _lastSearch.kline;
	// setComparatorVisibleRange({from: +new Date(dateRange[0])/1000, to: +new Date(lastDate)/1000}, '0');
	//缓存上一次的
	_lastSearch.symbol = symbol;
	_lastSearch.dateRange = dateRange;
	_lastSearch.bars = bars;
	_lastSearch.dataCategory = dataCategory;
	_lastSearch.kline = kline;

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
			
			backend.searchPattern({symbol, kline, dateRange, bars, searchConfig, dataCategory, interval},

				(resArr, closePrice) => {

					let searchTimeSpent = new Date() - startTime;
					let patterns = {
						rawData: resArr,
						closePrice: closePrice || [],
						searchMetaData: { symbol, dateRange, bars, lastDate, kline, edited, interval, searchTimeSpent }
					};
					patterns.crossFilter = crossfilter(patterns.rawData);
					patterns.searchConfig = searchConfig;
					//保存历史
					searchSuccess(patterns, searchTimeSpent);
					setTimeout(() => { historyController.pushHistory({symbol, dateRange,bars, interval, type, kline, edited, lastDate, searchConfig, dataCategory, name, favoriteFolder, state}); });
					dispacth({type: types.CHANGE_PATTERNS, patterns, searchTimeSpent});
					cb && cb();

				}, (error) => {
					//请求错误后的处理
					console.error(error);
					searchError(kline, error);
					// dispacth({type: types.GET_PATTERNS_ERROR, error: error});
				}
			);
		}

	};
};

let resetError = () => {
	return {type: types.RESET_ERROR};
};

let getLastKline = () => {
	return _lastSearch.kline;
};
//设置patterns的备份版本, 用来刷新详情页, 当切换到第二页时候调用
let changePatternsAsync = () => {
	let patterns = store.getState().patterns;
	return {type: types.CHANGE_PATTERNS_ASYNC, patterns: patterns};
};

module.exports = {
	getPatterns,
	resetError,
	getLastKline,
	changePatternsAsync,
};
