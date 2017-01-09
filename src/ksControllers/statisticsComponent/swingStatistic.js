//振幅统计
let swingStatistic = {};

//缓存dom
let _$container = null;
let _dataDoms = [];

let _model = null;
let _isLight = false;
let _intervalObj = {value:1, unit:'D', describe:'天'};

swingStatistic.init = (wrapper, model) => {
	_isLight = $.keyStone && ($.keyStone.theme == 'light');

	_model = model;

	let newDom = $(`<div class='ks-container swing'><h4 class="title"><img src="image/zhenfu${_isLight ? '' : '_white'}.png"/>波动统计</h4><div class='row'></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let part1 = $(`<div class="data-row"></div>`)
							.append(`<div class='ks-col-25'><div class="ks-data-pane"><p><span class="name">振幅最大值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div></div>`)
							.append(`<div class='ks-col-25'><div class="ks-data-pane"><p><span class="name">振幅最小值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div></div>`)
							.append(`<div class='ks-col-25'><div class="ks-data-pane"><p><span class="name">振幅平均值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div></div>`)
							.append(`<div class='ks-col-25'><div class="ks-data-pane"><p><span class="name">平均波动率<img class="ks-tooltip bodong" src="./image/tooltip.png"/></span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div></div>`)

	newDom.find('.row').append(part1);

	//cache doms
	_$container = newDom;
	let percentInfos = newDom.find('.percent-info');
	_dataDoms[0] = $(percentInfos[0]);
	_dataDoms[1] = $(percentInfos[1]);
	_dataDoms[2] = $(percentInfos[2]);
	_dataDoms[3] = $(percentInfos[3]);
	_$container.find('.ks-tooltip.bodong').ksTooltip(function(){
		var summaryDrawDown = _model.getSummary().summaryDrawDown;
		var len = summaryDrawDown.nSym,
				bars = summaryDrawDown.nDay - 1;
		return `${len}只结果在${bars*_intervalObj.value} ${_intervalObj.describe} 内的波动率标准差的平均值`;
	});
};

swingStatistic.update = (param) => {
	_intervalObj = param && param.intervalObj || _intervalObj;
	let model = _model;
	try {
		let dataObj = model.getSummary();
		let { max, min, average, ss } = dataObj.basicStasticAmplitude;
		let dataArr = [max, min, average, dataObj.fluctuation];
		_dataDoms.forEach(($dom, i) => {
			let data = dataArr[i],
					dataStr = (data * 100).toFixed(2) + '',
					values = dataStr.split('.');
			$($dom.find('span')[0]).text(values[0]);
			$($dom.find('span')[2]).text(values[1]);
		});
	} catch (e) {
		console.error(e);
	}
};

module.exports = swingStatistic;