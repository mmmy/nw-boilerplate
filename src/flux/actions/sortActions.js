import * as sortTypes from '../constants/SortTypes';
import * as types from '../constants/ActionTypes';

let sortByDate = () => {
	return {type:types.SORT_BY_DATE};
};

let sortBySimilarity = () => {
	return {type:types.SORT_BY_SIMILARITY};
}

let sortByVSimilarity = () => {
	return {type:types.SORT_BY_VSIMILARITY};
}

let sortByYield = () => {
	return {type:types.SORT_BY_YIELD};
}


module.exports = {
	sortByDate,
	sortBySimilarity,
	sortByVSimilarity,
	sortByYield
}