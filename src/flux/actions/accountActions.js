import * as types from '../constants/ActionTypes';

let setUser = (info) => {
	return {type: types.SET_USER, info};
};

module.exports = {
	setUser,
}