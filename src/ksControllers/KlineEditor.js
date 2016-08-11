
import painter from './painter';
let { drawKline, drawAxisY, drawAxisX } = painter;
const aCode = 65;
const bCode = 66;
const dCode = 68;

const RANGE_BAR_UP_DOWN = 110;
const RANGE_CLOSE = 105;
const RANGE_MOVE = 100;
const RANGE_LEFT = 90;
const RANGE_RIGHT = 80;
const RANGE_UP_DOWN = 70;

const BAR_MOVE = 10;

const REGULAR = 1;
const NONE = -1;

let canvasSizeHelper = function(canvas) {
	let $canvas = $(canvas);
	let height = $canvas.parent().height(),
			width = $canvas.parent().width();
	$canvas.attr({height, width}).css({height, width});
};

function KlineEditor(container, kline) {  //container dom is div dom
	if(!container) {
		console.error('not a container dom!');
		return;
	}
	let $wrapper = $(`<div class='kline-editor-wrapper'></div>`).append(`<div class='kline-canvas-wrapper flex-center'><canvas tabindex='1' class='kline-canvas'/></div>`)
														.append(`<div class='right-axis-y-wrapper'><canvas class=''/></div>`)
														.append(`<div class='bottom-axis-x-wrapper'><canvas class=''/></div>`);
	
	$(container).append($wrapper);

	let canvases = $wrapper.find('canvas');

	this._wrapper = $wrapper[0];

	this._canvas = canvases[0];
	this._canvas_axis_y = canvases[1];
	this._canvas_axis_x = canvases[2];
	// this._ctx = this._canvas.getContext('2d');
	this._kline = kline;
	this._drawInfo = {}; //记录绘制之后的参数
	this._isMouseDown = false;
	this._editable = true;
	this._moveIndex = -1;
	this._selectedIndex = -1;
	this._hoverIndex = -1; //鼠标位置的k线
	this._hoverY = -1;
	this._mouseX = -1;
	this._mouseY = -1;

	this._drawingState = {drawingRange: false, moveMode:0}; //moveMode:0(single) 1(linear)
	this._selectedRange = [];
	this._clickHitTest = NONE;

	//yAxis states
	this._yAxisStates = {isMouseDown: false, y:-1};

	this._updateOHLC = null; //func
	this._onMoveIndex = null; //func
	this._onUpdateInfo = null; //func
	this._onEndDrawRange = null; //func
	this._onRemoveRange = null; //func
	this._init();
};

KlineEditor.prototype._drawKline = function(kline, options, optionsY, optionsX) {
	this._drawInfo = drawKline(this._canvas, kline, options);
	drawAxisY(this._canvas_axis_y, [this._drawInfo.yMin, this._drawInfo.yMax], optionsY);
	drawAxisX(this._canvas_axis_x, this._drawInfo.dataLen, optionsX);
}

KlineEditor.prototype._init = function() {
	this._updateCanvasSize();

	this._drawKline(this._kline, {yMin:'200%', yMax:'200%'}); //预留上下的高度
	this._canvas.addEventListener('mousedown', this._mouseDown.bind(this));
	this._canvas.addEventListener('mouseup', this._mouseUp.bind(this));
	this._canvas.addEventListener('mousemove', this._mouseMove.bind(this));
	this._canvas.addEventListener('mouseleave', this._mouseLeave.bind(this));

	this._canvas.addEventListener('keydown', this._keyDown.bind(this));
	this._canvas.addEventListener('keyup', this._keyUp.bind(this));

	this._canvas_axis_y.addEventListener('mousedown', this._yAxisMouseDown.bind(this));
	this._canvas_axis_y.addEventListener('mouseup', this._yAxisMouseUp.bind(this));
	this._canvas_axis_y.addEventListener('mousemove', this._yAxisMouseMove.bind(this));

	this._wrapper.addEventListener('mouseup', this._wrapperMouseUp.bind(this));
	this._wrapper.addEventListener('mousemove', this._wrapperMouseMove.bind(this));

	window.addEventListener('resize', this._resize.bind(this));
};

KlineEditor.prototype._updateCanvasSize = function() {
	canvasSizeHelper(this._canvas);
	canvasSizeHelper(this._canvas_axis_y);
	canvasSizeHelper(this._canvas_axis_x);
}

KlineEditor.prototype._resize = function() {
	this._updateCanvasSize();
	this.updateCanvas();
}

KlineEditor.prototype.dispose = function() {
	window.removeEventListener('resize', this._resize);
}

