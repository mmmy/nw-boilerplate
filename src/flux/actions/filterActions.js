import * as types from '../constants/ActionTypes';


var setFilterIndustry = function(industry) {

	return {
		type: types.SET_FILTER_INDUSTRY,
		industry,
	}

}

var setFilterYieldRange = function(yieldRange) {

	return {
		type: types.SET_FILTER_YIELDRANGE,
		yieldRange,
	}

}


module.exports = {
	setFilterIndustry,
	setFilterYieldRange,
}