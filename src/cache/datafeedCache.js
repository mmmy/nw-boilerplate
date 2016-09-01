
let _datafeed = null;

let setDataFeed = (datafeed) => {
	_datafeed = datafeed;
};

let getDataCategory = () => {
	return _datafeed && _datafeed.getDataCategory();
};

module.exports = {
	setDataFeed,
	getDataCategory,
};