KlineEditor.prototype.insertNewAfterSelectedIndex = function(bars) {
	bars = bars || 1;
	if(this._selectedIndex > -1) {
		let data = this._kline[this._selectedIndex];
		for(let i=0; i<bars; i++) {
			data = data.concat && data.concat([]);           //copy
			this._kline.splice(this._selectedIndex+1, 0, data);
		}
		this._onUpdateInfo && this._onUpdateInfo(this._kline.length); //跟新bars info
		this.updateCanvas();
	}
}

KlineEditor.prototype.deleteAtSelectedIndex = function() {
	if(this._selectedIndex > -1) {
		this._kline.splice(this._selectedIndex, 1);
		if(this._selectedIndex >= this._kline.length) {
			this._selectedIndex = this._kline.length - 1;
		}
		this._onUpdateInfo && this._onUpdateInfo(this._kline.length); //跟新bars info
		this.updateCanvas();
		return true;
	}
	return false;
}

KlineEditor.prototype.deleteAtRange = function() {
	if(this._selectedRange.length > 1) {
		this._kline.splice(this._selectedRange[0], Math.abs(this._selectedRange[1] - this._selectedRange[0]) + 1);
		this._hoverIndex = -1;
		this._selectedIndex = -1;
		this._moveIndex = -1;
		this.resetRangeIndex();
		return true;
	}
	return false;
}

KlineEditor.prototype.redo = function() {
	
}

KlineEditor.prototype.undo = function() {

}


KlineEditor.prototype._keyUp = function(event) {
	let keyCode = event.keyCode;
}

KlineEditor.prototype._keyDown = function(event) {
	let keyCode = event.keyCode;
	switch(keyCode) {
		case aCode:
			this.insertNewAfterSelectedIndex();
			break;
		case dCode:
			this.deleteAtSelectedIndex();
			break;
		case bCode:
			this.startSelectRange();
			break;
		default:
			break;
	}
}

KlineEditor.prototype._mouseDown = function(event) {
	console.log('KlineEditor mousedown', event);
	let x = event.offsetX;
	let y = event.offsetY;
	this._setClickHitTest(event.offsetX, event.offsetY);  //记录click hit test

	if(this._clickHitTest === RANGE_CLOSE) this.removeSelectRange(); //移除range
	if(this._clickHitTest === REGULAR) this.beginMoveAKline(event.offsetX, event.offsetY);
	if(this._clickHitTest === RANGE_UP_DOWN) this.beginUpDownRange(event.offsetX, event.offsetY);
	if(this._clickHitTest === RANGE_BAR_UP_DOWN) this.beginMoveAKline(event.offsetX, event.offsetY);
	if((this._clickHitTest === RANGE_MOVE) || (this._clickHitTest === RANGE_LEFT) || (this._clickHitTest === RANGE_RIGHT)) this.beginMoveRange(x, y);

	if(this._isDrawingRange()) {
		let drawIndex = this._getDrawRangePoints();
		this.setRangeIndex(drawIndex, event.offsetX, event.offsetY, 1);
		console.log('add mouse down event', drawIndex, this._selectedRange);
		if(drawIndex > 1) {
			this._endDrawRange();
		}
	}
}

KlineEditor.prototype._mouseUp= function(event){
	let x = event.offsetX;
	let y = event.offsetY;
	this._resetClickHitTest();  //reset click hit test
	this._isMouseDown = false;
	this.endMoveAKline(event.offsetX, event.offsetY);
	this.endUpDownRange(event.offsetX, event.offsetY);
	this.endMoveRange(x, y);
}

KlineEditor.prototype._mouseLeave = function(event) {
	this._isMouseDown = false;
	this.endMoveAKline(event.offsetX, event.offsetY);
}

KlineEditor.prototype._mouseMove = function(event){
	let x = event.offsetX;
	let y = event.offsetY;
	this.movingAKline(event.offsetX, event.offsetY); 			//上下移动一个k线
	if(this._clickHitTest == RANGE_UP_DOWN) this.movingUpDownRange(event.offsetX, event.offsetY); //上下移动区间
	if(this._clickHitTest == RANGE_BAR_UP_DOWN) this.movingUpDownRange(event.offsetX, event.offsetY, true); //上下移动区间 2
	if(this._clickHitTest == RANGE_MOVE) this.movingRange(x, y, true, true);   //左右移动
	if(this._clickHitTest == RANGE_LEFT) this.movingRange(x, y, true, false);   //左变宽
	if(this._clickHitTest == RANGE_RIGHT) this.movingRange(x, y, false, true);   //左变宽

	if(this._isDrawingRange() && (this._getDrawRangePoints() > 0)) {
		this.setRangeIndex(1, event.offsetX, event.offsetY, 1);
	}
	if(this._moveIndex == -1) this.updateHover(event.offsetX, event.offsetY);

	let hitTest = this.getHitTest(event.offsetX, event.offsetY);
	if(this._clickHitTest == NONE) {
		this.setCursorByHittest(hitTest);
	}
	console.log(this.getHitTest(event.offsetX, event.offsetY));

	// if(this._editable) {
	// 	if(this._isMouseDown) {

	// 	} else {
	// 		// this._drawKline(this._kline, {mouse:{x:event.offsetX, y:event.offsetY}});
	// 	}
	// }
}

