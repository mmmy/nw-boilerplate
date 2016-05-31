import * as types from '../constants/ActionTypes';
import * as sortTypes from '../constants/SortTypes';

const initialState = {
	sortType: '',
}

export default function filter(state = initialState, action) {
	
	let { sortType } = state;
	
	switch (action.type) {

		case types.SORT_BY_DATE: //日期

			sortType = sortType === sortTypes.DATE ? 
						sortTypes.DATE_R : 
						(sortType === sortTypes.DATE_R ? '' : sortTypes.DATE);
			
			return {
				...state,
				sortType
			};

		case types.SORT_BY_SIMILARITY: //相似度

			sortType = sortType === sortTypes.SIMILARITY ?
						sortTypes.SIMILARITY_R :
						(sortType === sortTypes.SIMILARITY_R ? '' : sortTypes.SIMILARITY);

			return {
				...state,
				sortType
			};

		case types.SORT_BY_YIELD: //收益率

			sortType = sortType === sortTypes.YIELD ?
						sortTypes.YIELD_R :
						(sortType === sortTypes.YIELD_R ? '' : sortTypes.YIELD);

			return {
				...state,
				sortType
			};

		case types.CHANGE_PATTERNS: //重置

			return {
				...state,
				sortType: ''
			};

		default:
		  	return state;
	}

}