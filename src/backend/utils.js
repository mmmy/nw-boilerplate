import moment from 'moment';

let getDaysDuration = (d1, d2) => {
	
	let duration = moment.duration(moment(d2) - moment(d1));
	return duration.days();

};

//kLine = [['2012-1-2', open, close, low, high]]
let calcYieldRate = (kLine, baseBars=1) => {
	console.log(kLine);
	if (Object.prototype.toString.call(kLine) !== '[object Array]') {
		console.error('kLine must be a array');
		return 0;
	}

	if (baseBars >= kLine.length ) {
		console.info("kLine's length is shorter than baseBars !");
		return 0;
	}

	const closePriceIndex = 2;

	let basePrice = kLine[baseBars -1][closePriceIndex],
		lastPrice = kLine[kLine.length -1][closePriceIndex];

	let yieldRate = (lastPrice - basePrice) / basePrice;

	return yieldRate;

};

module.exports = {
	getDaysDuration,
	calcYieldRate,
};