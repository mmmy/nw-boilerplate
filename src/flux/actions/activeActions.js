import * as types from '../constants/ActionTypes';

let setActiveId = (id, symbol, dateStart, dateEnd) => {
	return {
    type: types.SET_ACTIVE_ID,
    active: {
      id: id,
      symbol: symbol,
      dateStart: dateStart,
      dateEnd: dateEnd
    }
  };
};

module.exports = {
	setActiveId,
};
