import { STOCK_VIEW } from '../flux/constants/Const';
const comparatorId = 'comparator-chart';

let _stockViewWindow = null;
let _comparatorWindow = null;

let _searchRangeCache = null;

let _getStockViewWindow = () => {
	_stockViewWindow = _stockViewWindow || document.querySelector(`#${STOCK_VIEW} iframe`) && document.querySelector(`#${STOCK_VIEW} iframe`).contentWindow;
	return _stockViewWindow;
}

let _getComparatorWindow = () => {
	_comparatorWindow = _comparatorWindow || document.querySelector(`#${comparatorId} iframe`) && document.querySelector(`#${comparatorId} iframe`).contentWindow;
	return _comparatorWindow
};
//range = {from: , to:}, widgetIndex = '0', '1'
let setComparatorVisibleRange = (range, widgetIndex) => {
	_searchRangeCache = range || _searchRangeCache;
	let chartWindow = _getComparatorWindow();
	if(chartWindow && _searchRangeCache) {
		try {
			chartWindow.setVisbleRange(_searchRangeCache, widgetIndex + '');
		} catch (e) {

		}
	}
}

let setComparatorPosition = (unixTime, offsetIndex , y) => {
	let context = _getComparatorWindow();
	let Q5 = context && context.Q5;
	if(Q5) {
		try {
			let chart = Q5.getAll()[0];
			let model = chart.R99.m_model;
			let timeScale = model.m_timeScale;
			// let x = timeScale.timeToCoordinate(unixTime);
			let startIndex = timeScale.timePointToIndex(unixTime);
			let x = timeScale.indexToCoordinate(startIndex + offsetIndex);
			model.setCurrentPosition(x, y, model.paneForSource(model.m_mainSeries));
		} catch (e) {
			console.error(e);
		}
	}
};

let setStockViewSymbol = (symbol) => {
	let context = _getStockViewWindow();
	let Q5 = context && context.Q5;
	if(Q5) {
		try {
			let chart = Q5.getAll()[0];
			chart.setSymbol(symbol);
		} catch (e) {
			console.error(e);
		}
	}
};

module.exports = {
	setComparatorVisibleRange,
	setComparatorPosition,
	setStockViewSymbol,
}