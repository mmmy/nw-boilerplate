//回撤统计

import CountLinesChart from '../CountLinesChart';

let drawDownStatistic = {};

//缓存dom
let _$container = null,
		_dataDoms = [], //四个
		_daysDoms = []; //3个

let _retracementChart = null;

let _model = null;

drawDownStatistic.init = (wrapper, model) => {

	_model = model;

	let newDom = $(`<div class='ks-container retracement'><h4 class="title"><img src="image/huiche.png"/>回撤统计</h4><div class="row"></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let dataRow = $(`<div class="row data-wrapper"></div>`)
								.append(`<div class="ks-col-50 min"><p><span class="name">回撤最小值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 max"><p><span class="name">回撤最大值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 ss"><p><span class="name">方差</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50 average"><p><span class="name">平均值</span><span class="percent-info"><span>0</span><span>.</span><span>00</span><span>%</span></span></p></div`);
	let daysRow = $(`<div class="row"></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>0</strong>天</p><p>最多只匹配结果开始最大回撤</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>0</strong>天</p><p>最多只匹配结果结束最大回撤</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info"><strong>0</strong>天</p><p>最多只匹配结果的最大回撤持续</p></div>`);

	let part1 = $(`<div class="ks-col-50"></div>`)
							.append(dataRow)
							.append(daysRow);

	let part2 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-wrapper"></div>`);

	newDom.find('.row').append(part1).append(part2);

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
	let { freqStart, freqEnd, freqLen } = summaryDrawDown; 
	//第一天不在统计范围内, 所以去掉
	let dataLen = freqStart.length - 1,
			series = [{
				data:freqStart.slice(-dataLen),
				strokeStyle:'rgba(183, 57, 69, 0.7)',
				fillStyle:'rgba(183, 57, 69, 0.1)',
			}, {
				data:freqEnd.slice(-dataLen),
				strokeStyle:'rgba(183, 57, 69, 0.7)',
				fillStyle:'rgba(183, 57, 69, 0.1)',
			}, {
				data:freqEnd.slice(-dataLen),
				strokeStyle:'rgba(183, 57, 69, 0.7)',
				fillStyle:'rgba(183, 57, 69, 0.1)',
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
			let { summaryDrawDown } = dataObj;
			if(summaryDrawDown) {
				let { dayMostDrawDownStart, dayMostDrawDownLast, dayMostDrawDownEnd, freqStart, freqEnd, freqLen } = summaryDrawDown; 
				let { min, max, ss, average } = summaryDrawDown.basic; //回撤最小值, 最大值, 方差, 平均值
				let daysArr = [dayMostDrawDownStart, dayMostDrawDownEnd, dayMostDrawDownLast];
				let dataArr = [min, max, ss, average];
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
				drawDownStatistic._udpateChart(summaryDrawDown);
			}
		} catch(e) {
			console.error(e);
		}
	}
};

module.exports = drawDownStatistic;
