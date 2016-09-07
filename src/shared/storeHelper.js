
import store from '../store';

let getDecimalForStatistic = () => {
	let decimal = 3;
	let patterns = store.getState().patterns;
	let searchMetaData = patterns && patterns.searchMetaData;
	let interval = searchMetaData && searchMetaData.interval || '';
	interval = interval.toUpperCase();
	if(interval.indexOf('D') > -1 || interval.indexOf('M') > -1 || interval.indexOf('W') > -1) {
		decimal = 2;
	}
	return decimal;
};

module.exports = {
	getDecimalForStatistic
};