KlineEditor.prototype._yAxisMouseDown = function(e) {
	let y = e.offsetY;
	this._yAxisStates.isMouseDown = true;
	this._yAxisStates.y = y;
}

KlineEditor.prototype._yAxisMouseUp = function(e) {

}

KlineEditor.prototype._yAxisMouseMove = function(e) {

}

//important
KlineEditor.prototype._wrapperMouseUp = function(e) {
	this._yAxisStates.isMouseDown = false;
	this._yAxisStates.y = -1;
}

KlineEditor.prototype._wrapperMouseMove = function(e) {
	let y = e.offsetY;
	if(this._yAxisStates.isMouseDown) { //scale Y
		let { pricePerPix } = this._drawInfo;
		let dp = (y - this._yAxisStates.y) * pricePerPix;
		this._drawInfo.yMax += dp;
		this._drawInfo.yMin -= dp;
		this._yAxisStates.y = y;
		this.updateCanvas();
	}
}

KlineEditor.prototype.updateHover = function(x, y) {
	let { pointToIndex } = this._drawInfo;
	let curIndex = pointToIndex(x, false);
	if(this._hoverIndex != curIndex) {
		this._hoverIndex = curIndex;
		// let data = this._kline[curIndex]; // data=[time, O, C, L, H];
		// this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
		// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	}
	this._hoverY = y;
	this.updateCanvas();
}

KlineEditor.prototype.updateCanvas = function(){
	let data = this._kline[this._hoverIndex];
	data && this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
	this._drawKline(this._kline, {
																hoverIndex:this._hoverIndex, 
																selectedIndex:this._selectedIndex,
																hoverY: this._hoverY,
																activeIndex:this._moveIndex, 
																yMin:this._drawInfo.yMin, 
																yMax:this._drawInfo.yMax,
																selectedRange: this._selectedRange,
															}, {
																hoverY: this._hoverY,
															}, {
																hoverIndex: this._hoverIndex,
																selectedIndex: this._selectedIndex,
															});
	// this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex]);
}

KlineEditor.prototype.beginMoveAKline = function(x,y) {
	
	if(this._drawingState.drawingRange) return;  //正在绘制range

	let { pointToIndex } = this._drawInfo;
	let index = pointToIndex(x, y); //获取需要移动的index
	if(this._selectedRange.length > 1 && (index < this._selectedRange[0] || index > this._selectedRange[1])) {
		return; //只能在区域内操作
	}

	this._mouseX = x;
	this._mouseY = y;
	this._moveIndex = index; //获取需要移动的index
	this._selectedIndex = this._moveIndex;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();

  this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex], this._selectedRange.length == 0);
}

KlineEditor.prototype.movingAKline = function(x,y) {
	if((this._moveIndex > -1) && (this._clickHitTest == REGULAR)) {
		let { pricePerPix } = this._drawInfo;
		let dy = this._mouseY - y;
		let dp = dy * pricePerPix; //根据移动的像素值 计算价格变化
		let data = this._kline[this._moveIndex];
		data[1] += dp;
		data[2] += dp;
		data[3] += dp;
		data[4] += dp;
		// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
		this._mouseX = x;
		this._mouseY = y;
		// this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
		this.updateCanvas();

		this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex], this._selectedRange.length == 0);
	}
}

KlineEditor.prototype.setMoveIndexO = function(val) {
	if(this._selectedIndex > -1 && val >= 0) {
		this._kline[this._selectedIndex][1] = val;
		this.updateCanvas();
	}
}

KlineEditor.prototype.setMoveIndexH = function(val) {
	console.debug('KlineEditor.prototype.setMoveIndexH',this);
	if(this._selectedIndex > -1 && val >= 0) {
		console.debug('KlineEditor.prototype.setMoveIndexH 1');
		this._kline[this._selectedIndex][4] = val;
		this.updateCanvas();
	}
}

