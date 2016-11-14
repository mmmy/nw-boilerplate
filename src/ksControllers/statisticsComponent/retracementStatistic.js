//回撤统计

import CountLinesChart from '../CountLinesChart';

let retracementStatistic = {};

//缓存dom
let _$container = null,
		_dataDoms = {
			$retracementMin:null,
			$retracementMax:null,
			$variance:null,
			$mean:null
		},
		_days = {
			$1:null,
			$2:null,
			$3:null
		};

let _retracementChart = null;

retracementStatistic.init = (wrapper) => {
	let newDom = $(`<div class='ks-container retracement'><h4 class="title">回撤统计</h4><div class="row"></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let dataRow = $(`<div class="row data-wrapper"></div>`)
								.append(`<div class="ks-col-50"><p>回撤最小值<span class="percent-info"><span>2</span><span>.</span><span>35</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50"><p>回撤最大值<span class="percent-info"><span>2</span><span>.</span><span>35</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50"><p>方差<span class="percent-info"><span>2</span><span>.</span><span>35</span><span>%</span></span></p></div`)
								.append(`<div class="ks-col-50"><p>平均值<span class="percent-info"><span>2</span><span>.</span><span>35</span><span>%</span></span></p></div`);
	let daysRow = $(`<div class="row"></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>7</strong>天</p><p>最多只匹配结果开始最大回撤</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>1</strong>天</p><p>最多只匹配结果的最大回撤持续</p></div>`)
								.append(`<div class="ks-col-33 days-info-wrapper red"><p class="days-info">第<strong>3</strong>天</p><p>最多只匹配结果结束最大回撤</p></div>`);

	let part1 = $(`<div class="ks-col-50"></div>`)
							.append(dataRow)
							.append(daysRow);

	let part2 = $(`<div class="ks-col-50"></div>`)
							.append(`<div class="chart-wrapper"></div>`);

	newDom.find('.row').append(part1).append(part2);

	//cache
	_retracementChart = new CountLinesChart(newDom.find('.chart-wrapper'));
	_retracementChart.render();
	window._retracementChart = _retracementChart;
};

retracementStatistic.update = (dataObj) => {

};

module.exports = retracementStatistic;
