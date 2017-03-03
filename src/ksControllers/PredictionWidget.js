
//详情左上角预测
import painter from './painter';
import linePainter from './linePainter';
import moment from 'moment';

let { drawKline, drawAxisY, drawAxisTime } = painter;

const HITTEST = {
	SCALE_LINES: 100,
	KLINE: 10,
	NONE: 0
};

let createEmptyKline = (len) => {
  let data = [];
  for (let i=0; i<len; i++) {
    data.push([i+'', undefined, undefined, undefined, undefined]);
  }
  return data;
};

let PredictionWidget = function(dom, config){
	config = $.extend({
		showRange: false,
		slient: false,
		klineScaleRate: 1.25,
		padding: {right:58},
		axis: false,         //显示x,y轴的
		volume: false,
	},config);
	this._canvas = null;
	this._ctx = null;
	this._canvasParent = null;
	this._isLight = $ && $.keyStone && ($.keyStone.theme == 'light');

	this._kline = [];
	this._closePrice = [];
	this._closePriceScaled = [];
	this._linesVisibility = [];
	this._patterns = [];
	this._baseBars = 0;
	this._predictionBars = 0;

	this._drawKlineInfo = {}; //记录绘制之后的参数
	this._clickHitTest = HITTEST.NONE;
	this._hoverKlineIndex = -1;
	this._clickX = 0;
	this._clickY = 0;
	this._linesYOffset = 0;

	this._cursorAtIndex = -1;

	this._showRange = Boolean(config.showRange);
	this._slient = Boolean(config.slient);
	this._klineScaleRate = config.klineScaleRate;
	this._axis = config.axis;

	this._activeLine = this._slient ? -1 : 0;

	var padding = config.padding;
	this._klineOption = {
		yMin: null,
		yMax: null,
		predictionBars: 0,
		hoverIndex: -1,
		selectedRange: [0, 0],
		hoverY: -1,
		rangeOption: {noCloseBtn: true},
		padding: padding,
		volume: false,
	};

	this._canvas_axis_y = null;
	this._canvas_axis_x = null;

	this._linesOptions = {
		yMin: null,
		yMax: null,
		dataLen: null, //一定要设置
		emptyLeftLen: 10,
		activeIndex: 0,
		volumeHeight: 0.2,
		lineColor: 'rgba(200,200,200,0.5)',
		activeColor: $.keyStone && $.keyStone.configDefault.brownRed || '#862020',
		visibilitys: null,
		padding: padding,
		patterns: null
	};

	//axis options
	this._yDrawOption = {
		hoverY: -1,
		textColor: this._isLight ? '' : '#999',
		hoverColor: this._isLight ? '' : '#222',
		hoverBackground: this._isLight ? '' : '#aaa',
	};
	this._xDrawOption = {
		drawLen: null,       //保证与K线区域对其
		hoverIndex: -1,
		showTime: false, //是否精确显示到 时分秒
		textColor: this._isLight ? '' : '#999',
		hoverColor: this._isLight ? '' : '#222',
		hoverBackground: this._isLight ? '' : '#aaa',
	};
	this._timeArray = [];
	this._timeInterval = 'D';

	this._onHoverKline = null; //func
	this._onScaleLines = null; //func

	this._init(dom);
}

PredictionWidget.prototype._init = function(dom){
	if(!dom) {
		console.warn('dom is required!');
	}
	if(dom.getContext) {
		this._canvas = dom;
		this._ctx = dom.getContext('2d');
		this._canvasParent = dom.parentNode;
	} else {
		this._canvas = document.createElement('canvas');
		this._ctx = this._canvas.getContext('2d');
		this._canvasParent = $('<div class="main-wrapper"></div>')[0];
		$(dom).append($(this._canvasParent).append(this._canvas));
		//axis
		if(this._axis) {
			this._canvas_axis_x = document.createElement('canvas');
			this._canvas_axis_y = document.createElement('canvas');
			$(dom).append($('<div class="bottom-axis-x-wrapper"></div>').append(this._canvas_axis_x))
													.append($('<div class="left-axis-y-wrapper"></div>').append(this._canvas_axis_y))
													.addClass('axis');

		}
	}
	this._updateSize();
	this._canvasParent.addEventListener('mousedown', this._mouseDown.bind(this));
	this._canvasParent.addEventListener('mousemove', this._mouseMove.bind(this));
	this._canvasParent.addEventListener('mouseup', this._mouseUp.bind(this));
	this._canvasParent.addEventListener('mouseleave', this._mouseLeave.bind(this));
}

