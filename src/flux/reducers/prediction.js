import * as types from '../constants/ActionTypes';

const initialState = {
  lastClosePrice: 0,
  predictionLastClosePrices: [],    // 用作heatmap
  predictionPriceScaleMarks: [],    // 用作heatmap
  heatmapYAxis: [],
  scaleMaxValue: 0,
  scaleMinValue:0
};

export default function prediction(state = initialState, action) {
  switch (action.type) {
    case types.SET_LAST_CLOSE_PRICE:
      let lastClosePrice = action.lastClosePrice;
      return {
        ...state,
        lastClosePrice: lastClosePrice
      }

    case types.SET_ALL_PREDICTION_LAST_CLOSE_PRICES:
      let predictionLastClosePrices = action.predictionLastClosePrices;
      return {
        ...state,
        predictionLastClosePrices: predictionLastClosePrices
      }

    case types.SET_PREDICTION_PRICE_SCALE_MARKS:
      let predictionPriceScaleMarks = action.predictionPriceScaleMarks;
      return {
        ...state,
        predictionPriceScaleMarks: predictionPriceScaleMarks
      }

    case types.SET_HEATMAP_YAXIS:
      let { heatmapYAxis, scaleMaxValue, scaleMinValue } = action;
      return {
        ...state,
        heatmapYAxis: heatmapYAxis,
        scaleMaxValue: scaleMaxValue,
        scaleMinValue: scaleMinValue
      }

    default:
      return state;
  }
}
