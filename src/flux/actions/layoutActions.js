import * as types from '../constants/ActionTypes';
 

export function toggleStockView() {
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
}