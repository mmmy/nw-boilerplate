import { combineReducers } from 'redux';

function toggleStockView(state = true, action){

	switch (action.type) {
		case "TOGGLE_STOCK_VIEW":
			return !state;
		default:
			return state;
	}
};

export default combineReducers({
	toggleStockView,
});