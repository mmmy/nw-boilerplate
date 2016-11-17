//统计曲线图表class
import countLinesPainter from './painters/countLinesPainter';
let {drawCountLines, drawAxis} = countLinesPainter;

let canvasSizeHelper = function(canvas) {
	let $canvas = $(canvas);
	let height = $canvas.parent().height(),
			width = $canvas.parent().width();
	$canvas.attr({height, width}).css({height, width});
};

function CountLinesChart(container, config) {
	if(!container) {
		console.error('not a container dom!');
		return;
	}
	this._yAxisW = 30;
	this._xAxisH = 30;

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

	this._constructor = "CountLinesChart";
	this._init();
}

CountLinesChart.prototype._resize = function() {
	this._updateCanvasSize();
	this.render();
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
	this._canvas_main.addEventListener('mouseleave', this._mainMouseLeave.bind(this));
}

CountLinesChart.prototype._mainMouseMove = function(e) {
	let x = e.offsetX,
			y= e.offsetY;
	if(this._drawLinesInfo) {
		let { indexAtPoint } = this._drawLinesInfo;
		let hoverIndex = indexAtPoint(x, y);
		if(this._linesOption.hoverIndex !== hoverIndex) {
			//高亮 鼠标所在位置的曲线
			this._linesOption.hoverIndex = hoverIndex;
			this.render();
		}
	}
}

CountLinesChart.prototype._mainMouseLeave = function(e) {
	this._linesOption.hoverIndex = -1;
	this.render();
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
	this._xAxisOptions.activeIndexes = xActiveIndexes;
	this._yAxisOptions.activeIndexes = yActiveIndexes;

	this._drawLinesInfo = drawCountLines(this._canvas_main, this._linesOption);
	drawAxis(this._canvas_x, this._linesOption.x, this._xAxisOptions);
	drawAxis(this._canvas_y, yLables, this._yAxisOptions);
}

CountLinesChart.prototype.render = function() {
	this._drawChart();
}

CountLinesChart.prototype.setData = function({dataLen, series}) {
	series = series || [[]];
	let len = dataLen || series[0].length;
	let x = [];
	let data = [];
	for(var i=0; i<len; i++) {
		x.push(i);
	}
	this._linesOption.x = x;
	this._linesOption.series = series;
	this.render();
}

CountLinesChart.prototype.dispose = function() {
	window.removeEventListener('resize', this._resizeHandle);
}

module.exports = CountLinesChart;