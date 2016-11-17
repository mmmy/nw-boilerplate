//回撤统计

import CountLinesChart from '../CountLinesChart';

let drawDownStatistic = {};

//缓存dom
let _$container = null,
		_dataDoms = [], //四个
		_daysDoms = []; //3个

let _retracementChart = null;

let _model = null;
let _isLong = true; //默认做多

drawDownStatistic.init = (wrapper, model) => {

	_model = model;

	let newDom = $(`<div class='ks-container retracement'><h4 class="title"><img src="image/huiche.png"/>回撤统计<span class="btn-wrapper"><button class="flat-btn long active">做多</button><button class="flat-btn short">放空</button></span></h4><div class="row"></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let dataRow = $(`<div class="row data-wrapper"></div>`)
								.append(`<div class="ks-col-25 min"><p><span class="name">回撤最小值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-25 max"><p><span class="name">回撤最大值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-25 average"><p><span class="name">平均值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-25 ss"><p><span class="name">方差</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
	let daysRow = $(`<div class="row"></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">共<strong>0</strong>根</p><p>最大回撤持续</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>0</strong>根</p><p>开始最大回撤</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>0</strong>根</p><p>结束最大回撤</p></div>`)

	let part1 = $(`<div class="ks-col-50"></div>`)
							.append(daysRow)
							.append(`<p class="describe">*统计结果均为最多支统计结果</p>`)

	let part2 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-wrapper"></div>`);

	newDom.find('.row').append(part1).append(part2).before(dataRow);;

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
	//chart
	_retracementChart = new CountLinesChart(newDom.find('.chart-wrapper'));
	// _retracementChart.render();
};

drawDownStatistic._udpateChart = (summaryDrawDown) => {
	let { dayMostDrawDownStart, dayMostDrawDownLast, dayMostDrawDownEnd, freqStart, freqEnd, freqLen } = summaryDrawDown; 
	//第一天不在统计范围内, 所以去掉
	let dataLen = freqStart.length,
			series = [{
				data:freqStart.slice(-dataLen),
				activeIndexes: [dayMostDrawDownStart],
				strokeStyle:'rgba(141,22,27,1)',
				fillStyle:'rgba(141,22,27,0.1)',
				hover: {
					lineWidth: 2,
					strokeStyle:'rgba(141,22,27,1)',
					fillStyle:'rgba(141,22,27,0.2)',
				}
			}, {
				data:freqEnd.slice(-dataLen),
				activeIndexes: [dayMostDrawDownEnd],
				strokeStyle:'rgba(141,22,27,1)',
				fillStyle:'rgba(141,22,27,0.1)',
				hover: {
					lineWidth: 2,
					strokeStyle:'rgba(141,22,27,1)',
					fillStyle:'rgba(141,22,27,0.2)',
				}
			}, {
				data:freqLen.slice(-dataLen),
				activeIndexes: [dayMostDrawDownLast],
				strokeStyle:'rgba(141,22,27,1)',
				fillStyle:'rgba(141,22,27,0.1)',
				hover: {
					lineWidth: 2,
					strokeStyle:'rgba(141,22,27,1)',
					fillStyle:'rgba(141,22,27,0.2)',
				}
			}];

	_retracementChart.setData({
		dataLen,
		series
	});
}

drawDownStatistic.update = () => {
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
				let dataArr = [min, max, ss, average];
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
				_daysDoms.forEach(function($dom, i){
					let day = daysArr[i]
					$dom.text(day);
				});
				//update chart
				drawDownStatistic._udpateChart(drawDown);
			}
		} catch(e) {
			console.error(e);
		}
	}
};

module.exports = drawDownStatistic;