PredictionWidget.prototype._updateSize = function(){
	let width = this._canvas.parentNode.clientWidth,
			height = this._canvas.parentNode.clientHeight;
	this._canvas.style.width = width + 'px';
	this._canvas.style.height = height + 'px';
	this._canvas.width = width;
	this._canvas.height = height;
}

PredictionWidget.prototype._getHitTest = function(x, y) {
	if(this._slient) {
		return HITTEST.NONE;
	}
	let { pointToIndex, indexToPoint } = this._drawKlineInfo;
	if(!pointToIndex || !indexToPoint) return;
	let index = pointToIndex(x, false);
	let height = this._canvas.height;
	if(index == -1) {
		if(y < height * 0.8) {
			return HITTEST.SCALE_LINES;
		} else {
			return HITTEST.NONE;
		}
	}	else {
		return HITTEST.KLINE;
	}
	return HITTEST.NONE;
}

PredictionWidget.prototype._mouseDown = function(e){
	let x = e.offsetX,
			y = e.offsetY;
	let hittest = this._getHitTest(x, y);
	this._clickHitTest = hittest;
	this._clickX = x;
	this._clickY = y;
}

PredictionWidget.prototype._mouseUp = function(e){
	this._clickHitTest = HITTEST.NONE;
}

PredictionWidget.prototype._mouseMove = function(e){
	let x = e.offsetX,
			y = e.offsetY;
	this.updateHover(x, y);
	if(this._clickHitTest == HITTEST.SCALE_LINES) this._scaleLines(x, y);
}

PredictionWidget.prototype._mouseLeave = function(e){
	this.resetState();
}

PredictionWidget.prototype.resetState = function(){
	this._clickHitTest = HITTEST.NONE;
	this._linesYOffset = 0;
	this._cursorAtIndex = -1;
}

PredictionWidget.prototype.setCursor = function(cursor){
	cursor = cursor || 'default';
	this._canvas.style.cursor = cursor;
}

PredictionWidget.prototype.setCursorByHittest = function(hittest){
	switch (hittest) {
		case HITTEST.NONE:
			this.setCursor(); break;
		case HITTEST.KLINE:
			this.setCursor(); break;
		case HITTEST.SCALE_LINES:
			this.setCursor('ns-resize'); break;
		default:
			this.setCursor(); break;
	}
}

PredictionWidget.prototype._scaleLines = function(x, y) {
	let height = this._canvas.height;
	let pricePerPix = (this._linesOptions.yMax - this._linesOptions.yMin) / height;
	let dy = y - this._clickY;
	this._linesYOffset = dy * pricePerPix;
	this.update();
	this._onScaleLines && this._onScaleLines(this._linesOptions.yMin, this._linesOptions.yMax);
	this._clickY = y;
	this._linesYOffset = 0;
}

PredictionWidget.prototype._isMinuteTime = function() {
	return (parseInt(this._timeInterval) + '') == this._timeInterval; //说明是 this._timeInterval = '1' || '5' || '15'
}

PredictionWidget.prototype._initTimeArray = function() {
	this._timeArray = this._kline.map((priceArr) => {
		let rawTime = priceArr[0];
		let momentTime = typeof rawTime == 'number' ? moment.unix(rawTime) : moment(rawTime);
		return momentTime.format('YYYY-MM-DD HH:mm:ss');
	});
}

