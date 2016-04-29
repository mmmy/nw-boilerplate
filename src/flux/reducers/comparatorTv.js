import * as types from '../constants/ActionTypes';

const initialState = {
  windowSize: {h: 0, w: 0}
};

export default function comparatorTv(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_COMPARATOR_SIZE:
      return actions.comparatorTv;

    default:
      return state;
  }
}
