import * as types from '../constants/ActionTypes';

const getLastClosePrice = function(lastClosePrice) {
  return (dispatch) => {
    dispatch({
      type: types.GET_LAST_CLOSE_PRICE,
      lastClosePrice: lastClosePrice
    })
  }
}

const getAllPredictionLastClosePrices = function(predictionLastClosePrices) {
  return (dispatch) => {
    dispatch({
      type: types.GET_ALL_PREDICTION_LAST_CLOSE_PRICES,
      predictionLastClosePrices: predictionLastClosePrices
    })
  }
}

const getPredictionPriceScaleMarks = function(predictionPriceScaleMarks) {
  return (dispatch) => {
    dispatch({
      type: types.GET_PREDICTION_PRICE_SCALE_MARKS,
      predictionPriceScaleMarks: predictionPriceScaleMarks
    })
  }
}

module.exports = {
  getLastClosePrice,
  getPredictionPriceScaleMarks
}
