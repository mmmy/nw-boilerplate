import * as types from '../constants/ActionTypes';
import { setPrediction } from '../../shared/stockViewActions';

let setSearchConfig = (searchConfig) => {
	let { type, value } = searchConfig.additionDate;
	setPrediction(type, value);
	return {type: types.SET_SEARCH_CONFIG, searchConfig};
};

module.exports = {
	setSearchConfig,
};