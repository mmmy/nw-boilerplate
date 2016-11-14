//振幅统计
let swingStatistic = {};

//缓存dom
let _$container = null;
let _dataDoms = [];

let _model = null;

swingStatistic.init = (wrapper, model) => {

	_model = model;

	let newDom = $(`<div class='ks-container swing'><h4 class="title">振幅统计</h4><div class='row'></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let part1 = $(`<div></div>`)
							.append(`<div class='ks-col-25'><p><span class="name">振幅最大值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p><span class="name">振幅最小值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p><span class="name">平均值</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p><span class="name">方差</span><span class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></span></p></div>`)

	newDom.find('.row').append(part1);

	//cache doms
	_$container = newDom;
	let percentInfos = newDom.find('.percent-info');
	_dataDoms[0] = $(percentInfos[0]);
	_dataDoms[1] = $(percentInfos[1]);
	_dataDoms[2] = $(percentInfos[2]);
	_dataDoms[3] = $(percentInfos[3]);
};

swingStatistic.update = () => {
	let model = _model;
	try {
		let dataObj = model.getSummary();
		let { max, min, average, ss } = dataObj.basicStasticAmplitude;
		let dataArr = [max, min, average, ss];
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