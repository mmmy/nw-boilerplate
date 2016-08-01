
import painter from './painter';
let { drawKline } = painter;
const aCode = 65;
const bCode = 66;
const dCode = 68;

const RANGE_MOVE = 100;
const RANGE_LEFT = 90;
const RANGE_RIGHT = 80;
const RANGE_UP_DOWN = 70;

const BAR_MOVE = 10;

const REGULAR = 1;
const NONE = -1;

function KlineEditor(canvasDom, kline) {
	if(!(canvasDom && canvasDom.getContext)) {
		console.error('not a canvas dom!');
		return;
	}
	this._canvas = canvasDom;
	this._ctx = canvasDom.getContext('2d');
	this._kline = kline;
	this._drawInfo = {}; //记录绘制之后的参数
	this._isMouseDown = false;
	this._editable = true;
	this._moveIndex = -1;
	this._selectedIndex = -1;
	this._hoverIndex = -1; //鼠标位置的k线
	this._mouseX = -1;
	this._mouseY = -1;

	this._drawingState = {drawingRange: false};
	this._selectedRange = [];
	this._clickHitTest = NONE;

	this._updateOHLC = null; //func
	this._onMoveIndex = null; //func
	this._init();
};

KlineEditor.prototype._drawKline = function(kline, options) {
	this._drawInfo = drawKline(this._canvas, kline, options);
}

KlineEditor.prototype._init = function() {
	this._drawKline(this._kline, {yMin:'200%', yMax:'200%'}); //预留上下的高度
	this._canvas.addEventListener('mousedown', this._mouseDown.bind(this));
	this._canvas.addEventListener('mouseup', this._mouseUp.bind(this));
	this._canvas.addEventListener('mousemove', this._mouseMove.bind(this));
	this._canvas.addEventListener('mouseleave', this._mouseLeave.bind(this));

	this._canvas.addEventListener('keydown', this._keyDown.bind(this));
	this._canvas.addEventListener('keyup', this._keyUp.bind(this));

};

KlineEditor.prototype.insertNewAfterSelectedIndex = function() {
	if(this._selectedIndex > -1) {
		let data = this._kline[this._selectedIndex];
		data = data.concat && data.concat([]);           //copy
		this._kline.splice(this._selectedIndex+1, 0, data);
		this.updateCanvas();
	}
}

KlineEditor.prototype.deleteAtSelectedIndex = function() {
	if(this._selectedIndex > -1) {
		this._kline.splice(this._selectedIndex, 1);
		if(this._selectedIndex >= this._kline.length) {
			this._selectedIndex = this._kline.length - 1;
		}
		this.updateCanvas();
	}
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
			this._startDrawRange();
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

	if(this._clickHitTest === REGULAR) this.beginMoveAKline(event.offsetX, event.offsetY);
	if(this._clickHitTest === RANGE_UP_DOWN) this.beginUpDownRange(event.offsetX, event.offsetY);
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
	this.movingUpDownRange(event.offsetX, event.offsetY); //上下移动区间
	if(this._clickHitTest == RANGE_MOVE) this.movingRange(x, y, true, true);   //左右移动
	if(this._clickHitTest == RANGE_LEFT) this.movingRange(x, y, true, false);   //左变宽
	if(this._clickHitTest == RANGE_RIGHT) this.movingRange(x, y, false, true);   //左变宽

	if(this._isDrawingRange() && (this._getDrawRangePoints() > 0)) {
		this.setRangeIndex(1, event.offsetX, event.offsetY, 1);
	}
	if(this._moveIndex == -1) this.updateHover(event.offsetX, event.offsetY);
	console.log(this.getHitTest(event.offsetX, event.offsetY));
	// if(this._editable) {
	// 	if(this._isMouseDown) {

	// 	} else {
	// 		// this._drawKline(this._kline, {mouse:{x:event.offsetX, y:event.offsetY}});
	// 	}
	// }
}

KlineEditor.prototype.updateHover = function(x, y) {
	let { pointToIndex } = this._drawInfo;
	let curIndex = pointToIndex(x, false);
	if(this._hoverIndex != curIndex) {
		this._hoverIndex = curIndex;
		let data = this._kline[curIndex]; // data=[time, O, C, L, H];
		// this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
		// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
		this.updateCanvas();
	}
}

KlineEditor.prototype.updateCanvas = function(){
	let data = this._kline[this._hoverIndex];
	data && this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
	this._drawKline(this._kline, {
																hoverIndex:this._hoverIndex, 
																selectedIndex:this._selectedIndex, 
																activeIndex:this._moveIndex, 
																yMin:this._drawInfo.yMin, 
																yMax:this._drawInfo.yMax,
																selectedRange: this._selectedRange,
															});
	// this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex]);
}

KlineEditor.prototype.beginMoveAKline = function(x,y) {
	let { pointToIndex } = this._drawInfo;
	this._mouseX = x;
	this._mouseY = y;
	this._moveIndex = pointToIndex(x, y); //获取需要移动的index
	this._selectedIndex = this._moveIndex;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();

	this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex]);
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

		this._onMoveIndex && this._onMoveIndex(this._moveIndex, this._kline[this._moveIndex]);
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
				(index0 >=0) && (this._selectedRange[0] = index0);
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

KlineEditor.prototype.movingUpDownRange = function(x,y) {
	if((this._selectedRange.length > 1) && (this._clickHitTest == RANGE_UP_DOWN)) {
		let { pricePerPix } = this._drawInfo;
		let dy = this._mouseY - y;
		let dp = dy * pricePerPix; //根据移动的像素值 计算价格变化
		
		for(let i=this._selectedRange[0]; i<=this._selectedRange[1]; i++) {
			let data = this._kline[i];
			data[1] += dp;
			data[2] += dp;
			data[3] += dp;
			data[4] += dp;
		}
		// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,activeIndex:this._moveIndex, yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
		this._mouseX = x;
		this._mouseY = y;
		// this._updateOHLC && this._updateOHLC(data[1], data[4], data[3], data[2]);
		this.updateCanvas();
	}
}

KlineEditor.prototype.endUpDownRange = function(x,y) {
	this._moveIndex = -1;
	this._mouseX = -1;
	this._mouseY = -1;
	// this._drawKline(this._kline, {hoverIndex:this._hoverIndex, selectedIndex:this._selectedIndex ,yMin:this._drawInfo.yMin, yMax:this._drawInfo.yMax});
	this.updateCanvas();
}

KlineEditor.prototype._startDrawRange = function() {
	this._drawingState.drawingRange = true;
	this.resetRangeIndex();
}

KlineEditor.prototype._endDrawRange = function() {
	this._drawingState.drawingRange = false;
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

	let isXInRange = (index >= this._selectedRange[0]) && (index <= this._selectedRange[1]);
	let isNearRangeLeft = Math.abs(indexToPoint(this._selectedRange[0]).x - x) < 5 ;
	let isNearRangeRight = Math.abs(indexToPoint(this._selectedRange[1]).x - x) < 5 ;
	//: indexRange left
	if(isNearRangeLeft) {
		return RANGE_LEFT;
	}
	//: indexRange right
	if(isNearRangeRight) {
		return RANGE_RIGHT;
	}
	//: indexRange move
	if(isXInRange && (y > 0) && (y < 20)) {
		return RANGE_MOVE;
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

module.exports = KlineEditor;