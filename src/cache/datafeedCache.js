
let _datafeed = null;

let setDataFeed = (datafeed) => {
	_datafeed = datafeed;
};
//默认 获取当前tradingview的dataCategory
let getDataCategory = () => {
	return _datafeed && _datafeed.getDataCategory();
};

module.exports = {
	setDataFeed,
	getDataCategory,
};