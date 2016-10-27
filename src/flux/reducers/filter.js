import * as types from '../constants/ActionTypes';

const initialState = {
	industrys: [],
	yieldRange: [], //收益率
	symbol: '',
	similarity: {min:0, max:100},
	yieldDateRange: [],
	trashedIdArr: []
};

export default function filter(state = initialState, actions) {
	switch (actions.type) {

		case types.SET_FILTER_INDUSTRY:

			let industrys = state.industrys,
				industry = actions.industry;

			if(industry === null) {
				return {
					...state,
					industrys:[]
				};
			}

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

		case types.SET_FILTER_SYMBOL:

			let { symbol } = actions;

			return {
				...state,
				symbol,
			};

		case types.SET_FILTER_SIMILARITY:

			let { similarity } = actions;

			return {
				...state,
				similarity,
			};

		case types.SET_FILTER_YIELDDATERANGE:

			let yieldDateRange = actions.yieldDateRange || [];

			return {
				...state,
				yieldDateRange,
			};

		case types.SET_FILTER_ID:
			let trashedIdArr = actions.trashedIdArr;
			return {
				...state,
				trashedIdArr,
			};

		case types.CHANGE_PATTERNS:
			// state.industrys = initialState.industrys;
			// state.yieldRange = initialState.yieldRange;
			// state.symbol = initialState.symbol;
			// state.similarity = initialState.similarity;
			// state.yieldDateRange = initialState.yieldRange;
			// state.trashedIdArr = initialState.trashedIdArr;
			state = {
				industrys: [],
				yieldRange: [], //收益率
				symbol: '',
				similarity: {min:0, max:100},
				yieldDateRange: [],
				trashedIdArr: []
			};
			return state;
			
		default:
			return state;
	}
}