import * as types from '../constants/ActionTypes';

const initialState = {
  lastClosePrice: 0,
  heatmapYAxis: 0,
  manulScale: 1,
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

    case types.SET_HEATMAP_YAXIS:
      let { heatmapYAxis, scaleMaxValue, scaleMinValue } = action;
      return {
        ...state,
        heatmapYAxis: heatmapYAxis || state.heatmapYAxis,
        scaleMaxValue: scaleMaxValue || state.scaleMaxValue,
        scaleMinValue: scaleMinValue || state.scaleMinValue
      }

    default:
      return state;
  }
}
