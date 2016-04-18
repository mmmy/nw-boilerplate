import * as types from '../constants/ActionTypes';

const initialState = {
	industrys: [],
	yieldRange: [], //收益率

};

export default function filter(state = initialState, actions) {
	switch (actions.type) {

		case types.SET_FILTER_INDUSTRY:

			let industrys = state.industrys,
				industry = actions.industry;

			if(industrys.indexOf(industry) != -1) {
				industrys.splice(industrys.indexOf(industry), 1);
			} else {
				industrys.push(industry);
			}

			return {
				...state,
				industrys
			};

		case types.SET_FILTER_YIELDRANGE: //收益率

			let yieldRange = actions.yieldRange || [];

			return {
				...state,
				yieldRange,
			};

		default:
			return state;
	}
}