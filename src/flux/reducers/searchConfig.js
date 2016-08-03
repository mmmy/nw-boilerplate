import * as types from '../constants/ActionTypes';
import { SPACE_DEFINITION, MATCH_TYPE } from '../constants/Const';

const initialState = {
	additionDate: {type:'days', value:30},
	searchSpace: '000010',
	dateRange: ['1990/01/01', '2016/04/30'],
	spaceDefinition: { stock: true, future: false },
	matchType: MATCH_TYPE.MORPHO,
	searchLenMax: 200
};

export default function searchConfig(state=initialState, action) {
	switch(action.type) {
		
		case types.SET_SEARCH_CONFIG:
			let { searchConfig } = action;
			return searchConfig;

		default: 
			return state;
	}
}