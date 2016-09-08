
import painter from './painter';

function KlineChart(dom,config){
	this._canvas = null;
	this._canvasParent = null;
	this._kline = [];
	this._drawOptions = {

	};

	return this._init(dom);
}

KlineChart.prototype._init = function(dom){
	if(!dom) {
		console.warn('dom is required!!');
		return null;
	}
	if(dom.getContext) {
		this._canvas = dom;
		this._canvasParent = dom.parentNode;
	} else {
		this._canvasParent = dom;
		this._canvas = document.createElement('canvas');
		this._canvasParent.appendChild(this._canvas);
	}
	this._udpateSize();
	return this;
}

KlineChart.prototype._udpateSize = function(){
	let width = this._canvasParent.clientWidth,
			height = this._canvasParent.clientHeight;
	this._canvas.style.width = width + 'px';
	this._canvas.style.height = height + 'px';
	this._canvas.height = height;
	this._canvas.width = width;
}

KlineChart.prototype.render = function() {
	painter.drawKline(this._canvas, this._kline, this._drawOptions);
}

KlineChart.prototype.setData = function(kline){
	this._kline = kline;
	this.render();
}

KlineChart.prototype.resize = function() {
	this._udpateSize();
	this.render();
}

module.exports = KlineChart;