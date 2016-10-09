
// var urls = ['../../tradingview/charting_library/datafeed/udf/ksStockSymbolsDB.json','../../tradingview/charting_library/datafeed/udf/ksFutureSymbolsDB.json'];
// var _symbolData = urls.reduce((arr, url) => {
// 	return arr.concat(require(url));
// },[]);
// // let _symbolData = require('../../tradingview/charting_library/datafeed/udf/ksSymbolsDB.json');

// let _symbolIndusty = {};

// _symbolData.map((e) => {
// 	_symbolIndusty[e.name] = e.className || '未知行业';
// });

// let getSymbolData = () => {
// 	return _symbolData;
// };

let getIndustry = (symbols) => {    //['000001.SZ', '000006.SZ']  => ['银行', '工业']
	let ksGetIndustryFromCache = window.ksGetIndustryFromCache;
	let industy = null;
	let type = Object.prototype.toString.call(symbols);
	if(type === '[object String]') {
		industy = ksGetIndustryFromCache(symbols);
	}else if(type === '[object Array]'){
		let industy = symbols.map((symbol) => {
			return ksGetIndustryFromCache(symbol) || '未知行业';
		});
	}else {
		console.warn('获取行业失败');
	}
	return industy;
}

module.exports = {
	// getSymbolData,
	getIndustry,
}
