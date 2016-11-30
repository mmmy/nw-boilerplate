//统计曲线图表class
import countLinesPainter from './painters/countLinesPainter';
let {drawCountLines, drawAxis} = countLinesPainter;

let canvasSizeHelper = function(canvas) {
	let $canvas = $(canvas);
	let height = $canvas.parent().height(),
			width = $canvas.parent().width();
	// $canvas.attr({height, width}).css({height, width});
};

function CountLinesChart(container, config) {
	if(!container) {
		console.error('not a container dom!');
		return;
	}
	this._yAxisW = 40;
	this._xAxisH = 30;
	this._events = {
		'hoverLine':null,
		'leaveLine':null,
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
			right: 20,
			bottom: 0,
		},
		series: [{
			data:[4,2,1,6,3,7,2,4],
			activeIndexes: [3],
			strokeStyle: 'rgba(200,60,10,0.7)',
			fillStyle: 'rgba(200,60,10,0.2)'
		},{
			data:[0,1,2,3,4,5,6,7],
			activeIndexes: [7],
			strokeStyle: 'rgba(10,200,70,0.7)',
			fillStyle: 'rgba(10,200,70,0.2)'
		}],
		hoverIndex: -1
	};
	this._xAxisOptions = {
		padding: {left:this._yAxisW,top:0,right:20,bottom:0},
		activeIndexes: []
	};
	this._yAxisOptions = {
		isVertical: true, 
		padding:{left:0,top:20,right:20,bottom:this._xAxisH},
		activeIndexes: []
	};

	//drawCountLines 返回的对象, 包含获取绘图所需要的信息, 参考countLinesPainter.js的返回值
	this._drawLinesInfo = null;
	this._toolTipCustom = function(lineIndex,param) {
		let value = param.value,
				index = param.index;
		return `<span class="value">${value}</span>个结果<br>在第${index}到达高点`;
	};

	this._constructor = "CountLinesChart";
	this._init();
}

CountLinesChart.prototype._resize = function() {
	// this._updateCanvasSize();
	let {width, height} = require('../shared/nwApp').appGetSize();
	if(width > 1000) {
		this.render();
	}
}

CountLinesChart.prototype._updateCanvasSize = function() {
	canvasSizeHelper(this._canvas_main);
	canvasSizeHelper(this._canvas_y);
	canvasSizeHelper(this._canvas_x);
}

CountLinesChart.prototype._init = function() {
	this._resizeHandle = this._resize.bind(this);
	window.addEventListener('resize',this._resizeHandle);

	this._canvas_main.addEventListener('mousemove', this._mainMouseMove.bind(this));
	this._canvas_main.addEventListener('mouseleave', this._mainCanvasMouseLeave.bind(this));
	this._canvas_main.parentNode.addEventListener('mouseleave', this._mainMouseLeave.bind(this));
}

CountLinesChart.prototype._mainMouseMove = function(e) {
	let x = e.offsetX,
			y= e.offsetY;
	if(this._drawLinesInfo) {
		let { indexAtPoint } = this._drawLinesInfo;
		let { hoverIndex, activeIndex } = indexAtPoint(x, y);
		if(this._linesOption.hoverIndex !== hoverIndex || this._linesOption.activeIndex !== activeIndex) {
			//高亮 鼠标所在位置的曲线
			this._linesOption.hoverIndex = hoverIndex;
			this._linesOption.activeIndex = activeIndex;
			this.render();
			//trigger event
			this.trigger('leaveLine',{index: -1});
			this.trigger(hoverIndex > -1 ? 'hoverLine' : 'leaveLine', {index: hoverIndex});
			//show tool tip
			this._showToolTip(hoverIndex > -1, activeIndex);
		}
	}
}