PredictionWidget.prototype.updateHover = function(x, y){
	if(!this._axis && this._slient) return;
	let {pointToIndex} = this._drawKlineInfo;
	if(!pointToIndex) return;
	let hittest =  this._getHitTest(x, y);
	this.setCursorByHittest(hittest);

	let currentIndex = pointToIndex(x, false);
	if(this._hoverKlineIndex != currentIndex || this._axis) {
		if(this._axis) {
			this._klineOption.hoverY = y;
			this._yDrawOption.hoverY = y;
			this._xDrawOption.hoverIndex = currentIndex;
			this._xDrawOption.showTime = this._isMinuteTime();
		}
		this._hoverKlineIndex = currentIndex;
		let hoverData = this._kline[this._hoverKlineIndex];
		this._onHoverKline && this._onHoverKline(this._hoverKlineIndex, hoverData);
		this.update();
	}
	//记录当前鼠标在bar的位置
	this._cursorAtIndex = pointToIndex(x, y);
}

PredictionWidget.prototype._updateKlineOption = function(){
	let lowArr = [],
			highArr = [];

	let len = this._kline.length;
	for(let i=0; i<len; i++) {
		let klineData = this._kline[i];
		lowArr.push(isNaN(+klineData[3]) ? Infinity : +klineData[3]);
    highArr.push(isNaN(+klineData[4]) ? -Infinity : +klineData[4]);
	}

	var min = Math.min.apply(null, lowArr);
  var max = Math.max.apply(null, highArr);
  var lastClosePrice = this._kline.length>0 && this._kline[len - 1][2];
  var offset = Math.max(max - lastClosePrice, lastClosePrice - min);

  offset *= this._klineScaleRate;
  offset = isNaN(offset) ? 0 : offset;

  this._klineOption.yMax = lastClosePrice + offset;
  this._klineOption.yMin = lastClosePrice - offset;
  this._klineOption.predictionBars = +this._predictionBars;
  this._klineOption.volume = this._patterns.length > 0  || this._axis;
  this._linesOptions.volume = this._axis;
  this._xDrawOption.drawLen = this._kline.length + this._predictionBars;
}

PredictionWidget.prototype._updateLinesOption = function(){
	let yMin = Infinity,
			yMax = -Infinity;
	let allPrice = this._closePriceScaled.reduce((pre, priceArr) => {
		return pre.concat(priceArr);
	}, []);
	var priceMin = Math.min.apply(null, allPrice);
	var priceMax = Math.max.apply(null, allPrice);
	var lastClosePrice = this._kline.length>0 && this._kline[this._kline.length - 1][1];

	if(lastClosePrice === undefined) {

	} else {
		let offset = Math.max(priceMax - lastClosePrice, lastClosePrice - priceMin);
		yMax = lastClosePrice + offset;
		yMin = lastClosePrice - offset;
	}

	this._linesOptions.yMax = yMax;
	this._linesOptions.yMin	= yMin;
	this._linesOptions.emptyLeftLen = this._baseBars;
	this._linesOptions.dataLen = +this._predictionBars;
}

PredictionWidget.prototype._drawKline = function(){
	//merge
	this._klineOption.hoverIndex = this._hoverKlineIndex;
	this._klineOption.selectedRange[1] = this._showRange ? (this._kline.length>0 ? this._kline.length - 1 : 0) : -1;
	//kline
	this._drawKlineInfo = drawKline(this._canvas, this._kline, this._klineOption);
	if(this._axis) {
		//y axis
		var yMax = this._drawKlineInfo.yMax,
				yMin = this._drawKlineInfo.yMin;
		var vH = 0.2;
		drawAxisY(this._canvas_axis_y, [yMin - (yMax - yMin) * vH / (1 - vH), yMax], this._yDrawOption);
		//x axis
		drawAxisTime(this._canvas_axis_x, this._timeArray, this._xDrawOption);
	}
}

PredictionWidget.prototype._drawLines = function(){
	//merge
	this._linesOptions.yMax = this._linesOptions.yMax + this._linesYOffset;
	this._linesOptions.yMin = this._linesOptions.yMin - this._linesYOffset;
	this._linesOptions.activeIndex = this._activeLine;
	this._linesOptions.visibilitys = this._linesVisibility;
	this._linesOptions.patterns = this._patterns;

	linePainter.drawLines(this._canvas, this._closePriceScaled, this._linesOptions);
}

