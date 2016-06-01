import * as types from '../constants/ActionTypes';
//import { randomPartterns } from '../util/randomData';
import { randomPatterns } from '../util/randomKline';
import crossfilter from 'crossfilter';

let d1 = new Date();

let getInitialState = () => {
	let randomData = (process.env.NODE_ENV == 'development') ? randomPatterns(100) : randomPatterns(0);
	let initialState = {
		rawData: randomData.patterns,
		//crossFilter: function(){ return crossfilter(this.rawData); }(),
		closePrice: randomData.closePrice,
		error: null,
		searchConfig: null,
	};
	initialState.crossFilter = crossfilter(initialState.rawData);
	return initialState;
};

console.log('randomPatterns time spent', new Date() - d1);
// window.filter = initialState.crossFilter;

export default function patterns(state = getInitialState(), actions){

	switch (actions.type) {

		case types.CHANGE_PATTERNS:
			return actions.patterns || [];

		case types.GET_PATTERNS_ERROR:
			return {
				...state,
				error: actions.error,
			};

		default:
			return state;
	}
}
