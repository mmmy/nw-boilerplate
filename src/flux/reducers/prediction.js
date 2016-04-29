import * as types from '../constants/ActionTypes';

const initialState = {
  lastClosePrice: 0
};

export default function prediction(state = initialState, action) {
  switch (action.type) {
    case types.GET_LAST_CLOSE_PRICE:
      let lastClosePrice = action.lastClosePrice;
      return {
        ...state,
        lastClosePrice: lastClosePrice
      }

    default:
      return state;
  }
}
