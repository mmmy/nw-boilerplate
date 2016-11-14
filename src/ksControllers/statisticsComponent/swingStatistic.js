//振幅统计
let swingStatistic = {};

//缓存dom
let _upMean = null,
		_upMedia = null,
		_downMean = null,
		_downMedia = null;

swingStatistic.init = (wrapper) => {
	let newDom = $(`<div class='ks-container swing'><h4 class="title">振幅统计</h4><div class='row'></div></div>`);
	$(wrapper).append(newDom);

	//add other doms
	let part1 = $(`<div></div>`)
							.append(`<div class='ks-col-25'><p>上涨平均值<span class="percent-info"><span>7</span><span>.</span><span>12</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p>上涨中位数<span class="percent-info"><span>7</span><span>.</span><span>12</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p>下跌平均值<span class="percent-info"><span>7</span><span>.</span><span>12</span><span>%</span></span></p></div>`)
							.append(`<div class='ks-col-25'><p>下跌中位数<span class="percent-info"><span>7</span><span>.</span><span>12</span><span>%</span></span></p></div>`)

	newDom.find('.row').append(part1);
};

swingStatistic.update = (dataObj) => {

};

module.exports = swingStatistic;