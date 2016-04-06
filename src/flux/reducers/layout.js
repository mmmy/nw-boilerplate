import * as types from '../constants/ActionTypes';

const initalState = {
	stockView: true,
}

export default function layout(state = initalState, action) {
	console.log('layout action');
	switch (action.type) {
		case types.TOGGLE_STOCK_VIEW:
			state.stockView = !state.stockView;
			console.log(state);
			return state;

		default:
			return state;
	}
}