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

module.exports = {
	setComparatorVisibleRange,
}