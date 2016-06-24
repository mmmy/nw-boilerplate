import * as types from '../constants/ActionTypes';

const setLastClosePrice = function(lastClosePrice) {
  return (dispatch) => {
    dispatch({
      type: types.SET_LAST_CLOSE_PRICE,
      lastClosePrice: lastClosePrice
    })
  }
}

const setHetmapOption = function(heatmapYAxis, scaleMaxValue, scaleMinValue) {
  return (dispatch) => {
    dispatch({
      type: types.SET_HEATMAP_YAXIS,
      heatmapYAxis: heatmapYAxis,
      scaleMaxValue: scaleMaxValue,
      scaleMinValue: scaleMinValue
    })
  }
}

module.exports = {
  setLastClosePrice,
  setHetmapOption,
}
