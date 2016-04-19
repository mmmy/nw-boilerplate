import * as types from '../constants/ActionTypes';


let setFilterIndustry = function(industry) {

	return {
		type: types.SET_FILTER_INDUSTRY,
		industry,
	}

}

let setFilterYieldRange = function(yieldRange) {

	return {
		type: types.SET_FILTER_YIELDRANGE,
		yieldRange,
	}

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

module.exports = {
	setFilterIndustry,
	setFilterYieldRange,
	setFilterSymbol,
	setFilterSimilarity,
}