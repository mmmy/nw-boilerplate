var data = require('../../../samples/ss600000-s');

let len = data.length,
	maxIndex = len - 200;

let industrys = ['行业1','行业2','行业3','行业4','行业5'];
const BASE_BARS = 10;
const ADDTION_DAYS = 10;

let index = 0;

var randomKline = function(){
	// let start = 3000 + index * (BASE_BARS + ADDTION_DAYS);
	let start = Math.round(Math.random() * maxIndex);
	index = index + 1;
	let dataLen = BASE_BARS + ADDTION_DAYS;
	let kLine = data.slice(start, start + dataLen); // 返回 100 天数据
	let lineClosePrice = kLine.slice(BASE_BARS).map((dataArr) => {
		return dataArr[2];
	});
	return {kLine, lineClosePrice};
};

var randomPatterns = function(n) {
	var patterns = [];
	var closePrice = [];

	for (let i=0; i<n; i++) {
		let kline = randomKline();
		patterns.push({
			id: i,
			symbol: '000001',
			similarity: Math.random(),
			baseBars: BASE_BARS,
			end: kline.kLine[BASE_BARS][0],
			kLine: kline.kLine,
			yield: Math.random()*3 - 1.2,  //-150% ~ 150%
			industry: industrys[Math.round((Math.random()*industrys.length))],
		});
		closePrice.push(kline.lineClosePrice);
	}
	patterns[0] && (patterns[0].industry = '未知行业');
	return { patterns, closePrice };
};

module.exports = {
	randomPatterns,
}
