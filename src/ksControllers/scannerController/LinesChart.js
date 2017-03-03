import moment from 'moment';
import painter from '../painter';
import countLinesPainter from '../painters/countLinesPainter';

let {drawAxisY, drawAxisTime} = painter;
let {drawLines} = countLinesPainter;

function LinesChart(container, config) {
	if(!container) {
		console.error('not a container dom!');
		return;
	}

	config = $.extend({

	},config);
	this._config = config;

	let $wrapper = $(`<div class="countlines-chart-wrapper return"></div>`)
								.append(`<div class="main-wrapper"><canvas class='main-canvas'/></div>`)
								.append(`<div class="y-axis-wrapper"><canvas /></div>`)
								.append(`<div class="x-axis-wrapper"><canvas /></div>`);

	$(container).append($wrapper);

	let canvases = $wrapper.find('canvas');

	this._wrapper = $wrapper[0];
	this._isLight = $ && $.keyStone && ($.keyStone.theme == 'light');
	this._canvas = canvases[0];
	this._canvas_axis_y = canvases[1];
	this._canvas_axis_x = canvases[2];
	this._drawInfo = {}; //记录绘制后的参数
	this._yAxisW = 50;
	this._xAxisH = 24;

	this._hoverIndex = -1;
	this._hoverY = -1;

	this._timeArray = [];

	this._linesOption = {
		padding: {
			left: 0,
			top: 20,
			right: 40,
			bottom: 0,
		},
		series: [{
			data:[4,2,1,6,3,7,2,4],
			activeIndexes: [3],
			strokeStyle: 'rgb(170,65,66)',
			fillStyle: 'rgba(200,60,10,0)',
			lineWidth: 2,
		},{
			data:[3,-2,2,3,4,5,6,7],
			activeIndexes: [7],
			strokeStyle: '#eee',
			fillStyle: 'rgba(10,200,70,0)',
			lineWidth: 2,
		}],
		timeArray: ['2016/1/1','2016/1/2','2016/1/3','2016/1/4','2016/1/5','2016/1/6','2016/1/7','2016/1/8'],
		hoverIndex: -1,
	};

	this._yDrawOption = {
		hoverY: -1,
		textColor: this._isLight ? '' : '#999',
		hoverColor: this._isLight ? '' : '#222',
		hoverBackground: this._isLight ? '' : '#aaa',
		padding:{left:0,top:20,right:20,bottom:this._xAxisH},
		labelWidth: 40,
		labelFormatter: function(label) { return (+label).toFixed(1) + '%'; },
	};

	this._xDrawOption = {
		drawLen: null,
		hoverIndex: -1,
		showTime: false, //是否精确显示到 时分秒
		textColor: this._isLight ? '' : '#999',
		hoverColor: this._isLight ? '' : '#222',
		hoverBackground: this._isLight ? '' : '#aaa',
		padding: {left:this._yAxisW,top:0,right:40,bottom:0},
		noGap: true,
	};

	this._init();
}

LinesChart.prototype._init = function() {
	this._canvas.addEventListener('mousemove',this._mouseMove.bind(this));
}

LinesChart.prototype._mouseMove = function(e) {
	let x = e.offsetX,
			y = e.offsetY;
	this.updateHover(x,y);
}

LinesChart.prototype.updateHover = function(x,y) {
	let {pointToIndex} = this._drawInfo;
	if(!pointToIndex) return;
	let curIndex = pointToIndex(x, false);
	this._hoverIndex = curIndex;
	this._hoverY = y;
	this._updateOptions();
	this.render();
}

LinesChart.prototype.render = function() {
	this._drawInfo = drawLines(this._canvas, this._linesOption);
	drawAxisY(this._canvas_axis_y,[this._drawInfo.yMin, this._drawInfo.yMax], this._yDrawOption);
	drawAxisTime(this._canvas_axis_x, this._timeArray, this._xDrawOption);
}

LinesChart.prototype._updateOptions = function() {
	this._linesOption.hoverIndex = this._hoverIndex;
	this._linesOption.hoverY = this._hoverY;
	this._yDrawOption.hoverY = this._hoverY;
	this._xDrawOption.hoverIndex = this._hoverIndex;
}

LinesChart.prototype._updateTimeArray = function() {
	this._timeArray = this._linesOption.timeArray.map(function(time){
		let momentTime = typeof time == 'number' ? moment.unix(time) : moment(time);
		return momentTime.format('YYYY/MM/DD');
	});
}

LinesChart.prototype.setData = function(series, options) {

}

LinesChart.prototype.test = function() {
	this._updateTimeArray();
	this.render();
}


module.exports = LinesChart;
