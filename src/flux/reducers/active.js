import * as types from '../constants/ActionTypes';

const initialState = {
  id: 0,
  symbol: null,
  dateStart: null,
  dateEnd: null
};

export default function active(state = initialState, action) {

  switch (action.type) {

    case types.SET_ACTIVE_ID:

      let { active } = action;
      let { id, symbol, dateStart, dateEnd } = active;
      if (id !== state.id){
        return {
        	...state,
        	id: id,
          symbol: symbol,
          dateStart: dateStart,
          dateEnd: dateEnd
        };
      }
      return state;

    default:
      return state;
  }
}
