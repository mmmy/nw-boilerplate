import * as types from '../constants/ActionTypes';
import _ from 'underscore';

const debounceTime = 100;

let _setFilterIndustry = function(industry, dispatch) {

	dispatch({
		type: types.SET_FILTER_INDUSTRY,
		industry,
	});

};

let _setFilterIndustryDebounce = _.debounce(_setFilterIndustry, debounceTime);

let setFilterIndustry = function(industry) {

	return _.debounce((dispatch) => {
		dispatch({
			type: types.SET_FILTER_INDUSTRY,
			industry,
		});
	}, debounceTime);

}

let setFilterYieldRange = function(yieldRange) {
	
	return _.debounce((dispatch) => {
		console.info('setFilterYieldRange called');
		dispatch({
			type: types.SET_FILTER_YIELDRANGE,
			yieldRange,
		});
	}, debounceTime);

}

let setFilterSymbol = function(symbol) {

	return {
		type: types.SET_FILTER_SYMBOL,
		symbol,
	};

}

let setFilterSimilarity = function(similarity) {

	return {
		type: types.SET_FILTER_SIMILARITY,
		similarity,
	}
}

let _yieldDateRange = null;

let _setFilterYieldDateRange = _.debounce((dispatch) => {
	console.info('_setFilterYieldDateRange called');
	dispatch({
		type: types.SET_FILTER_YIELDDATERANGE,
		yieldDateRange: _yieldDateRange,
	});

}, debounceTime);

let setFilterYieldDateRange = function(yieldDateRange) {
	_yieldDateRange = yieldDateRange;
	return _setFilterYieldDateRange;
	return _.debounce((dispatch) => {
		dispatch({
			type: types.SET_FILTER_YIELDDATERANGE,
			yieldDateRange,
		});
	}, debounceTime);
	// return {
	// 	type: types.SET_FILTER_YIELDDATERANGE,
	// 	yieldDaterange,
	// }
}

let setFilterId = (trashedIdArr) => { 
	return {type: types.SET_FILTER_ID, trashedIdArr};
}; 

module.exports = {
	setFilterIndustry,
	setFilterYieldRange,
	setFilterYieldDateRange,
	setFilterSymbol,
	setFilterSimilarity,
	setFilterId,
}