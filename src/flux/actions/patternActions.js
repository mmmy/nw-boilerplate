import * as types from '../constants/ActionTypes';
import ajaxData from '../../backend/ajaxData';
import crossfilter from 'crossfilter';

/**
 * 异步获取patterns
 * @param  {string}   symbol    [股票代码]
 * @param  {array}   dateRange  [日按]
 * @param  {Function} cb        [回调]
 * @return {[type]}             [description]
 */
let getPatterns = (symbol, dateRange, cb) => {
	console.log('patternActions: getPatterns',symbol, dateRange);
	return (dispacth) => {
		ajaxData.getPatterns((res) => {
			let patterns = JSON.parse(res);
			patterns.crossFilter = crossfilter(patterns.rawData);
			dispacth({type: types.CHANGE_PATTERNS, patterns});
			cb && cb();
		});
	};
}

module.exports = {
	getPatterns,
};