import * as types from '../constants/ActionTypes';

let setPatternTrashLayout = (showTrashed, showNotTrashed) => {
	return { type:types.SET_PATTERN_TRASH_LAYOUT, showTrashed, showNotTrashed };
};

module.exports = {
	setPatternTrashLayout
};