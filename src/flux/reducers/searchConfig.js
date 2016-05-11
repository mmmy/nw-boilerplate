import * as types from '../constants/ActionTypes';
import { SPACE_DEFINITION, MATCH_TYPE } from '../constants/Const';

const initialState = {
	additionDate: {type:'days', value:30},
	searchSpace: '000010',
	dateRange: ['1990/01/01', '2016/04/30'],
	spaceDefinition: SPACE_DEFINITION.STOCK,
	matchType: MATCH_TYPE.MORPHO,
};

export default function searchConfig(state=initialState, action) {
	switch(action.type) {
		default: 
			return state;
	}
}