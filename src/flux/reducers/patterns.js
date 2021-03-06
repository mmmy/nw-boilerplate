import * as types from '../constants/ActionTypes';
//import { randomPartterns } from '../util/randomData';
import { randomPatterns } from '../util/randomKline';
import crossfilter from 'crossfilter';

let getInitialState = () => {
	let randomData = (process.env.NODE_ENV == 'development') ? randomPatterns(10) : randomPatterns(0);
	let initialState = {
		searchMetaData: null,
		rawData: randomData.patterns,
		//crossFilter: function(){ return crossfilter(this.rawData); }(),
		closePrice: randomData.closePrice,
		error: null,
		searchConfig: null,
	};
	initialState.crossFilter = crossfilter(initialState.rawData);
	return initialState;
};

let initialState = getInitialState();
// window.filter = initialState.crossFilter;

module.exports = {
	patterns: function patterns(state = initialState, actions){

		switch (actions.type) {

			case types.CHANGE_PATTERNS:
				actions.patterns.crossFilter = actions.patterns.crossFilter || crossfilter([]);
				return actions.patterns || [];

			case types.GET_PATTERNS_ERROR:
				state.error = actions.error;
				return state;    //不进行刷新

			case types.RESET_ERROR:
				state.error = null;
				return state;

			default:
				return state;
		}
	},
	
	initialState: initialState
}
