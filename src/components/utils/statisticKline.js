
// var getReturnPercent = (kline) => {

// };

//arr: 排序好的!
let getMedian = (arr) => {

	let len = arr.length;

	if (len == 0) { return 0; }

	let index = Math.floor( len / 2 );
	
	if (len % 2 === 0) {    //偶数个取中间平均值
		return (arr[index-1] + arr[index]) / 2;
	} 

	return arr[index];

};

let sum = (arr) => {
	return arr.reduce((pre, cur) => {
		return pre + cur;
	}, 0);
};
//klines: [{yield:},] or [yield,];
module.exports = (klines) => {

	let median = 0,
		mean = 0,
		upPercent = 0,
		downPercent = 0,
		up = { median:0, mean:0, max:0 },
		down = { median:0, mean:0, min:0 };

	let klinesLen = klines.length;

	if (klinesLen > 0) {
		//获得收益全部数据
		let upYieldArr = [],
			downYieldArr = [],
			allArr = [];

		klines.forEach((kline) => {
			var earn = typeof kline == 'number' ? kline : kline.yield;
			if (earn > 0) {
				upYieldArr.push(earn);
			} else if (earn < 0) {
				downYieldArr.push(earn);
			}
			allArr.push(earn);
		});

		var sortFunc = (a, b) => { return a - b };
		upYieldArr.sort(sortFunc);
		downYieldArr.sort(sortFunc);
		allArr.sort(sortFunc);

		let upLen = upYieldArr.length,
			downLen = downYieldArr.length;

		let upSum = sum(upYieldArr),
			downSum = sum(downYieldArr);
		
		upPercent = upLen / klinesLen;
		downPercent = downLen / klinesLen;
		
		mean = (upSum + downSum) / klinesLen;
		median = getMedian(allArr);

		up.median = getMedian(upYieldArr);
		up.mean = upLen > 0 ? (upSum / upLen) : 0;
		up.max =  upLen > 0 ? upYieldArr[upLen - 1] : 0;
		
		down.median = getMedian(downYieldArr);
		down.mean = downLen > 0 ? (downSum / downLen) : 0;
		down.min =  downLen > 0 ? downYieldArr[0] : 0;

	}

	return {
		median,
		mean,
		upPercent,
		downPercent,
		up,
		down,
	};
}