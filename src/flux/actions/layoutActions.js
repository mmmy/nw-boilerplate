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
      type: types.TAKE_SCREENSHOT,
    })
  };
};

const renderScreenshot = function renderScreenshot() {
  return (dispatch) => {
    dispatch({
      type: types.RENDER_SCREENSHOT,
    })
  };
};

const showConfigModal = function() {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: types.SHOW_CONFIG_MODAL,
      });
    });
  };
};

const closeConfigModal = function() {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: types.CLOSE_CONFIG_MODAL,
      });
    });
  };
};


module.exports = {
  toggleStockView,
  waitingForPatterns,
  togglePredictionPanel,
  takeScreenshot,
  renderScreenshot,
  showConfigModal,
  closeConfigModal,
}
