import * as types from '../constants/ActionTypes';


var toggleStockView = function toggleStockView() {
  return (dispatch) => {
    dispatch({
      type: types.TOGGLE_STOCK_VIEW,
    })
  }
};

var waitingForPatterns = function() {
  return {
    type: types.WAITING_PATTERNS
  };
};

module.exports = {
  toggleStockView,
  waitingForPatterns,
}
