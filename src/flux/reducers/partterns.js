import * as types from '../constants/ActionTypes';

var randomData = function(n) {
	
}

const initialState = {
	data: [],
};

export default function partterns(state = initialState, actions){

	switch (actions.type) {

		case types.CHANGE_PARTTERNS:
			return actions.partterns || [];

		default:
			return state;
	}
}