PredictionWidget.prototype._updateData = function(){
	if(this._kline.length>0){
		let linesVisibility = [];
		let lastClosePrice = this._kline[this._kline.length-1][1];
		let closePriceScaled = this._closePrice.map((priceArr, i) => {
			linesVisibility.push(true);
			let rate = 1;
			let priceArrScaled = priceArr.map((price, index) => {
				if(index == 0){
					rate = lastClosePrice / price;
					return lastClosePrice;
				} else {
					return price * rate;
				}
			});
			return priceArrScaled;
		});
		this._closePriceScaled = closePriceScaled;
		this._linesVisibility = linesVisibility;
	}
}

PredictionWidget.prototype.setData = function(kline, closePrice, baseBars, predictionBars, patterns){
	var _kline = kline;
	if(kline && kline.length>0 && kline[0].open) {
		_kline = kline.map(function(price){
			return [price.date, price.open, price.close, price.low, price.high, price.volume];
		});
	}
	this._kline = _kline || this._kline;
	this._closePrice = closePrice || this._closePrice;
	this._baseBars = baseBars || kline && kline.length || this._baseBars;
	this._predictionBars = predictionBars || closePrice && closePrice[0] && closePrice[0].length || this._predictionBars;
	this._patterns = patterns || this._patterns;
	this._initTimeArray();
	this._updateData();
	this._hoverKlineIndex = -1;
	this._updateKlineOption();
	this._updateLinesOption();
	this.update();
}

PredictionWidget.prototype.update = function(){
	this._drawKline();
	this._drawLines();
}

PredictionWidget.prototype.resize = function(){
	this._updateSize();
	this.update();
}

PredictionWidget.prototype.getLastPrices = function(){
	let lastPrices = [];
	let visibilitys = this._linesVisibility;
	this._closePriceScaled.forEach((priceArr, i) => {
		if(visibilitys[i]) lastPrices.push(priceArr[priceArr.length - 1]);
	});
	return lastPrices;
}

PredictionWidget.prototype.getLineChartMinMax = function(){
	return {
		yMin: this._linesOptions.yMin,
		yMax: this._linesOptions.yMax
	};
}

PredictionWidget.prototype.setHoverIndex = function(index){
	this._hoverKlineIndex = index < this._kline.length ? index : -1;
	this.update();
	this._onHoverKline && this._onHoverKline(this._hoverKlineIndex, this._kline[this._hoverKlineIndex]);
}

PredictionWidget.prototype.setActiveLine = function(index){
	this._activeLine = index;
	this.update();
}

PredictionWidget.prototype.filterLines = function(idArr){
	let visibilitys = [];
	idArr.forEach((id) => {
		visibilitys[id] = true;
	});
	this._linesVisibility = visibilitys;
	this.update();
}

PredictionWidget.prototype.onHoverKline = function(handle){
	this._onHoverKline = handle;
}

PredictionWidget.prototype.onScaleLines = function(handle){
	this._onScaleLines = handle;
}

PredictionWidget.prototype.isCursorOverBar = function() {
	return this._cursorAtIndex >= 0;
}

PredictionWidget.prototype.getHoverOCLH = function() {
	let OCLH = this._kline[this._hoverKlineIndex] || [];
	return OCLH.slice(-5);
}
PredictionWidget.prototype.getHoverIndex = function() {
	return this._hoverKlineIndex;
}
//外部设置 hoverKlineIndex
PredictionWidget.prototype.setHoverIndex = function(index){
	this._hoverKlineIndex = index < this._kline.length ? index : -1;
	this.update();
	return this.getHoverTooltipPosition();
}
//获取hoverKlineIndex所在处的k线tooltip的位置
PredictionWidget.prototype.getHoverTooltipPosition = function() {
	let {indexToPoint } = this._drawKlineInfo;
	if(indexToPoint && (this._hoverKlineIndex < this._kline.length) && (this._hoverKlineIndex > -1)) {
		let {x, y} = indexToPoint(this._hoverKlineIndex);
		return {x, y};
	}
	return {x:-1000, y:-1};
}

module.exports = PredictionWidget;
