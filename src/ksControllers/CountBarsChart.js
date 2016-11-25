//统计曲线图表class
import countLinesPainter from './painters/countLinesPainter';
let {drawCountBars, drawAxis} = countLinesPainter;

let canvasSizeHelper = function(canvas) {
	let $canvas = $(canvas);
	let height = $canvas.parent().height(),
			width = $canvas.parent().width();
	// $canvas.attr({height, width}).css({height, width});
};

function CountBarsChart(container, config) {
	if(!container) {
		console.error('not a container dom!');
		return;
	}
	config = config || {};
	var yMinSpace = config.yMinSpace || 30;
	var hideVerticalGrid = config.hideVerticalGrid;

	this._hideXAxis = config.hideXAxis || false;

	this._isHorizon = config.isHorizon || false;
	this._showValue = config.showValue || false;
	this._yAxisW = this._isHorizon ? 45 : 40;
	this._xAxisH = this._hideXAxis ? 10 : 30;

	this._events = {
		'hoverBar': null,
		'leaveBar': null
	};

	let $wrapper = $(`<div class="countlines-chart-wrapper"></div>`)
									.append(`<div class="main-wrapper"><canvas class='main-canvas'/></div>`)
									.append(`<div class="y-axis-wrapper"><canvas /></div>`)
									.append(`<div class="x-axis-wrapper"><canvas /></div>`);
	//styles
	// $wrapper.find('.chart-wrapper').css({position:'absolute'});
	// $wrapper.find('.main-wrapper').css({position:'absolute',});
	// $wrapper.find('.y-axis-wrapper').css({position:'absolute',});
	// $wrapper.find('.x-axis-wrapper').css({position:'absolute',});
	// $wrapper.find('canvas').css({position:'absolute',});

	$(container).append($wrapper);
	let canvases = $wrapper.find('canvas');

	this._wrapper = $wrapper[0];
	this._canvas_main = canvases[0];
	this._canvas_y = canvases[1];
	this._canvas_x = canvases[2];

	this._linesOption = {
		x: [1,2,3,4,5,6,7,8],
		padding: {
			left: 0,
			top: 20,
			right: this._isHorizon ? 50 : 20,
			bottom: 0,
		},
		series: [{
			data:[4,2,1,6,3,7,2,4],
			strokeStyle: 'rgba(200,60,10,0.7)',
			fillStyle: 'rgba(200,60,10,0.2)'
		},{
			data:[0,1,2,3,4,5,6,7],
			strokeStyle: 'rgba(10,200,70,0.7)',
			fillStyle: 'rgba(10,200,70,0.2)'
		}],
		isHorizon: this._isHorizon,
		showValue: this._showValue,
		hoverIndex: -1
	};
	this._xAxisOptions = {
		padding: {left:this._yAxisW,top:0,right:this._isHorizon ? 50 : 20,bottom:0},
		activeIndexes: [],
		minSpace: 30,
		centerLabel: false
	};
	this._yAxisOptions = {
		minSpace: yMinSpace,
		isVertical: true,
		labelWidth : this._yAxisW, 
		padding:{left:0,top:20,right:20,bottom:this._xAxisH},
		activeIndexes: [],
		hideVerticalGrid: hideVerticalGrid
	};

	//drawCountLines 返回的对象, 包含获取绘图所需要的信息, 参考countLinesPainter.js的返回值
	this._drawLinesInfo = null;

	this._constructor = "CountBarsChart";
	this._init();
}

CountBarsChart.prototype._resize = function() {
	this._updateCanvasSize();
	this.render();
}

CountBarsChart.prototype._updateCanvasSize = function() {
	canvasSizeHelper(this._canvas_main);
	canvasSizeHelper(this._canvas_y);
	canvasSizeHelper(this._canvas_x);
}

CountBarsChart.prototype._init = function() {
	if(this._isHorizon) {
		$(this._canvas_x).hide();
	}
	this._resizeHandle = this._resize.bind(this);
	window.addEventListener('resize',this._resizeHandle);

	this._canvas_main.addEventListener('mousemove', this._mainMouseMove.bind(this));
	this._canvas_main.addEventListener('mouseleave', this._mainMouseLeave.bind(this));
}

CountBarsChart.prototype._mainMouseMove = function(e) {
	let x = e.offsetX,
			y= e.offsetY;
	if(this._drawLinesInfo) {
		let { indexAtPoint } = this._drawLinesInfo;
		let hoverIndex = indexAtPoint(x,y);
		if(this._linesOption.hoverIndex !== hoverIndex) {
			//高亮 鼠标所在位置的曲线
			this._linesOption.hoverIndex = hoverIndex;
			this.render();
			//trigger event
			this.trigger(hoverIndex > -1 ? 'hoverBar' : 'leaveBar', {index: hoverIndex});
		}
	}
}

CountBarsChart.prototype._mainMouseLeave = function(e) {
	this._linesOption.hoverIndex = -1;
	this.render();
}

CountBarsChart.prototype._drawChart = function() {
	//计算Y轴坐标值, 先获得每个serie 的最大值, 再求最大值
	let countMax = 0;
	let that = this;
	for(var i=0; i < this._linesOption.series.length; i++) {
		let data = this._linesOption.series[i].data;
		for(var j=0,len=data.length; j<len; j++) {
			countMax = Math.max(countMax, data[j].value);
		}
	}
	let yLables = [];
	if(countMax > 0) {
		for(var i=0; i<=countMax; i++) {
			yLables.push(i);
		}
	}

	this._drawLinesInfo = drawCountBars(this._canvas_main, this._linesOption);
	drawAxis(this._canvas_x, (this._isHorizon ? yLables : this._linesOption.x), this._xAxisOptions);
	drawAxis(this._canvas_y, (this._isHorizon ? this._linesOption.x : yLables), this._yAxisOptions);
}

CountBarsChart.prototype.render = function() {
	this._drawChart();
}

CountBarsChart.prototype.setData = function({xLables, series}) {
	series = series || [];
	xLables = xLables || [];
	this._linesOption.x = xLables;
	this._linesOption.series = series;
	this.render();
}

CountBarsChart.prototype.on = function(name, handle) {
	this._events[name] = handle;
}

CountBarsChart.prototype.trigger = function(name, param) {
	var handle = this._events[name];
	if(handle) {
		handle(param);
	}
}

CountBarsChart.prototype.dispose = function() {
	window.removeEventListener('resize', this._resizeHandle);
}

module.exports = CountBarsChart;