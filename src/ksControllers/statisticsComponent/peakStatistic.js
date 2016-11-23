//极值统计

import CountLinesChart from '../CountLinesChart';
import CountBarsChart from '../CountBarsChart';

let peakStatistic = {};
//缓存dom
let _$container = null,
		_$rates = null,
		_$days = null;

let _barChart = null;
let _peakChart = null;

let _peakChartTitleUnit = null;

let _model = null;

//states
let _isUp = true; //上涨
let _intervalObj = {value:1, unit:'D', describe:'天'};

let _highlightLine = function(index) {
	_peakChart.highlightLine(index);
}

peakStatistic.init = (wrapper, model) => {
	_model = model;
	let newDom = $(`<div class='ks-container peak'><h4 class="title"><img src="image/jizhi.png" />极值统计</h4><div class="row"></div></div>`);
	_$container = newDom;
	$(wrapper).append(newDom);

	//add other doms
	let percentInfo1 = $(`<div class="ks-col-50"></div>`)
												.append($(`<div class="percent-item red"></div>`)
													.append(`<p class="rate percent-info red"><span>00</span><span>.</span><span>00</span><span>%<span></p>`)
													.append(`<p class="describe"><span class="text">最高涨幅</span></p>`)
												)
	let percentInfo2 = $(`<div class="ks-col-50"></div>`)
												.append($(`<div class="percent-item green"></div>`)
													.append(`<p class="rate percent-info green"><span>00</span><span>.</span><span>00</span><span>%<span></p>`)
													.append(`<p class="describe"><span class="text">最大跌幅</span></p>`)
												)
	let part1 = $(`<div class="ks-col-50"></div>`)
							// .append(`<div class="chart-title bar">1.按极值大小分布图<span class="axis pull-right">横坐标:<span class="black">百分比</span>纵坐标:<span class="black">个数</span></span></div>`)
							.append(`<div class="chart-title bar">按极值大小分布图</div>`)
							.append(`<div class="chart-wrapper bar"></div>`)
							.append($(`<div class="row percent-info-container"></div>`).append(percentInfo1).append(percentInfo2))// .append(`<p class="btns"><button class="flat-btn up active">上涨</button><button class="flat-btn down">下跌</button></p>`);

	let daysNode = $(`<div class="row"></div>`)
							.append(`<div class="ks-col-50"><div class="days-info-wrapper red"><p class="days-info">第<strong>0</strong><span class="interval-unit">天</span></p><p class="text">到达最高点位</p></div></div>`)
							.append(`<div class="ks-col-50"><div class="days-info-wrapper green"><p class="days-info">第<strong>0</strong><span class="interval-unit">天</span></p><p class="text">到达最低点位</p></div></div>`)

	let part2 = $(`<div class="ks-col-50"></div>`)
							// .append(`<div class="chart-title line">2.按时间分布统计图<span class="axis pull-right">横坐标:<span class="black interval-unit">天</span>纵坐标:<span class="black">个数</span></span></div>`)
							.append(`<div class="chart-title line" style="padding-left: 16px">按时间分布统计图</div>`)
							.append(`<div class="chart-wrapper line"></div>`)
							.append(daysNode)



	newDom.find('.row').append(part1).append(part2);

	//cache
	_$container = newDom;
	_$rates = newDom.find('.percent-info');
	_$days = newDom.find('.days-info-wrapper strong');
	_peakChartTitleUnit = newDom.find('.interval-unit');
	//initEvent
	daysNode.find('.days-info-wrapper.red').on('mouseenter',_highlightLine.bind(null,0)).on('mouseleave',_highlightLine.bind(null,-1));
	daysNode.find('.days-info-wrapper.green').on('mouseenter',_highlightLine.bind(null,1)).on('mouseleave',_highlightLine.bind(null,-1));
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
	_barChart = new CountBarsChart(newDom.find('.chart-wrapper')[0], {showValue:false, isHorizon: true, yMinSpace:10, hideXAxis: true, hideVerticalGrid: true});
	_peakChart = new CountLinesChart(newDom.find('.chart-wrapper')[1]);
	// _peakChart.render();
	_peakChart.on('hoverLine', function(param) {
		let index = param.index;
		$(daysNode.find('.days-info-wrapper')[index]).addClass('active');
	});
	_peakChart.on('leaveLine', function(param) {
		daysNode.find('.days-info-wrapper').removeClass('active');
	});
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
		let unit = _intervalObj.value;
		updateRate(maxRateIncrease, 0);
		updateRate(minRateIncrease, 1);
		$(_$days[0]).text(dayMostPeak * unit);
		$(_$days[1]).text(dayMostDown * unit);
	} catch(e) {
		console.error(e);
	}
}

