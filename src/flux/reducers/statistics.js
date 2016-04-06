import * as types from '../constants/ActionTypes';

const initialState = [];

export default function statistics(state = initialState, actions){
	
	switch (actions.type) {

		case types.CHANGE_STATISTICS:
			return actions.statistics || [];

		default:
			return state;
	}
}