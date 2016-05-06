import * as types from '../constants/ActionTypes';

const initialState = {
  id: 0
};

export default function active(state = initialState, action) {
  
  switch (action.type) {
  
    case types.SET_ACTIVE_ID:
    
      let { id } = action;
      if (id !== state.id){
        return {
        	...state,
        	id,
        };
      }
      return state;

    default:
      return state;
  }
}
