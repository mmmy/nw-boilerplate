import * as types from '../constants/ActionTypes';

const initialState = {
  lastClosePrice: 0,
  predictionLastClosePrices: [] // 用作heatmap
};

export default function prediction(state = initialState, action) {
  switch (action.type) {
    case types.GET_LAST_CLOSE_PRICE:
      let lastClosePrice = action.lastClosePrice;
      return {
        ...state,
        lastClosePrice: lastClosePrice
      }

    case types.GET_ALL_PREDICTION_LAST_CLOSE_PRICES:
      let predictionLastClosePrices = action.predictionLastClosePrices;
      return {
        ...state,
        predictionLastClosePrices: predictionLastClosePrices
      }

    default:
      return state;
  }
}
