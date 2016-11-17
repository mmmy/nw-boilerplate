import KlinePrediction from './KlinePrediction';
import OCLHTooltip from './OCLHTooltip';

let _$root = null;
let _$header = null;
let _$body = null;

let _klinePrediction = null;
let _tooltip = null;

let _triggerHoverOrigin = null; //func

let klinePredictionWidget = {};

let _triggerHover = (barIndex, showTooltip) => {
	if(barIndex < 0) {
		_tooltip.hide();
		return;
	}
	let {x,y} = _klinePrediction.setHoverIndex(barIndex);
	if(showTooltip) {
		let OCLH = _klinePrediction.getHoverOCLH();
		_tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3]);
		_tooltip.setPosition(x,y);
		_tooltip.show();
	} else {
		_tooltip.hide();
	}
};

let _initTooltip = () => {
	_tooltip = new OCLHTooltip(_$body);
	_$body.on('mousemove', (e)=>{
		// console.log(e);
		let x=e.pageX,
				y=e.pageY;
		let isCursorOverBar = _klinePrediction.isCursorOverBar();
		// console.log('isCursorOverBar',isCursorOverBar);
		if(isCursorOverBar) {
			let OCLH = _klinePrediction.getHoverOCLH();
			_tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3]);
			_tooltip.setPosition(x, y, 'fixed');
			_tooltip.show();
		}else{
			_tooltip.hide();
		}
		let hoverIndex = _klinePrediction.getHoverIndex();
		_triggerHoverOrigin && _triggerHoverOrigin(hoverIndex, isCursorOverBar);
		// _tooltip.show();
	}).on('mouseenter', (e) => {
		// _tooltip.show();
	}).on('mouseleave', (e)=>{
		// _tooltip.hide();
	});
}

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
	_initTooltip();
};

let _ksIntervalToTradigviewInterval = function(dataCategory) {
	dataCategory = dataCategory && dataCategory.toLowerCase();
	switch(dataCategory) {
		case 'cf':
			return 'D';
			break;
		case 'cf_m5':
			return '5';
			break;
		case 'cs':
			return 'D';
			break;
	}
};

klinePredictionWidget.setPattern = (pattern) => {
	if(!_klinePrediction) return;

	let kline = pattern.kLine || [],
			baseBars = pattern.baseBars || 0,
			symbol = pattern.symbol || '',
			interval = pattern.type || pattern.metaData && _ksIntervalToTradigviewInterval(pattern.metaData.dataCategory),
			symbolDescribe = pattern.metaData && pattern.metaData.name || '',
			predictionBars;
	try {
		var patterns = require('../store').getState().patterns;
		predictionBars = patterns.searchConfig.additionDate.value;
	} catch(e) {
		console.error(e);
	}

	_klinePrediction.setData(kline, baseBars, interval, symbol, symbolDescribe, predictionBars);
};

klinePredictionWidget.triggerHover = (barIndex, showTooltip) => {
	_triggerHover(barIndex, showTooltip);
};

klinePredictionWidget.setOriginHoverHandle = (handle) => {
	_triggerHoverOrigin = handle;
};

klinePredictionWidget.show = (show) => {
	_$root.find('.kline-prediction-widget-wrapper').toggleClass('show', show);
};

module.exports = klinePredictionWidget;