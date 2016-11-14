
import AfterAnalysis from '../../../vendor/AfterAnalysis';

import peakStatistic from './peakStatistic';  								//极值统计
import retracementStatistic from './retracementStatistic';    //回撤统计
import swingStatistic from './swingStatistic'; 								//振幅统计

//第二版的新界面
let statisticComponent = {};
let _model = null;

statisticComponent.init = (wrapper, closePrices) => {
	closePrices = closePrices || [];
	_model = new AfterAnalysis(closePrices);

	let container = $(`<div class="statistic-component-container"></div>`);
	$(wrapper).append(container);
	peakStatistic.init(container, _model);
	retracementStatistic.init(container, _model);
	swingStatistic.init(container, _model);
	window._model = _model;
	(closePrices.length > 0) && (window._dataObj = _model.getSummary());
};

statisticComponent._updateModel = (closePrices) => {
	if(closePrices) {
		_model.setBars(closePrices);
		_model.summary();
	}
}

statisticComponent.update = (closePrices) => {
	statisticComponent._updateModel(closePrices);
	peakStatistic.update();
	retracementStatistic.update();
	swingStatistic.update();
}

module.exports = statisticComponent;