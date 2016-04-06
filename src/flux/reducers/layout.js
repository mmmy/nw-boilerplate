import * as types from '../constants/ActionTypes';

const initalState = {
	stockView: true,
}

export default function layout(state = initalState, action) {

	switch (action.type) {
		
		case types.TOGGLE_STOCK_VIEW:
			return {
				...state,
				stockView: !state.stockView
			};

		default:
			return state;
	}
}