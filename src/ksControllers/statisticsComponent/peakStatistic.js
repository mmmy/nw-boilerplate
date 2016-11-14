//极值统计

import CountLinesChart from '../CountLinesChart';

let peakStatistic = {};
//缓存dom
let _$container = null,
		_$maxRate = null,
		_$day1 = null,
		_$day2 = null;

let _chart = null;

peakStatistic.init = (wrapper) => {
	let newDom = $(`<div class='ks-container peak'><h4 class="title">极值统计</h4><div class="row"></div></div>`);
	_$container = newDom;
	$(wrapper).append(newDom);

	//add other doms
	let part1 = $(`<div class="ks-col-25"></div>`)
							.append(`<p class="rate percent-info"><span>69</span><span>.</span><span>99</span><span>%<span></p>`)
							.append(`<p class="describe"><span class="circle red"></span>最高涨幅百分比</p>`)
							.append(`<p class="btns"><button class="flat-btn">上涨</button><button class="flat-btn">下跌</button></p>`);

	let part2 = $(`<div class="ks-col-25"></div>`)
							.append(`<div class="days-info-wrapper red"><p class="days-info">第<strong>7</strong>天</p><p>最多只匹配结果到达最高点</p></div>`)
							.append(`<div class="days-info-wrapper green"><p class="days-info">第<strong>7</strong>天</p><p>最多只匹配结果到达最高点</p></div>`);

	let part3 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-wrapper"></div>`);


	newDom.find('.row').append(part1).append(part2).append(part3);

	//cache
	_chart = new CountLinesChart(newDom.find('.chart-wrapper'));
	_chart.render();
};

peakStatistic.update = (dataObj) => {

};

module.exports = peakStatistic;