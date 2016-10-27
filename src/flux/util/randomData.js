
let randomDate = function() {
	let millionSeconds1990 = new Date('1990/01/01').getTime();
	let millionSeconds2016 = new Date().getTime();
	let dis = millionSeconds2016 - millionSeconds1990;

	let randomDate = millionSeconds1990 + Math.round(Math.random() * dis);

	return randomDate;
};

let randomprice = function(floor, ceil) {
	floor = floor || 10;
	ceil = ceil || 20;
	let dis = Math.abs(ceil - floor);
	floor = Math.min(floor, ceil);

	let low = floor + Math.random() * dis;
	let high = low + Math.random() * dis;

	dis = high - low;
	let open = low + Math.random() * dis;
	let close = low + Math.random() * dis;

	//return {open, close, high, low};
	return [open, close, low, high];
}

let randomKLine = function(n) {
	n = n || 100;
	let KLine = [];
	let randomStartDate = randomDate();
	let milliSecOneDay = 24 * 3600 * 1000;
	for(let i=0; i<n; i++) {
		// KLine.push(Object.assign(randomprice(), { date: randomStartDate + milliSecOneDay * i }));
		let data = randomprice();
		data.unshift(randomStartDate + milliSecOneDay * i);
		KLine.push(data);
	}
	return KLine;
}

const randomPartterns = function(n) {
	let partterns = [];
	for(let i=0; i<n; i++){
		partterns.push({
			symbol: '00000' + parseInt(Math.random() * 10) + '.SZ',
			similarity: Math.random(),
			kLine: randomKLine(),
		});
	}
	return partterns;
}

const randomStatistics = function(startDate, endDate) {

}

module.exports = {
	randomPartterns,
};
