import * as types from '../constants/ActionTypes';

let setSearchConfig = (searchConfig) => {
	return {type: types.SET_SEARCH_CONFIG, searchConfig};
};

module.exports = {
	setSearchConfig,
};