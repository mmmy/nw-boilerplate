import * as types from '../constants/ActionTypes';

let setActiveId = (id) => {
	return { type: types.SET_ACTIVE_ID, id };
};

module.exports = {
	setActiveId,
};