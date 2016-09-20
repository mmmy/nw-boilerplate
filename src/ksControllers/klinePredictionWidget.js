import KlinePrediction from './KlinePrediction';

let _$root = null;
let _$header = null;
let _$body = null;

let _klinePrediction = null;

let klinePredictionWidget = {};

klinePredictionWidget.init = (root) => {
	if(!root) {
		console.warn('klinePredictionWidget init root is required');
		return;
	}
	if(_$root) {
		console.wran('klinePredictionWidget has been initailized!');
		return;
	}
	_$root = $(root);

	let headerStr = `<div class="header-container"><span class="title font-simsun">相似图形</span></div>`;
	let newDoms = $(`<div class="kline-prediction-widget-wrapper">${headerStr}<div class="body-container"></div></div>`);
	_$header = newDoms.find('.header-container');
	_$body = newDoms.find('.body-container');
	_$root.append(newDoms);

	_klinePrediction = new KlinePrediction(_$body[0]);
};

klinePredictionWidget.setPattern = (pattern) => {
	if(!_klinePrediction) return;

	let kline = pattern.kLine || [],
			baseBars = pattern.baseBars || 0,
			symbol = pattern.symbol || '',
			interval = pattern.type,
			symbolDescribe = pattern.metaData && pattern.metaData.name || '';

	_klinePrediction.setData(kline, baseBars, interval, symbol, symbolDescribe);
};

module.exports = klinePredictionWidget;