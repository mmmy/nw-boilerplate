import * as types from '../constants/ActionTypes';
import * as sortTypes from '../constants/SortTypes';

const initialState = {
	sortType: '',
}

export default function filter(state = initialState, actions) {
	
	switch (actions.type) {

		case types.SORT_BY_DATE:

			let { sortType } = state;

			sortType = sortType === sortTypes.DATE ? 
						sortTypes.DATE_R : 
						(sortType === sortTypes.DATE_R ? '' : sortTypes.DATE);
			
			return {
				...state,
				sortType
			};

		default:
		  	return state;
	}

}