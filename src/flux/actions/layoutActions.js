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

const takeScreenshot = function takeScreenshot() {
  return (dispatch) => {
    dispatch({
      type: type.TAKE_SCREENSHOT,
    })
  };
};

const renderScreenshot = function renderScreenshot() {
  return (dispatch) => {
    dispatch({
      type: type.RENDER_SCREENSHOT,
    })
  };
};

module.exports = {
  toggleStockView,
  waitingForPatterns,
  togglePredictionPanel,
  takeScreenshot,
  renderScreenshot
}
