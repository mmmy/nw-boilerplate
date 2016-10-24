
import moment from 'moment';
import painter from './painter';
let { drawKline, drawAxisY, drawAxisTime } = painter;

const Y_SCALE = 100;
const BAR_MOVE = 90;
const NONE = -1;

let canvasSizeHelper = function(canvas) {
	let $canvas = $(canvas);
	let height = $canvas.parent().height(),
			width = $canvas.parent().width();
	$canvas.attr({height, width}).css({height, width});
};

function KlinePrediction(container, config) {
	if(!container) {
		console.error('not a container dom!');
		return;
	}

	let $wrapper = $(`<div class='kline-editor-wrapper'></div>`).append(`<div class='kline-canvas-wrapper flex-center'><canvas tabindex='1' class='kline-canvas'/></div>`)
														.append(`<div class='right-axis-y-wrapper'><canvas class=''/></div>`)
														.append(`<div class='bottom-axis-x-wrapper silent'><canvas class=''/></div>`);

	$(container).append($wrapper);

	let canvases = $wrapper.find('canvas');

	this._wrapper = $wrapper[0];

	this._canvas = canvases[0];
	this._canvas_axis_y = canvases[1];
	this._canvas_axis_x = canvases[2];
	this._drawInfo = {}; //记录绘制后的参数

	this._kline = [];
	this._timeArray = [];

	this._baseBars = Infinity;
	
	this._predictionBars = -1;   //绘图bar数量应该 是由baseBar和predictionBars 决定, 而不是kline.length

	this._timeInterval = 'D';
	this._symbolName = '';
	this._symbolDescribe = '';
	this._klineScaleRate = 1.5;

	this._predictionPriceMin = 0; //记录预测部分kline价格下限
	this._predictionPriceMax = 0; //记录预测部分kline价格上限

	this._hoverIndex = -1;
	this._mouseX = -1;
	this._mouseY = -1;
	this._hoverY = -1;
	this._cursorAtIndex = -1;

	this._yAxisStates = {
		isMouseDown: false,
		y: -1
	};

	this._klineDrawOption = {
		drawLen: null,     //绘制bar数量, 如果>kline.length, 那么靠左绘制
		hoverIndex: -1,
		hoverY: -1,
		yMin: null,
		yMax: null,
		symbolName:'',
		symbolDescribe:'',
		baseBarRange: [],
		overflowPane: false, //超出上界面的内阴影
		overflowPaneBottom: false, //超出上界面的内阴影
	};
	this._yDrawOption = {
		hoverY: -1
	};
	this._xDrawOption = {
		drawLen: null,       //保证与K线区域对其
		hoverIndex: -1,
		showTime: false, //是否精确显示到 时分秒
	};

	this._clickHitTest = NONE;
	this._updateOHLC = null;

	this._constructor = 'KlinePrediction';
	this._init();
}

KlinePrediction.prototype._mouseDown = function(event) {
	let x = event.offsetX,
			y = event.offsetY;
	this._clickHitTest = this.getHitTest(x, y);
	this._mouseX = x;
	this._mouseY = y;
	this.setCursorByHittest(this._clickHitTest);
}

KlinePrediction.prototype._mouseUp = function(event) {
	this._clickHitTest = NONE;
	this.setCursor();
}

KlinePrediction.prototype._mouseMove = function(event) {
	let x = event.offsetX,
			y = event.offsetY;
	this.updateHover(x, y);
	if(this._clickHitTest == BAR_MOVE) this.movingBarsUpDown(x, y);
}

KlinePrediction.prototype._mouseLeave = function(event) {
	this._cursorAtIndex = -1;
}

KlinePrediction.prototype._yAxisMouseDown = function(event) {
	let y = event.offsetY;
	this._yAxisStates.isMouseDown = true;
	this._yAxisStates.y = y;
}

KlinePrediction.prototype._yAxisMouseUp = function(event) {

}

KlinePrediction.prototype._yAxisMouseMove = function(event) {

}

KlinePrediction.prototype._wrapperMouseUp = function(event) {
	this._yAxisStates.isMouseDown = false;
	this._yAxisStates.y = -1;
}

KlinePrediction.prototype._wrapperMouseMove = function(event) {
	let y = event.offsetY;
	if(this._yAxisStates.isMouseDown) {
		let { pricePerPix } = this._drawInfo;
		let dp = (y - this._yAxisStates.y) * pricePerPix;
		this._drawInfo.yMax += dp;
		this._drawInfo.yMin -= dp;
		this._yAxisStates.y = y;
		this.update();
		this.render();
	}
}


