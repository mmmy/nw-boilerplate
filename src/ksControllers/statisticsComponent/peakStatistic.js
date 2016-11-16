//极值统计

import CountLinesChart from '../CountLinesChart';

let peakStatistic = {};
//缓存dom
let _$container = null,
		_$rates = null,
		_$days = null;

let _chart = null;

let _model = null;

//states
let _isUp = true; //上涨

peakStatistic.init = (wrapper, model) => {
	_model = model;
	let newDom = $(`<div class='ks-container peak'><h4 class="title"><img src="image/jizhi.png" />极值统计</h4><div class="row"></div></div>`);
	_$container = newDom;
	$(wrapper).append(newDom);

	//add other doms
	let part1 = $(`<div class="ks-col-25"></div>`)
							.append(`<p class="rate percent-info red"><span>00</span><span>.</span><span>00</span><span>%<span></p>`)
							.append(`<p class="describe"><span class="circle red"></span><span class="text">最高涨幅百分比</span></p>`)
							.append(`<p class="rate percent-info green"><span>00</span><span>.</span><span>00</span><span>%<span></p>`)
							.append(`<p class="describe"><span class="circle green"></span><span class="text">最高跌幅百分比</span></p>`);
							// .append(`<p class="btns"><button class="flat-btn up active">上涨</button><button class="flat-btn down">下跌</button></p>`);

	let part2 = $(`<div class="ks-col-25"></div>`)
							.append(`<div class="days-info-wrapper red"><p class="days-info">第<strong>0</strong>天</p><p class="text">最多只匹配结果到达最高点</p></div>`)
							.append(`<div class="days-info-wrapper green"><p class="days-info">第<strong>0</strong>天</p><p class="text">最多只匹配结果到达最低点</p></div>`);

	let part3 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-wrapper"></div>`);


	newDom.find('.row').append(part1).append(part2).append(part3);

	//cache
	_$container = newDom;
	_$rates = newDom.find('.percent-info');
	_$days = newDom.find('.days-info-wrapper strong');
	//initEvent
	/*
	part1.find('.flat-btn.up').click(function(event) {
		if(!_isUp) {
			_isUp = true;
			peakStatistic.update();
			peakStatistic._updateDescribeUI();
			$(this).addClass('active');
			part1.find('.flat-btn.down').removeClass('active');
		}
	});
	part1.find('.flat-btn.down').click(function(event) {
		if(_isUp) {
			_isUp = false;
			peakStatistic.update();
			peakStatistic._updateDescribeUI();
			$(this).addClass('active');
			part1.find('.flat-btn.up').removeClass('active');
		}
	});
	*/
	//chart
	_chart = new CountLinesChart(newDom.find('.chart-wrapper'));
	// _chart.render();
};
//更新描述UI
/*
peakStatistic._updateDescribeUI = () => {
	let isUp = _isUp;
	_$container.find('.circle').toggleClass('red', isUp).toggleClass('green', !isUp);
	_$container.find('.describe .text').text(isUp ? '最高涨幅百分比' : '最低涨幅百分比');
	var daysInfoTextDom = _$container.find('.days-info-wrapper .text');
	$(daysInfoTextDom[0]).text(isUp ? '最多只匹配结果到达最高点' : '最多只匹配结果到达最低点');
	$(daysInfoTextDom[1]).text(isUp ? '最多只匹配结果上涨' : '最多只匹配结果下跌');
}
*/
//更新数据UI
peakStatistic._udpateDataUI = (dataObj, isUp=true) => {
	let {maxRateIncrease, minRateIncrease, dayMostPeak, dayMostDown} = dataObj;
	let updateRate = (value, index) => {
		let vauleStr = (value*100).toFixed(2) + '';
		let values = vauleStr.split('.');
		$($(_$rates[index]).find('span')[0]).text(values[0]);
		$($(_$rates[index]).find('span')[2]).text(values[1]);
		// _$maxRate.toggleClass('green', !isUp);
		// _$maxRate.toggleClass('red', isUp);
	};
	try {
		updateRate(maxRateIncrease, 0);
		updateRate(minRateIncrease, 1);
		$(_$days[0]).text(dayMostPeak);
		$(_$days[1]).text(dayMostDown);
	} catch(e) {
		console.error(e);
	}
}

peakStatistic._redrawChart = (dataObj) => {
	//注意第一天不需要,因为不在预测范围内
	let {tPeak, tDown, dayMostPeak, dayMostDown} = dataObj;
	try {
		let dataLen = tPeak.length - 1,
				tPeakS = tPeak.slice(-dataLen),
				tDownS = tDown.slice(-dataLen);
		let series = [];
		series[0] = {
			data: tPeakS,
			strokeStyle: 'red',
			activeIndexes: [dayMostPeak-1]
		};
		series[1] = {
			data: tDownS,
			strokeStyle: 'pink',
			activeIndexes: [dayMostDown-1]
		};
		_chart.setData({dataLen,series});
	} catch(e) {
		console.error(e);
	}
}

peakStatistic.update = () => {
	let model = _model;
	let dataObj = model && model.getSummary();
	if(dataObj) {
		peakStatistic._udpateDataUI(dataObj);
		//render chart
		peakStatistic._redrawChart(dataObj);
	}
};

module.exports = peakStatistic;