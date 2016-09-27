import * as types from '../constants/ActionTypes';

let setActiveId = (id, symbol, dateStart, dateEnd, similarity, yieldRate, industry) => {
	return {
    type: types.SET_ACTIVE_ID,
    active: {
      id: id,
      symbol: symbol,
      dateStart: dateStart,
      dateEnd: dateEnd,
      similarity: similarity,
      yieldRate: yieldRate,
      industry: industry
    }
  };
};

module.exports = {
	setActiveId,
};
