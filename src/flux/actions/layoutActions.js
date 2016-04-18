import * as types from '../constants/ActionTypes';
 

let toggleStockView = function toggleStockView() {
	// return (dispatch) => {
	// 	dispatch(() => {
	// 		return {
	// 			type: types.TOGGLE_STOCK_VIEW
	// 		}	
	// 	});
	// }
	return (dispatch) => {
		dispatch({
			type: types.TOGGLE_STOCK_VIEW,
		})
	}
	// return {
	// 		type: types.TOGGLE_STOCK_VIEW,
	// 		}
};

let waitingForPatterns = function() {
	return {
		type: types.WAITING_PATTERNS
	};
};

module.exports = {
	toggleStockView,
	waitingForPatterns,
}