CountLinesChart.prototype._showToolTip = function(show, activeIndex) {
	if(show) {
		$(this._wrapper).find('.countlineschart-tooltip').remove();

		var intervalObj = require('./statisticsComponent').getInterval();

		let hoverIndex = this._linesOption.hoverIndex;
		if(activeIndex === undefined) {																				//默认触发高点tooltip
			activeIndex = this._linesOption.series[hoverIndex].activeIndexes[0];
			this._linesOption.activeIndex = activeIndex;
		}
		let { indexToCoordinate } = this._drawLinesInfo;
		let {x,y} = indexToCoordinate(hoverIndex, activeIndex);
		let value = this._linesOption.series[hoverIndex].data[activeIndex];
		let indexStr = (activeIndex + 1) * intervalObj.value + intervalObj.describe;
		let content = this._toolTipCustom(hoverIndex, {value:value, index:indexStr});
		let toolTip = $(`<span class="countlineschart-tooltip">${content}</span>`);

		toolTip.css({top:y});
		let containerW = $(this._canvas_main).width();
		if(x > containerW - 165) {
			toolTip.css('right', containerW - x + 24);
		} else {
			toolTip.css('left', x + 24);
		}
		$(this._canvas_main.parentNode).append(toolTip);
	} else {
		$(this._wrapper).find('.countlineschart-tooltip').remove();
	}
}

CountLinesChart.prototype._mainMouseLeave = function(e) {
	this._linesOption.hoverIndex = -1;
	this.render();
	this.trigger('leaveLine', {index:-1});
	this._showToolTip(false);
}

CountLinesChart.prototype._mainCanvasMouseLeave = function() {

}

CountLinesChart.prototype._drawChart = function() {
	//计算Y轴坐标值, 先获得每个serie 的最大值, 再求最大值
	let countMaxes = this._linesOption.series.map(function(e){
		return Math.max.apply(null, e.data);
	});
	let countMax = Math.max.apply(null, countMaxes);
	let yLables = [];
	if(countMax > 0) {
		for(var i=0; i<=countMax; i++) {
			yLables.push(i);
		}
	}
	let hoverIndex = this._linesOption.hoverIndex;
	let series = this._linesOption.series;
	let xActiveIndexes = hoverIndex > -1 ? (series[hoverIndex].activeIndexes || []) : [];
	let yActiveIndexes = xActiveIndexes.map(function(index){
		return series[hoverIndex].data[index];
	});
	// this._xAxisOptions.activeIndexes = xActiveIndexes;
	// this._yAxisOptions.activeIndexes = yActiveIndexes;

	this._drawLinesInfo = drawCountLines(this._canvas_main, this._linesOption);
	drawAxis(this._canvas_x, this._linesOption.x, this._xAxisOptions);
	drawAxis(this._canvas_y, yLables, this._yAxisOptions);
}

CountLinesChart.prototype.render = function() {
	this._drawChart();
}

CountLinesChart.prototype.setData = function({dataLen, series, unit}) {
	series = series || [[]];
	unit = unit || 1;
	let len = dataLen || series[0].length;
	let x = [];
	let data = [];
	for(var i=0; i<len; i++) {
		x.push((i + 1) * unit);
	}
	this._linesOption.x = x;
	this._linesOption.series = series;
	this.render();
}

CountLinesChart.prototype.on = function(name, handle) {
	this._events[name] = handle;
}

CountLinesChart.prototype.trigger = function(name, param) {
	let handle = this._events[name];
	if(handle) {
		handle(param);
	}
}

CountLinesChart.prototype.highlightLine = function(index) {
	let show = index > -1;
	this._linesOption.hoverIndex = index;
	if(show) {
		var activeIndex = this._linesOption.series[index].activeIndexes[0];
		this._linesOption.activeIndex = activeIndex;
	}
	this._showToolTip(show);
	this.render();
}

CountLinesChart.prototype.customTooltip = function(handle) {
	this._toolTipCustom = handle;
}

CountLinesChart.prototype.dispose = function() {
	window.removeEventListener('resize', this._resizeHandle);
}

module.exports = CountLinesChart;