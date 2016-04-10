var data = require('../../../samples/ss600000-s');

let len = data.length,
	maxIndex = len - 200;

var randomKline = function(){
	let start = Math.round(Math.random() * maxIndex);
	let dataLen = 5 + Math.round(Math.random() * 360);
	return data.slice(start, start + dataLen);
};

var randomPartterns = function(n) {
	var partterns = [];
	for (let i=0; i<n; i++) {
		partterns.push({
			symbol: '000001',
			similarity: Math.random(),
			kLine: randomKline(),
		});
	}
	return partterns;
};

module.exports = {
	randomPartterns,
}