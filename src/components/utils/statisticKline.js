
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

module.exports = (klines) => {

	let median = 0,
		mean = 0,
		upPercent = 0,
		up = { median:0, mean:0, max:0 },
		down = { median:0, mean:0, min:0 };

	let klinesLen = klines.length;

	if (klinesLen > 0) {
		//获得收益全部数据
		let upYieldArr = [],
			downYieldArr = [],
			allArr = [];

		klines.forEach((kline) => {
			if (kline.yield > 0) {
				upYieldArr.push(kline.yield);
			} else if (kline.yield < 0) {
				downYieldArr.push(kline.yield);
			}
			allArr.push(kline.yield);
		});

		upYieldArr.sort();
		downYieldArr.sort();
		allArr.sort();

		let upLen = upYieldArr.length,
			downLen = downYieldArr.length;

		let upSum = sum(upYieldArr),
			downSum = sum(downYieldArr);
		
		upPercent = upLen / klinesLen;
		mean = (upSum + downSum) / klinesLen;
		median = getMedian(allArr);

		up.median = getMedian(upYieldArr);
		up.mean = upLen > 0 ? (upSum / upLen) : 0;
		up.max =  upLen > 0 ? upYieldArr[upLen - 1] : 0;
		
		down.median = getMedian(downYieldArr);
		down.mean = downLen > 0 ? (downSum / downLen) : 0;
		down.min =  downLen > 0 ? downYieldArr[downLen - 1] : 0;

	}

	return {
		median,
		mean,
		upPercent,
		up,
		down,
	};
}