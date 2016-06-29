import * as types from '../constants/ActionTypes';

const initialState = {
  id: 0,
  symbol: null,
  dateStart: null,
  dateEnd: null,
  similarity: null,
  yieldRate: null
};

export default function active(state = initialState, action) {

  switch (action.type) {

    case types.SET_ACTIVE_ID:

      let { active } = action;
      let { id } = active;
      if (id !== state.id){
        let { symbol, dateStart, dateEnd, similarity, yieldRate } = active;
        return {
        	...state,
        	id: id,
          symbol: symbol,
          dateStart: dateStart,
          dateEnd: dateEnd,
          similarity: similarity,
          yieldRate: yieldRate
        };
      }
      return state;

    case types.CHANGE_PATTERNS:
      let pattern0 = action.patterns && action.patterns.rawData[0] || {};
      if (Object.keys(pattern0).length === 0 && pattern0.constructor === Object) {
        return state;
      } else {
        let { symbol, begin, end, similarity } = pattern0;
        let yieldRate = pattern0.yield;
        return {
          ...state,
          id: 0,
          symbol: symbol,
          dateStart: begin,
          dateEnd: end,
          similarity: similarity,
          yieldRate: yieldRate
        };
      }

    default:
      return state;
  }
}
