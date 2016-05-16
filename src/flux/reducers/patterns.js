import * as types from '../constants/ActionTypes';
//import { randomPartterns } from '../util/randomData';
import { randomPartterns } from '../util/randomKline';
import crossfilter from 'crossfilter';

let d1 = new Date();
let initialState = {
	rawData: (process.env.NODE_ENV == 'development' ? randomPartterns(6) : randomPartterns(200)),
	//crossFilter: function(){ return crossfilter(this.rawData); }(),
	error: null,
};
initialState.crossFilter = crossfilter(initialState.rawData);

console.log('randomPartterns time spent', new Date() - d1);
window.filter = initialState.crossFilter;

export default function patterns(state = initialState, actions){

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