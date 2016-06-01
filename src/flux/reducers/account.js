import * as types from '../constants/ActionTypes';

const initialState = {
	username:'',
	password:'',
	autoLogin:''
};

export default function active(state = initialState, action) {
	switch (action.type) {
		case types.SET_USER:
			let {username, password, autoLogin} = action;
			return {
				...state,
				username,
				password,
				autoLogin,
			};
			
		default:
			return state;
	}
}