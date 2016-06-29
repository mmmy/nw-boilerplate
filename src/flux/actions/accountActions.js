import * as types from '../constants/ActionTypes';

let setUser = (username, password, autoLogin) => {
	return {type: types.SET_USER, username, password, autoLogin};
};

module.exports = {
	setUser,
}