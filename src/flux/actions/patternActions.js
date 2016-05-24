import * as types from '../constants/ActionTypes';
import ajaxData from '../../backend/ajaxData';
import backend from '../../backend';
import crossfilter from 'crossfilter';
import store from '../../store';
/**
 * 异步获取patterns
 * @param  {string}   symbol    [股票代码]
 * @param  {array}   dateRange  [日按]
 * @param  {Function} cb        [回调]
 * @return {[type]}             [description]
 */

const devLocal = false;

let getPatterns = ({symbol, dateRange, bars}, cb) => {
	//console.log('patternActions: getPatterns',symbol, dateRange);
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

			let { searchConfig } = store.getState();

			backend.searchPattern({symbol, dateRange, bars, searchConfig}, 

				(resArr) => {

					let patterns = {
						rawData: resArr,
					};
					patterns.crossFilter = crossfilter(patterns.rawData);
					let searchTimeSpent = new Date() - startTime;
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
}

module.exports = {
	getPatterns,
};