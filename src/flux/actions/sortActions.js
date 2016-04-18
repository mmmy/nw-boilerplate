import * as sortTypes from '../constants/SortTypes';
import * as types from '../constants/ActionTypes';

let sortByDate = function() {
	return {type:types.SORT_BY_DATE};
};

module.exports = {
	sortByDate,
}