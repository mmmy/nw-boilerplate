import * as types from '../constants/ActionTypes';

const initialState = {
	username:  process.env.NODE_ENV == 'development' ? '' : '',
	password:'',
	autoLogin:'',
	loginState:null, //服务器返回的登录信息
};

export default function active(state = initialState, action) {
	switch (action.type) {
		case types.SET_USER:
			let {username, password, autoLogin, loginState} = action.info;
			return {
				...state,
				username,
				password,
				autoLogin,
				loginState
			};
			
		default:
			return state;
	}
}