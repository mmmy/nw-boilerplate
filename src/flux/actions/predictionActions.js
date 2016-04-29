import * as types from '../constants/ActionTypes';

const getLastClosePrice = function(lastClosePrice) {
  return (dispatch) => {
    dispatch({
      type: types.GET_LAST_CLOSE_PRICE,
      lastClosePrice: lastClosePrice
    })
  }
}

const getAllPredictionLastClosePrices = function() {
  return (dispatch) => {
    dispatch({
      type: types.GET_ALL_PREDICTION_LAST_CLOSE_PRICES,
      predictionLastClosePrices: predictionLastClosePrices
    })
  }
}

module.exports = {
  getLastClosePrice,
}
