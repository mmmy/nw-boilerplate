//回撤统计

import CountLinesChart from '../CountLinesChart';
import CountBarsChart from '../CountBarsChart';

let drawDownStatistic = {};

//缓存dom
let _$container = null,
		_dataDoms = [], //四个
		_daysDoms = []; //3个

let _intervalUnit = null;

let _barChart = null;
let _retracementChart = null;

let _retracementChartTitleUnit = null;

let _model = null;
let _isLong = true; //默认做多
let _intervalObj = {value:1, unit:'D', describe:'天'};

let _isLight = false;

let _highlightLine = function(index) {
	_retracementChart.highlightLine(index);
}

drawDownStatistic.init = (wrapper, model) => {
	_isLight = $.keyStone && ($.keyStone.theme == 'light');

	_model = model;

	let newDom = $(`<div class='ks-container retracement'><h4 class="title"><img src="image/huiche${_isLight ? '' : '_white'}.png"/>回撤统计<span class="btn-wrapper"><button class="flat-btn long active">做多</button><button class="flat-btn short">做空</button></span></h4><div class="row"></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let dataRow = $(`<div class="row data-wrapper"></div>`)
								.append(`<div class="ks-col-50 min"><p><span class="name">回撤最小值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 average"><p><span class="name">平均值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 max"><p><span class="name">回撤最大值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 ss"><p><span class="name">方差值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
	let daysRow = $(`<div class="row"></div>`)
								.append(`<div class="ks-col-33"><div class="days-info-wrapper gray-light"><p class="days-info">共<strong>0</strong><span class="interval-unit">天</span></p><p>最大回撤持续</p></div></div>`)
								.append(`<div class="ks-col-33"><div class="days-info-wrapper gray-middle"><p class="days-info">第<strong>0</strong><span class="interval-unit">天</span></p><p>开始最大回撤</p></div></div>`)
								.append(`<div class="ks-col-33"><div class="days-info-wrapper gray-dark"><p class="days-info">第<strong>0</strong><span class="interval-unit">天</span></p><p>结束最大回撤</p></div></div>`)

	let part1 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-title bar">按回撤大小分布图</div>`)
							.append(`<div class="chart-wrapper bar"></div>`)
							.append(dataRow)

	let part2 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-title line" style="padding-left:16px">按时间分布统计图</div>`)
							.append(`<div class="chart-wrapper"></div>`)
							.append(daysRow)
							.append(`<p class="describe">*统计结果均为最多支统计结果</p>`)

	newDom.find('.row').append(part1).append(part2);

	//init event
	newDom.find('.btn-wrapper .short').click(function(event) {  //做空
		/* Act on the event */
		if(_isLong) {
			_isLong = false;
			newDom.find('.btn-wrapper .short').addClass('active');
			newDom.find('.btn-wrapper .long').removeClass('active');
			drawDownStatistic.update();
		}
	});
	newDom.find('.btn-wrapper .long').click(function(event) {  //做多
		/* Act on the event */
		if(!_isLong) {
			_isLong = true;
			newDom.find('.btn-wrapper .long').addClass('active');
			newDom.find('.btn-wrapper .short').removeClass('active');
			drawDownStatistic.update();
		}
	});

	daysRow.find('.gray-light').on('mouseenter',_highlightLine.bind(null, 0)).on('mouseleave',_highlightLine.bind(null, -1));
	daysRow.find('.gray-middle').on('mouseenter',_highlightLine.bind(null, 1)).on('mouseleave',_highlightLine.bind(null, -1));
	daysRow.find('.gray-dark').on('mouseenter',_highlightLine.bind(null, 2)).on('mouseleave',_highlightLine.bind(null, -1));

	//cache
	_$container = newDom;
	let percentInfos = _$container.find('.percent-info');
	let daysInfos = _$container.find('.days-info strong');
	_dataDoms[0] = $(percentInfos[0]);
	_dataDoms[1] = $(percentInfos[1]);
	_dataDoms[2] = $(percentInfos[2]);
	_dataDoms[3] = $(percentInfos[3]);
	_daysDoms[0] = $(daysInfos[0]);
	_daysDoms[1] = $(daysInfos[1]);
	_daysDoms[2] = $(daysInfos[2]);
	_intervalUnit = newDom.find('.interval-unit');
	//chart
	_barChart = new CountBarsChart(newDom.find('.chart-wrapper')[0]);
	_retracementChart = new CountLinesChart(newDom.find('.chart-wrapper')[1]);
	window._retracementChart = _retracementChart;

	_retracementChart.on('hoverLine', function(param) {
		let index = param.index;
		switch(index) {
			case 0:
				daysRow.find('.gray-light').addClass('blue-light');
				break;
			case 1:
				daysRow.find('.gray-middle').addClass('blue-middle');
				break;
			case 2:
				daysRow.find('.gray-dark').addClass('blue-dark');
				break;
			default:
			 break;
		}
	});
	_retracementChart.on('leaveLine', function(param) {
		daysRow.find('.days-info-wrapper').removeClass('blue-light blue-middle blue-dark');
	});
	_retracementChart.customTooltip(function(lineIndex, param){
		var index = param.index,
				value = param.value;
		switch(lineIndex) {
			case 0:
				return `<span class="value">${value}</span>个结果<br>最大回撤持续${index}`;
				break;
			case 1:
				return `<span class="value">${value}</span>个结果<br>在第${index}开始最大回撤`;
				break;
			case 2:
				return `<span class="value">${value}</span>个结果<br>在第${index}结束最大回撤`;
				break;
			default:
				return `<span class="value">${value}</span>个结果<br>在第${index}到达最高点`;
				break;
		}
	});
};

drawDownStatistic._resetCharts = () => {
	_barChart.setData();
	_retracementChart.setData();
}

drawDownStatistic._updateBarChart = (model) => {
	let dataObj = _isLong ? model.getFreqDrawDown() : model.getFreqRDrawDown();
	let { freqLeft, freqRight, unit } = dataObj;

	let rightLen = freqRight.length,
			data = [],
			xLables = ['0'],
			series = [];

	let decimal = 1;
	if(unit >= 0.01)
		decimal = 0;
	else if(unit >= 0.001)
		decimal = 1;
	else if(unit >= 0.0001)
		decimal = 2;
	else if(unit >= 0.00001)
		decimal = 3;
	else if(unit >= 0.000001)
		decimal = 4;

	for(var i=0; i<rightLen; i++) {
		xLables.push((unit * (i+1) * 100).toFixed(decimal) + '%');
			data.push({
				value: freqRight[i], 
				fillStyle: _isLight ? 'rgba(0, 69, 135, 0.5)' : '#1e2f40', 
				strokeStyle: _isLight ? 'rgba(0, 69, 135, 0.5)' : '#1e2f40',
				hover: {fillStyle: _isLight ? 'rgba(0,69,135,1)' : '#173552', strokeStyle: _isLight ? 'rgba(0,69,135,1)' : '#173552'}
			});
	}
	series[0] = {
		data: data
	};
	let options = {
		gridColor: _isLight ? '' : '#151515'
	};
	_barChart.setData({xLables:xLables, series: series, options:options});
}

drawDownStatistic._updateStuffs = () => {
	_intervalUnit.text(_intervalObj.describe);
}

drawDownStatistic._udpateLineChart = (summaryDrawDown) => {
	let { dayMostDrawDownStart, dayMostDrawDownLast, dayMostDrawDownEnd, freqStart, freqEnd, freqLen } = summaryDrawDown; 
	//第一天不在统计范围内, 所以去掉
	let dataLen = freqStart.length,
			series = [{
				data:freqLen.concat([]).slice(-dataLen),
				activeIndexes: [dayMostDrawDownLast],
				strokeStyle: _isLight ? 'rgba(178,178,178,1)' : '#004587',
				fillStyle: _isLight ? 'rgba(35,171,247,0.2)' : 'rgba(0,0,0,0)',
				hover: {
					lineWidth: 2,
					strokeStyle: _isLight ? 'rgba(35,171,247,1)' : '#0054a4',
					fillStyle: _isLight ? 'rgba(35,171,247,0.4)' : 'rgba(0,0,0,0)',
				}
			}, {
				data:freqStart.concat([]).slice(-dataLen),
				activeIndexes: [dayMostDrawDownStart],
				strokeStyle: _isLight ? 'rgba(120,120,120,1)' : '#0068af',
				fillStyle: _isLight ? 'rgba(0,104,175,0.2)' : 'rgba(0,0,0,0)',
				hover: {
					lineWidth: 2,
					strokeStyle: _isLight ? 'rgba(0,104,175,1)' : '#007dd2',
					fillStyle: _isLight ? 'rgba(0,104,175,0.4)' : 'rgba(0,0,0,0)',
				}
			}, {
				data:freqEnd.concat([]).slice(-dataLen),
				activeIndexes: [dayMostDrawDownEnd],
				strokeStyle: _isLight ? 'rgba(76,76,76,1)' : '#0d95b5',
				fillStyle: _isLight ? 'rgba(00,69,136,0.2)' : 'rgba(0,0,0,0)',
				hover: {
					lineWidth: 2,
					strokeStyle: _isLight ? 'rgba(00,69,136,1)' : '#10b0d6',
					fillStyle: _isLight ? 'rgba(00,69,136,0.4)' : 'rgba(0,0,0,0)',
				}
			}];
	let options = {
		gridColor: _isLight ? '' : '#151515'
	};
	_retracementChart.setData({
		dataLen,
		series,
		unit: _intervalObj.value,
		options
	});
}

drawDownStatistic.update = (param) => {
	_intervalObj = param && param.intervalObj || _intervalObj;
	let model = _model;
	let dataObj = model && model.getSummary();
	if(dataObj) {
		try {
			let { summaryDrawDown, summaryRDrawDown } = dataObj;
			let drawDown = _isLong ? summaryDrawDown : summaryRDrawDown;
			if(drawDown) {
				let { dayMostDrawDownStart, dayMostDrawDownLast, dayMostDrawDownEnd, freqStart, freqEnd, freqLen } = drawDown; 
				let { min, max, ss, average } = drawDown.basic; //回撤最小值, 最大值, 方差, 平均值
				let daysArr = [dayMostDrawDownLast, dayMostDrawDownStart, dayMostDrawDownEnd];
				let dataArr = [min, average, max, ss];
				/*
					根据_isLong(做多) 来判读 选择显示那个数据
				------------------------------------*/
				//update UI 1
				_dataDoms.forEach(function($dom, i){
					let data = dataArr[i] * 100,
							dataStr = data.toFixed(2) + '',
							values = dataStr.split('.');
					$($dom.find('span')[0]).text(values[0]);
					$($dom.find('span')[2]).text(values[1]);
				});
				//update UI 2
				let unit = _intervalObj.value;
				_daysDoms.forEach(function($dom, i){
					let day = daysArr[i] + 1
					$dom.text(day * unit);
				});
				//update chart
				drawDownStatistic._updateBarChart(model);
				drawDownStatistic._udpateLineChart(drawDown);
				drawDownStatistic._updateStuffs();
			}	else {
				drawDownStatistic._resetCharts();
			}
		} catch(e) {
			console.error(e);
		}
	}
};

module.exports = drawDownStatistic;
