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

let _yieldDaterange = null;

let _setFilterYieldDateRange = _.debounce((dispatch) => {
	console.info('_setFilterYieldDateRange called');
	dispatch({
		type: types.SET_FILTER_YIELDDATERANGE,
		yieldDaterange: _yieldDaterange,
	});

}, debounceTime);

let setFilterYieldDateRange = function(yieldDaterange) {
	_yieldDaterange = yieldDaterange;
	return _setFilterYieldDateRange;
	return _.debounce((dispatch) => {
		dispatch({
			type: types.SET_FILTER_YIELDDATERANGE,
			yieldDaterange,
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