peakStatistic._updateStuffs = () => {
	_peakChartTitleUnit.text(_intervalObj.describe);
}

peakStatistic._redrawBarChart = (model) => {
	let {freqLeft, freqRight, unit} = model.getFreqPeakRate();            //for bar chart
	try {
		let leftLen = freqLeft.length,
				rightLen = freqRight.length;
		let leftRight = freqLeft.concat([]).reverse().concat(freqRight);
		let data = [];
		let xLables = [],
				series = [];
		for(var i=leftLen-1; i>=0; i--) {   //绿色
			xLables.push((- unit * (i+1) * 100).toFixed(1)); 
			data.push({
				value: freqLeft[i], 
				fillStyle:'rgba(16,145,33,0.2)', 
				strokeStyle: 'rgba(16,145,33,0.2)',
				textColor: 'rgba(16,145,33,1)',
				hover: {fillStyle: 'rgba(16,145,33,1)', strokeStyle: 'rgba(16,145,33,1)'}
			});
		}
		xLables.push('0');
		for(var i=0; i<rightLen; i++) {
			xLables.push((unit * (i+1) * 100).toFixed(1));
			data.push({
				value: freqRight[i], 
				fillStyle:'rgba(141,22,27,0.2)', 
				strokeStyle: 'rgba(141,22,27,0.2)',
				textColor: 'rgba(141,22,27,1)',
				hover: {fillStyle: 'rgba(141,22,27,1)', strokeStyle: 'rgba(141,22,27,1)'}
			});
		}
		series[0] = {
			data: data,
		};
		_barChart.setData({xLables:xLables, series: series});
	} catch (e) {
		console.error('peakStatistic._redrawBarChart error',e);
	}
}

peakStatistic._redrawLineChart = (model) => {
	//注意第一天不需要,因为不在预测范围内
	let {tPeak, tDown, dayMostPeak, dayMostDown} = model.getSummary();
	try {
		let dataLen = tPeak.length - 1,
				tPeakS = tPeak.slice(-dataLen),
				tDownS = tDown.slice(-dataLen);
		let peakSeries = [];
	
		peakSeries[0] = {
			data: tPeakS,
			strokeStyle: 'rgba(141,22,27,1)',
			fillStyle: 'rgba(141,22,27,0.1)',
			hover: {
				lineWidth: 2,
				strokeStyle: 'rgba(141,22,27,1)',
				fillStyle: 'rgba(141,22,27,0.1)'
			},
			activeIndexes: [dayMostPeak-1]
		};
		peakSeries[1] = {
			data: tDownS,
			strokeStyle: 'rgba(16,145,33,1)',
			fillStyle: 'rgba(16,145,33,0.1)',
			hover: {
				lineWidth: 2,
				strokeStyle: 'rgba(16,145,33,1)',
				fillStyle: 'rgba(16,145,33,0.1)'
			},
			activeIndexes: [dayMostDown-1]
		};
		_peakChart.setData({dataLen,series:peakSeries,unit:_intervalObj.value});
	} catch(e) {
		console.error(e);
		_peakChart.setData({dataLen:0,series:[]});
	}
}

peakStatistic.update = (param) => {
	_intervalObj = param && param.intervalObj || _intervalObj;
	let model = _model;
	let dataObj = model && model.getSummary();
	if(dataObj) {
		peakStatistic._updateStuffs();
		peakStatistic._udpateDataUI(dataObj);
		//render chart
		peakStatistic._redrawLineChart(model);
		peakStatistic._redrawBarChart(model);
	}
};

module.exports = peakStatistic;