KlinePrediction.prototype._init = function() {
	this._updateCanvasSize();

	this._canvas.addEventListener('mousedown', this._mouseDown.bind(this));
	this._canvas.addEventListener('mouseup', this._mouseUp.bind(this));
	this._canvas.addEventListener('mousemove', this._mouseMove.bind(this));
	this._canvas.addEventListener('mouseleave', this._mouseLeave.bind(this));

	this._canvas_axis_y.addEventListener('mousedown', this._yAxisMouseDown.bind(this));
	this._canvas_axis_y.addEventListener('mouseup', this._yAxisMouseUp.bind(this));
	this._canvas_axis_y.addEventListener('mousemove', this._yAxisMouseMove.bind(this));

	this._wrapper.addEventListener('mouseup', this._wrapperMouseUp.bind(this));
	this._wrapper.addEventListener('mousemove', this._wrapperMouseMove.bind(this));

	this._resizeBinded = this._resize.bind(this);
	window.addEventListener('resize', this._resizeBinded);
}

KlinePrediction.prototype._resize = function() {
	console.assert(this._constructor == 'KlinePrediction','this is not KlinePrediction instance');
	this._updateCanvasSize();
	this.render();
}

KlinePrediction.prototype._updateCanvasSize = function() {
	canvasSizeHelper(this._canvas);
	canvasSizeHelper(this._canvas_axis_y);
	canvasSizeHelper(this._canvas_axis_x);
}

KlinePrediction.prototype._initKlineMaxMin = function() {
	let lowArr = [],
			highArr = [];
	let baseKline = this._kline.slice(0, this._baseBars),
			baseBars = this._baseBars < this._kline.length ? this._baseBars : this._kline.length;
	let len = baseKline.length;
	for(let i=0; i<len; i++) {
		let klineData = baseKline[i];
		lowArr.push(isNaN(+klineData[3]) ? Infinity : +klineData[3]);
    highArr.push(isNaN(+klineData[4]) ? -Infinity : +klineData[4]);
	}

	let min = Math.min.apply(null, lowArr);
	let max = Math.max.apply(null, highArr);
	let lastClosePrice = baseKline[baseBars - 1] && baseKline[baseBars - 1][2];
	let offset = Math.max(max - lastClosePrice, lastClosePrice - min);

	offset *= this._klineScaleRate;
	offset = isNaN(offset) ? 0 : offset;

	this._drawInfo.yMax = lastClosePrice ? (lastClosePrice + offset) : max;
	this._drawInfo.yMin = lastClosePrice ? (lastClosePrice - offset) : min;
}

KlinePrediction.prototype._initPredictionMaxMin = function() {
	let lowArr = [],
			highArr = [];
	let predictionKlines = this._kline.slice(this._baseBars - this._kline.length);
	let len = predictionKlines.length;
	for(let i=0; i<len; i++) {
		let klineData = predictionKlines[i];
		lowArr.push(isNaN(+klineData[3]) ? Infinity : +klineData[3]);
    highArr.push(isNaN(+klineData[4]) ? -Infinity : +klineData[4]);
	}
	this._predictionPriceMax = Math.max.apply(null, highArr);
	this._predictionPriceMin = Math.min.apply(null, lowArr);
}

KlinePrediction.prototype._initTimeArray = function() {
	this._timeArray = this._kline.map((priceArr) => {
		let rawTime = priceArr[0];
		let momentTime = typeof rawTime == 'number' ? moment.unix(rawTime) : moment(rawTime);
		return momentTime.format('YYYY-MM-DD HH:mm:ss');
	});
}

KlinePrediction.prototype.movingBarsUpDown = function(x, y) {
	let { pricePerPix } = this._drawInfo;
	let dy = y - this._mouseY;
	let dp = dy * pricePerPix;
	this._drawInfo.yMin += dp;
	this._drawInfo.yMax += dp;

	this._mouseX = x;
	this._mouseY = y;
	this.update();
	this.render();
}

KlinePrediction.prototype.updateHover = function(x, y) {
	let { pointToIndex } = this._drawInfo;

	if(!pointToIndex) return;

	let curIndex = pointToIndex(x, false);
	if(this._hoverIndex != curIndex) {
		this._hoverIndex = curIndex;
	}
	this._hoverY = y;
	//记录当前鼠标在一个bar的indext
	this.update();
	this.render();
	this._cursorAtIndex = pointToIndex(x, y);
}

