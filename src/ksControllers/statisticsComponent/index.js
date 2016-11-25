
import AfterAnalysis from '../../../vendor/AfterAnalysis';

import peakStatistic from './peakStatistic';  								//极值统计
import drawDownStatistic from './drawDownStatistic';    //回撤统计
import swingStatistic from './swingStatistic'; 								//振幅统计

//第二版的新界面
let _$parent = null;
let _$container = null;
let _$noDataPane = $('<div class="full-width-height no-data-wrapper"><div class="center-vw"><h1><i class="fa fa-exclamation-circle"></i></h1><p>后向统计时间范围过小<br/>请尝试两根K线以上的后向统计</p></div></div>');
let statisticComponent = {};
let _model = null;

let _intervalObj = {value:1, unit:'D', describe:'天'};
let _convertToObj = (str) => { //'1','5','D'
	let value = parseInt(str);
	if(isNaN(value)) {
		return {value:1, unit:str, describe:'天'};
	} else {
		if(str.length === 1) { //分钟
			return {value:value, unit:'minute', describe:'分钟'};
		} else {
			return {value:value, unit:str.slice(-1), describe:'天'};
		}
	}
};

statisticComponent.init = (wrapper, closePrices) => {
	closePrices = closePrices || [];
	_model = new AfterAnalysis(closePrices);
	_$parent = $(wrapper);

	let container = $(`<div class="statistic-component-container"></div>`);
	$(wrapper).append(container);
	peakStatistic.init(container, _model);
	drawDownStatistic.init(container, _model);
	swingStatistic.init(container, _model);

	_$parent.append(_$noDataPane);
	_$container = container
	window._model = _model;
};

statisticComponent._updateModel = (closePrices, predictionBars) => {
	if(closePrices) {
		if(predictionBars) {
			_model.setBars(closePrices, {m: +predictionBars + 1});
		} else {
			_model.setBars(closePrices);
		}
		_model.summary();
		_model.summaryFreqPeakRate();
	}
}

statisticComponent.update = (closePrices, options) => {
	let predictionBars = options && options.predictionBars;

	_intervalObj = options && options.interval && _convertToObj(options.interval) || _intervalObj;
	let param = {intervalObj: _intervalObj};

	statisticComponent._updateModel(closePrices, predictionBars);
	if(predictionBars < 2) {   //当预测小于两个bar
		_$parent.addClass('no-data');
		return;
	}
	_$parent.removeClass('no-data');

	peakStatistic.update(param);
	drawDownStatistic.update(param);
	swingStatistic.update();
}

statisticComponent.getModel = () => {
	return _model;
}

statisticComponent.getInterval = () => {
	return _intervalObj;
}

module.exports = statisticComponent;