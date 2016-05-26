import * as types from '../constants/ActionTypes';

const initialState = {
	showNotTrashed: true,
	showTrashed: true,
};

export default function active(state = initialState, action) {
	switch(action.type) {
		case types.SET_PATTERN_TRASH_LAYOUT:
			let {showTrashed, showNotTrashed} = action;
			return {
				...state,
				showNotTrashed,
				showTrashed,
			}

		default:
			return state;
	}
}