//曲线图
//for 详情页统计曲线图
import { betterCanvasSize, getCanvasPixRatio, roundRect } from '../canvasHelper';

let _to05 = (number) => {
	return Math.floor(number) + 0.5;
};
let _toInt = (number) => {
	return Math.floor(number);
};
let _dataToPointY = (paddingTop, viewYHeight, yMin, yMax, number) => {
	let rate = viewYHeight / (yMin - yMax);
	let y = (number - yMax) * rate + paddingTop;
	return _toInt(y);
};

//default options
let defaultDrawStyle = {
	lineWidth: 2,
	strokeStyle: 'rgba(0,0,0,0.7)',
	fillStyle: 'rgba(0,0,0,0.2)'
};
/**
  options: {
  	x:[]
		series: [{
			data:[],
			strokeStyle:"",
			fillStyle:"",
			lineWidth:1,
		},{
			data:[]
		}]
  }
 */

let drawCountLines = (canvas, options) => {
	//判断canvas
	if(!canvas || !canvas.getContext) {
		console.warn('drawBlockHeadMap, canvas is not canvas !');
		return;
	}
	if(!options || !options.series) {
		console.warn('options.series is required!!');
		return;
	}
	//raw data & options
	let	series = options.series,
			xData = options.x,
			yMin = options.yMin || 0,
			yMax = options.yMax,
			padding = options.padding || {left:0, top:0, right:0, bottom:0};
	
	if(yMax === undefined) {
		let maxArr = series.map(function(e){
			return Math.max.apply(null, e.data);
		});
		yMax = Math.max.apply(null, maxArr);
	}

	//canvas
	betterCanvasSize(canvas);
	let ratio = getCanvasPixRatio();
	let ctx = canvas.getContext('2d'),
			width = canvas.width,
			height = canvas.height,
			viewWidth = width - padding.left - padding.right,
			viewHeight = height - padding.top - padding.bottom;
	window.ctx = ctx;

	//draw data
	let xSpace = viewWidth / (xData.length - 1);

	ctx.save();
	//paint
	ctx.clearRect(0,0,width,height);
	for(let i=0; i<series.length; i++) {
		let line = series[i];
		let data = line.data; //数据数组
		ctx.lineWidth = line.lineWidth || defaultDrawStyle.lineWidth;
		ctx.strokeStyle = line.strokeStyle || defaultDrawStyle.strokeStyle;
		ctx.fillStyle = line.fillStyle || defaultDrawStyle.fillStyle;
		ctx.lineJoin = 'round';
		for(let j=0,len=data.length; j<len; j++) {
			let x = _toInt(padding.left + j * xSpace),
					y = _dataToPointY(padding.top, viewHeight, yMin, yMax, data[j]);
			//draw line
			if(j===0) {   					//start
				ctx.beginPath();
				ctx.moveTo(x,y);
			} else if(j===len-1) {  //end
				ctx.lineTo(x,y);
				ctx.stroke();        //绘制曲线
				ctx.lineTo(x, height-padding.bottom);
				ctx.lineTo(padding.left, height-padding.bottom);
				ctx.closePath();
				ctx.fill();           //填充区域
			} else { 								//line
				ctx.lineTo(x,y);
			}
		}
	}
	ctx.restore();

};

let drawAxis = (canvas, data, options) => {
	let len = data && data.length || 0;
	if(!len) {
		throw 'drawAxisX len is 0';
	}
	betterCanvasSize(canvas);
	let ratio = getCanvasPixRatio();
	//options
	let isVertical = options && options.isVertical || false;
	let hoverIndex = options && options.hoverIndex;
	let selectedIndex = options && options.selectedIndex;
	let padding = {};
			padding.left = options.padding && options.padding.left * ratio;
			padding.top = options.padding && options.padding.top * ratio;
			padding.right = options.padding && options.padding.right * ratio;
			padding.bottom = options.padding && options.padding.bottom * ratio;
	
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;

	let space = 0;
	if(isVertical) {
		space = (height - padding.top - padding.bottom) / (len-1);
	} else {
		space = (width - padding.left - padding.right) / (len-1);
	}

	let minSpaceX = 20*ratio;  										//最少20px
	let interval = Math.ceil(minSpaceX / space);  //min is 1;

	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=0; i<len; i+=interval) {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		if(isVertical) {
			let x = width / 2;
			let y = _dataToPointY(padding.top, height-padding.top-padding.bottom, data[0], data[data.length-1], data[i]);
			ctx.fillText(data[i], x, y+5*ratio);
		} else {
			let x = padding.left + i*space;
			let y = height / 2;
			ctx.fillText(data[i], x, y);
		}
	}

	//selectedIndex
	if(selectedIndex >=0) {
		let rectW = 50;
		let center = padding.left + selectedIndex*space + space/2;
		center = _toInt(center);
		ctx.fillStyle = '#8d151b';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(selectedIndex+1+'', center, 15);
	}

	//hoverIndex
	if(hoverIndex>=0) {
		let rectW = 50 * ratio;
		let center = padding.left + hoverIndex*space + space/2;
		center = _toInt(center);
		ctx.fillStyle = '#222';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(hoverIndex+1+'', center, 15*ratio);
	}

};

module.exports = {
	drawCountLines,
	drawAxis
}