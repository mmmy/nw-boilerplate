import * as types from '../constants/ActionTypes';
//import { randomPartterns } from '../util/randomData';
import { randomPartterns } from '../util/randomKline';

const initialState = {
	data: (process.env.NODE_ENV == 'development' ? randomPartterns(20) : []),
};

export default function patterns(state = initialState, actions){

	switch (actions.type) {

		case types.CHANGE_PATTERNS:
			return actions.patterns || [];

		default:
			return state;
	}
}