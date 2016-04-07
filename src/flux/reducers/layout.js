import * as types from '../constants/ActionTypes';

let getPatternSmallView = function() {
	return window.innerWidth < 1000;
}

const initalState = {
	stockView: true,
	patternSmallView: getPatternSmallView(),
}

export default function layout(state = initalState, action) {

	switch (action.type) {
		
		case types.TOGGLE_STOCK_VIEW:
			return {
				...state,
				stockView: !state.stockView
			};
		case types.RE_LAYOUT:
			let patternSmallView = getPatternSmallView();
			if (state.patternSmallView == patternSmallView) return state;
			return {
				...state,
				patternSmallView
			};
		default:
			return state;
	}
}