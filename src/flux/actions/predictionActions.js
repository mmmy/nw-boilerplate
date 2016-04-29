import * as types from '../constants/ActionTypes';

const getLastClosePrice = function(lastClosePrice) {
  return (dispatch) => {
    dispatch({
      type: types.GET_LAST_CLOSE_PRICE,
      lastClosePrice: lastClosePrice
    })
  }
}

module.exports = {
  getLastClosePrice,
}
