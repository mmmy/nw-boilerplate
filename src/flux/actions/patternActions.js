import * as types from '../constants/ActionTypes';
import ajaxData from '../../backend/ajaxData';
import crossfilter from 'crossfilter';

let getPatterns = () => {

	return (dispacth) => {
		ajaxData.getPatterns((res) => {
			let patterns = JSON.parse(res);
			patterns.crossFilter = crossfilter(patterns.rawData);
			dispacth({type: types.CHANGE_PATTERNS, patterns});
		});
	};
}

module.exports = {
	getPatterns,
};