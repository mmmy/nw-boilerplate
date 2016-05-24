import * as types from '../constants/ActionTypes';

const initialState = {
  showConfigModal: true,
};

export default function active(state = initialState, action) {
  switch (action.type) {

  	case types.SHOW_CONFIG_MODAL:
  		return {
  			...state,
  			showConfigModal: true,
  		};
  		break;

  	case types.CLOSE_CONFIG_MODAL:
  		return {
  			...state,
  			showConfigModal: false,
  		}
  		break;

  	default:
      return state;
  		break;
  }
}