KlineEditor.prototype.setMoveIndexL = function(val) {
	if(this._selectedIndex > -1 && val >= 0) {
		this._kline[this._selectedIndex][3] = val;
		this.updateCanvas();
	}
}

KlineEditor.prototype.setMoveIndexC = function(val) {
	if(this._selectedIndex > -1 && val >= 0) {
		this._kline[this._selectedIndex][2] = val;
		this.updateCanvas();
	}
}

//移动range
KlineEditor.prototype.beginMoveRange = function(x,y) {
	this._mouseX = x;
	this._mouseY = y;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

KlineEditor.prototype.movingRange = function(x, y, left, right) {
	if(this._selectedRange.length > 1) {
		let { klineXSpace } = this._drawInfo;
		let offset = x - this._mouseX;
		if(Math.abs(offset) >= klineXSpace) {
			let indexOffset = Math.round(offset / klineXSpace);
			let index0 = this._selectedRange[0] + indexOffset;
			let index1 = this._selectedRange[1] + indexOffset;
			if(left && right) {
				if((index0 >=0) && (index1 < this._kline.length)) {
					this._selectedRange[0] = index0;
					this._selectedRange[1] = index1;
					this._mouseX = x;
					this._mouseY = y;
				}
			} else if(left) {
				(index0 >=0) && (index0 < this._selectedRange[1]) && (this._selectedRange[0] = index0);
				this._mouseX = x;
				this._mouseY = y;
			} else if(right) {
				(index1 < this._kline.length) && (this._selectedRange[1] = index1);
				this._mouseX = x;
				this._mouseY = y;
			}
		}
	}
}

KlineEditor.prototype.endMoveRange = function(x,y) {
	this._mouseX = -1;
	this._mouseY = -1;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

//移动区间 上下
KlineEditor.prototype.beginUpDownRange = function(x,y) {
	this._mouseX = x;
	this._mouseY = y;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

KlineEditor.prototype.movingUpDownRange = function(x, y, hasMoveIndex) {
	if(this._selectedRange.length > 1) {
		let { pricePerPix } = this._drawInfo;
		let dy = this._mouseY - y;
		let dp = dy * pricePerPix; //根据移动的像素值 计算价格变化
		
		for(let i=this._selectedRange[0]; i<=this._selectedRange[1]; i++) { //同时移动
			let data = this._kline[i];
			let rate = 1;
			if(hasMoveIndex) { //有选中目标
				if(this._drawingState.moveMode==0){ //单个移动
					rate = 0;
					if(i == this._moveIndex) {
						rate = 1;
					}
				} else {          //两侧以线性移动 linear
					if(i <= this._moveIndex) {
						rate *= (i - this._selectedRange[0]) / (this._moveIndex - this._selectedRange[0]);
					} else {
						rate *= (this._selectedRange[1] - i) / (this._selectedRange[1] - this._moveIndex);
					}
				}
			}
			data[1] += dp * rate;
			data[2] += dp * rate;
			data[3] += dp * rate;
			data[4] += dp * rate;
		}
		// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
		this._mouseX = x;
		this._mouseY = y;
		// this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
		this.updateCanvas();
		this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex], false);

	}
}

KlineEditor.prototype.endUpDownRange = function(x,y) {
	this._moveIndex = -1;
	this._mouseX = -1;
	this._mouseY = -1;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

KlineEditor.prototype.startSelectRange = function() {
	this.setCursor('crosshair');
	this._drawingState.drawingRange = true;
	this._selectedIndex = -1;
	this._moveIndex = -1;
	this._onMoveIndex && this._onMoveIndex(-1);
	this.resetRangeIndex();
}

KlineEditor.prototype.removeSelectRange = function() {
	this.resetRangeIndex();
	this._onRemoveRange && this._onRemoveRange();
}

KlineEditor.prototype.setCursorByHittest = function(hitTest) {
	switch (hitTest) {
		case NONE:
			this.setCursor(); break;
		case REGULAR:
			this.setCursor(); break;
		case RANGE_BAR_UP_DOWN:
			this.setCursor('ns-resize'); break;
		case RANGE_UP_DOWN:
			this.setCursor('pointer'); break;
		case RANGE_CLOSE:
			this.setCursor('pointer'); break;
		case RANGE_MOVE:
			this.setCursor('ew-resize'); break;
		case RANGE_LEFT:
			this.setCursor('col-resize'); break;
		case RANGE_RIGHT:
			this.setCursor('col-resize'); break;
		case BAR_MOVE:
			this.setCursor('ns-resize'); break;
	}
}

KlineEditor.prototype.setCursor = function(cursor) {
	cursor = cursor || 'default';
	$(this._canvas).css('cursor', cursor);
}

KlineEditor.prototype._endDrawRange = function() {
	this._drawingState.drawingRange = false;
	this.setCursor();
	this._onEndDrawRange && this._onEndDrawRange(this._selectedRange);
}

KlineEditor.prototype._getDrawRangePoints = function() {
	return this._selectedRange.length;
}

KlineEditor.prototype._isDrawingRange = function() {
	return this._drawingState.drawingRange;
}

KlineEditor.prototype.resetRangeIndex = function() {
	this._selectedRange = [];
	this.updateCanvas();
}

KlineEditor.prototype.setRangeIndex = function(pointIndex,x,y, minInterval) {
	minInterval = minInterval || 0;
	let { pointToIndex } = this._drawInfo;
	let index = pointToIndex(x, false);

	if(pointIndex === 0) {
		this._selectedRange[pointIndex] = index;
	} else {
		if((index - this._selectedRange[pointIndex - 1]) >= minInterval) {
			this._selectedRange[pointIndex] = index;
		}
	}
	
	this.updateCanvas();
}

KlineEditor.prototype._setClickHitTest = function(x,y) {
	this._clickHitTest = this.getHitTest(x,y);
}

KlineEditor.prototype._resetClickHitTest = function() {
	this._clickHitTest = NONE;
}

KlineEditor.prototype.getHitTest = function(x,y) {
	let { pointToIndex, indexToPoint } = this._drawInfo;
	let index = pointToIndex(x, false);
	let indexWithY = pointToIndex(x, y);

	let isXInRange = (index >= this._selectedRange[0]) && (index <= this._selectedRange[1]);
	let isNearRangeRight20 = (x - indexToPoint(this._selectedRange[1]).x <= 0) && (x - indexToPoint(this._selectedRange[1]).x >= -20);
	let isNearRangeLeft = Math.abs(indexToPoint(this._selectedRange[0]).x - x) < 5 ;
	let isNearRangeRight = Math.abs(indexToPoint(this._selectedRange[1]).x - x) < 5 ;
	//indexRange close
	if(isXInRange && isNearRangeRight20 && (y > 0) && (y < 20)) {
		return RANGE_CLOSE;
	}
	//: indexRange move
	if(isXInRange && (y > 0) && (y < 20)) {
		return RANGE_MOVE;
	}
	//: indexRange left
	if(isNearRangeLeft) {
		return RANGE_LEFT;
	}
	//: indexRange right
	if(isNearRangeRight) {
		return RANGE_RIGHT;
	}
	//range bar up down
	if(isXInRange && (indexWithY > -1)) {
		return RANGE_BAR_UP_DOWN;
	}
	//: indexRange up down
	if(isXInRange) {
		return RANGE_UP_DOWN;
	}
	//: bar move
	if(false) {
		return	BAR_MOVE;
	}
	//: regular
	return REGULAR;
}

// KlineEditor.prototype.continueDrawRange = function(x,y) {
// 	let { pointToIndex } = this._drawInfo;
// 	let index = pointToIndex(x, false);
// 	this._selectedRange[1] = index;
// 	this.updateCanvas();
// }
// KlineEditor.prototype.endDrawRange = function(x,y) {
// 	this._drawingState.drawingRange = false;
// 	let { pointToIndex } = this._drawInfo;
// 	let index = pointToIndex(x, false);
// 	this._selectedRange[1] = index;
// 	this.updateCanvas();
// }

KlineEditor.prototype.endMoveAKline = function(x,y) {
	this._moveIndex = -1;
	this._mouseX = -1;
	this._mouseY = -1;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

KlineEditor.prototype.onUpdateOHLC = function(func) { //func(O, H, L, C)
	this._updateOHLC = func;
}

KlineEditor.prototype.onMoveIndex = function(func) { //func(index, data);
	this._onMoveIndex = func;
}

KlineEditor.prototype.onUpdateInfo = function(func) {
	this._onUpdateInfo = func;
}

KlineEditor.prototype.onEndDrawRange = function(func) {
	this._onEndDrawRange = func;
}

KlineEditor.prototype.setRangeMoveMode = function(mode) { //0  or 1
	this._drawingState.moveMode = mode;
}

KlineEditor.prototype.onRemoveRange = function(func) {
	this._onRemoveRange = func;
}

module.exports = KlineEditor;