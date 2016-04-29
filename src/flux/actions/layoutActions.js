import * as types from '../constants/ActionTypes';


const waitingForPatterns = function() {
  return {
    type: types.WAITING_PATTERNS
  };
};

const toggleStockView = function toggleStockView() {
	return (dispatch) => {
		dispatch({
			type: types.TOGGLE_STOCK_VIEW,
		})
	};
};

const togglePredictionPanel = function togglePredictionPanel() {
  return (dispatch) => {
    dispatch({
      type: types.TOGGLE_PREDICTION_PANEL
    })
  };
};

module.exports = {
  toggleStockView,
  waitingForPatterns,
  togglePredictionPanel,
}