KlinePrediction.prototype.getHitTest = function(x, y) {
	// let { pointToIndex, indexToPoint } = this._drawInfo;
	// let index = pointToIndex(x, false);
	if(x > 0 && x < this._canvas.width && y > 0 && y < this._canvas.height) {
		return BAR_MOVE;
	}
	return NONE;
}

KlinePrediction.prototype.setCursor = function(cursor) {
	cursor = cursor || 'default';
	this._canvas.style.cursor = cursor;
}

KlinePrediction.prototype.setCursorByHittest = function(hitTest) {
	switch(hitTest) {
		case NONE:
			this.setCursor(); break;
		case BAR_MOVE:
			this.setCursor('pointer'); break;
		case Y_SCALE:
			this.setCursor('ns-resize'); break;
		default:
			this.setCursor(); break;
	}
}

KlinePrediction.prototype._isMinuteTime = function() {
	return (parseInt(this._timeInterval) + '') == this._timeInterval; //说明是 this._timeInterval = '1' || '5' || '15'
}

KlinePrediction.prototype.update = function() {
	this._klineDrawOption.hoverIndex = this._hoverIndex;
	this._klineDrawOption.yMin = this._drawInfo.yMin === undefined ? this._klineDrawOption.yMin : this._drawInfo.yMin;
	this._klineDrawOption.yMax = this._drawInfo.yMax === undefined ? this._klineDrawOption.yMax : this._drawInfo.yMax;
	this._klineDrawOption.symbolName = this._symbolName;
	this._klineDrawOption.symbolDescribe = this._symbolDescribe;
	this._klineDrawOption.hoverY = this._hoverY;
	this._klineDrawOption.baseBarRange = [0, this._baseBars-1];
	this._klineDrawOption.overflowPane = this._klineDrawOption.yMax < this._predictionPriceMax;
	this._klineDrawOption.overflowPaneBottom = this._klineDrawOption.yMin > this._predictionPriceMin;

	let drawDataLen = this._baseBars + this._predictionBars;
	//如果 
	this._klineDrawOption.drawLen = (drawDataLen > this._kline.length) ? drawDataLen : null;

	this._yDrawOption.hoverY = this._hoverY;

	this._xDrawOption.hoverIndex = this._hoverIndex;
	this._xDrawOption.showTime = this._isMinuteTime();
	this._xDrawOption.drawLen = this._klineDrawOption.drawLen;
}

KlinePrediction.prototype.render = function() {
	this._drawInfo = drawKline(this._canvas, this._kline, this._klineDrawOption);
	drawAxisY(this._canvas_axis_y, [this._drawInfo.yMin, this._drawInfo.yMax], this._yDrawOption);
	drawAxisTime(this._canvas_axis_x, this._timeArray, this._xDrawOption);
}

KlinePrediction.prototype.setData = function(kline, baseBars, interval, symbol, symbolDescribe, predictionBars) {
	this._kline = kline;
	this._baseBars = +baseBars || Infinity;  //这个一定要设置
	this._predictionBars = +predictionBars; //这个一定要设置
	this._timeInterval = interval || 'D';
	this._symbolName = symbol || '';
	this._symbolDescribe = symbolDescribe || '';

	this._initKlineMaxMin();
	this._initPredictionMaxMin();
	this._initTimeArray();

	this.update();
	this.render();
}

KlinePrediction.prototype.getHoverOCLH = function() {
	let OCLH = this._kline[this._hoverIndex] || [];
	return OCLH.slice(-4);
}

KlinePrediction.prototype.getHoverIndex = function() {
	return this._hoverIndex;
}

KlinePrediction.prototype.setHoverIndex = function(index) {
	this._hoverIndex = index;
	this.update();
	this.render();
	return this.getHoverTooltipPosition();
}

KlinePrediction.prototype.getHoverTooltipPosition = function() {
	let {indexToPoint } = this._drawInfo;
	if(indexToPoint) {
		let {x, y} = indexToPoint(this._hoverIndex);
		return {x, y};
	}
	return {x:-1000, y:-1};
}

KlinePrediction.prototype.isCursorOverBar = function() {
	// console.log('cursorAtIndex', this._cursorAtIndex);
	return this._cursorAtIndex >= 0;
}

KlinePrediction.prototype.dispose = function() {
	window.removeEventListener('resize', this._resizeBinded);
}

module.exports = KlinePrediction;
