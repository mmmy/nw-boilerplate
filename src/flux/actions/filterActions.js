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


module.exports = {
	setFilterIndustry,
	setFilterYieldRange,
}