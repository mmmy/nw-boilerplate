import * as types from '../constants/ActionTypes';

const setLastClosePrice = function(lastClosePrice) {
  return (dispatch) => {
    dispatch({
      type: types.SET_LAST_CLOSE_PRICE,
      lastClosePrice: lastClosePrice
    })
  }
}

const setAllPredictionLastClosePrices = function(predictionLastClosePrices) {
  return (dispatch) => {
    dispatch({
      type: types.SET_ALL_PREDICTION_LAST_CLOSE_PRICES,
      predictionLastClosePrices: predictionLastClosePrices
    })
  }
}

const setPredictionPriceScaleMarks = function(predictionPriceScaleMarks) {
  return (dispatch) => {
    dispatch({
      type: types.SET_PREDICTION_PRICE_SCALE_MARKS,
      predictionPriceScaleMarks: predictionPriceScaleMarks
    })
  }
}

const setHetmapOption = function(heatmapYAxis) {
  return (dispatch) => {
    dispatch({
      type: types.SET_HEATMAP_YAXIS,
      heatmapYAxis: heatmapYAxis
    })
  }
}

module.exports = {
  setLastClosePrice,
  setPredictionPriceScaleMarks,
  setAllPredictionLastClosePrices,
  setHetmapOption,
}
