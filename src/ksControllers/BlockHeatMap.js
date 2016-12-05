
import heatMapPainter from './painters/heatMapPainter';

let _formatter = (value, yMin, yMax, decimal) => {
	decimal = decimal || 2;
	let middle = yMin/2 + yMax/2;
	let percentage = (value - middle) / middle * 100;
	percentage = Math.round(percentage * 1000) / 1000;
	return percentage.toFixed(decimal) + '%';
};

function BlockHeatMap(dom, config){
	config = config || {};
	this._isLight = $ && $.keyStone && ($.keyStone.theme == 'light');
	this._canvas = null;
	this._ctx = null;
	this._canvasParent = null;

	this._labelFormatter = config.labelFormatter || _formatter;

	this._colorRange = this._isLight ? {from:{R:199, G:199, B:199}, to:{R:101, G:24, B:24}} : {from:{R:204, G:204, B:204}, to:{R:72, G:72, B:72}};
	this._yMin = 0;
	this._yMax = 0;
	this._blocksNumber = 8;
	this._data = [];
	this._blocks = [];
	this._labels= [];
	this._labelDecimal = config && config.labelDecimal || 2;
	this._heatMapOptions = {
		textColor: config.textColor,
		fontSize: config.fontSize,
	};
	this._colors = [];
	this._init(dom);
}

BlockHeatMap.prototype._init = function(dom) {
	if(!dom) {
		console.warn('dom is require!');
		return;
	}
	if(dom.getContext) {
		this._canvas = dom;
		this._ctx = dom.getContext('2d');
		this._canvasParent = dom.parentNode;
	} else {
		this._canvas = document.createElement('canvas');
		this._ctx = this._canvas.getContext('2d');
		this._canvasParent = dom;
		this._canvasParent.appendChild(this._canvas);
	}
	this._udpateSize();
}

BlockHeatMap.prototype._udpateSize = function(){
	let width = this._canvasParent.clientWidth,
			height = this._canvasParent.clientHeight;
	this._canvas.style.width = width + 'px';
	this._canvas.style.height = height + 'px';
	this._canvas.width = width;
	this._canvas.height = height;
}

BlockHeatMap.prototype._createBlocks = function() {
	let yMin = this._yMin,
			yMax = this._yMax,
			blocksNumber = this._blocksNumber,
			data = this._data;

	let range = yMax - yMin,
			blockValueInterval = range/blocksNumber;

	let blocks = [];
	let labels = [];

	for(let i=0; i<blocksNumber; i++) {
		blocks.push(0);
		let label = this._labelFormatter(yMin + (i)*blockValueInterval, yMin, yMax, this._labelDecimal);
		labels.push(label);
	}

	let dataLen = data.length;
	for(let i=0; i<dataLen; i++) {
		let dataValueRelateMin = data[i] - yMin;
		let index = Math.floor(dataValueRelateMin / blockValueInterval);
		// console.log('blocks index',index, dataValueRelateMin, blockValueInterval, dataValueRelateMin / blockValueInterval);
		if(index>=0 && index<blocksNumber) {
			blocks[index] += 1;
		}
	}
	blocks.reverse();
	labels.reverse().pop();
	this._blocks = blocks;
	this._labels = labels;

	let maxValue = Math.max.apply(null, blocks);
	let colorFrom = this._colorRange.from,
			colorTo = this._colorRange.to,
			rRange = colorTo.R - colorFrom.R,
			gRange = colorTo.G - colorFrom.G,
			bRange = colorTo.B - colorFrom.B;

	let colors = [];

	for(let i=0; i<blocks.length; i++) {
		let value = blocks[i];
		let rate = (value/maxValue) ** 0.5;
		if(isNaN(rate)) {
			rate = 0;
		}
		let R = (rate * rRange) + colorFrom.R,
				G = (rate * gRange) + colorFrom.G,
				B = (rate * bRange) + colorFrom.B;
		R = Math.round(R);
		G = Math.round(G);
		B = Math.round(B);
		colors.push(`rgb(${R},${G},${B})`);
	}
	this._colors = colors;
}

BlockHeatMap.prototype.update = function(){

}

BlockHeatMap.prototype.render = function() {
	let drawData = {blocks: this._blocks, colors: this._colors, labels: this._labels};
	heatMapPainter.drawBlockHeatMap(this._canvas, drawData, this._heatMapOptions);
}

BlockHeatMap.prototype.resize = function() {
	this._udpateSize();
	this.render();
}

BlockHeatMap.prototype.setData = function(data, yMin, yMax, config) {
	config = config || {};
	this._yMax = yMax || Math.max.apply(null, data);
	this._yMin = yMin || Math.min.apply(null, data);
	this._data = data;
	this._labelDecimal = config.labelDecimal || this._labelDecimal;
	this._createBlocks();
	this.update();
	this.render();
}

module.exports = BlockHeatMap;
