var data = require('../../../samples/ss600000-s');

let len = data.length,
	maxIndex = len - 200;

let industrys = ['行业1','行业2','行业3','行业4','行业5'];

var randomKline = function(){
	let start = Math.round(Math.random() * maxIndex);
	let dataLen = 20 + Math.round(Math.random() * 280);
	return data.slice(start, start + 40); // 返回 100 天数据
};

var randomPartterns = function(n) {
	var partterns = [];
	for (let i=0; i<n; i++) {
		partterns.push({
			id: i,
			symbol: '000001',
			similarity: Math.random(),
			baseBars: 20,
			kLine: randomKline(),
			yield: Math.random()*3 - 1.2,  //-150% ~ 150%
			industry: industrys[Math.round((Math.random()*industrys.length))],
		});
	}
	return partterns;
};

module.exports = {
	randomPartterns,
}
