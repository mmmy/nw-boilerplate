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
	lineWidth: 1,
	strokeStyle: 'rgba(0,0,0,0.7)',
	fillStyle: 'rgba(0,0,0,0.2)'
};
let defaultHoverStyle = {
	lineWidth: 2,
	strokeStyle: 'rgba(0,0,0,1)',
	fillStyle: 'rgba(0,0,0,0.5)'
};
/**
  options: {
  	x:[]
		series: [{
			data:[],
			activeIndexes: [],
			strokeStyle:"",
			fillStyle:"",
			lineWidth:1,
		},{
			data:[]
		}],
		hoverIndex: number
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
			hoverIndex = options.hoverIndex,
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

	//draw data
	let xSpace = (xData.length === 1) ? viewWidth / 2 : viewWidth / (xData.length - 1);

	ctx.save();
	//paint
	ctx.clearRect(0,0,width,height);
	//如果space 为Infinity , 绘图将会出现bug
	if(!isFinite(xSpace)) {
		return;
	}
	let drawLine = function(data) {
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

	for(let i=0; i<series.length; i++) {
		//跳过hoverIndex
		if(i === hoverIndex) {
			continue;
		}
		let line = series[i];
		let data = line.data; //数据数组
		ctx.lineWidth = line.lineWidth || defaultDrawStyle.lineWidth;
		ctx.strokeStyle = line.strokeStyle || defaultDrawStyle.strokeStyle;
		ctx.fillStyle = line.fillStyle || defaultDrawStyle.fillStyle;
		ctx.lineJoin = 'round';
		drawLine(data);
	}
	//hoverIndex的画到最上层
	if(hoverIndex > -1) {
		let line = series[hoverIndex];
		let data = line.data;
		ctx.lineWidth = line.hover && line.hover.lineWidth || defaultHoverStyle.lineWidth;
		ctx.strokeStyle = line.hover && line.hover.strokeStyle || defaultHoverStyle.strokeStyle;
		ctx.fillStyle = line.hover && line.hover.fillStyle || defaultHoverStyle.fillStyle;
		drawLine(data);

		//绘制标线
		ctx.setLineDash([5,2]);
		ctx.lineWidth = 1;
		let activeIndexes = line.activeIndexes || [];
		activeIndexes.forEach(function(index){
			let x = _toInt(padding.left + index * xSpace),
					y = _dataToPointY(padding.top, viewHeight, yMin, yMax, data[index]);
			ctx.beginPath();  //horizon dash line
			ctx.moveTo(x, y);
			ctx.lineTo(padding.left, y);
			ctx.stroke();
			ctx.beginPath();   //vertical dash line
			ctx.moveTo(x, y);
			ctx.lineTo(x, height - padding.bottom);
			ctx.stroke();
			//绘制圆点
			let oldFillStyle = ctx.fillStyle;
			ctx.fillStyle = ctx.strokeStyle;
			ctx.beginPath();
			ctx.arc(x,y,3,0,2*Math.PI);
			ctx.fill();
			ctx.fillStyle = oldFillStyle;
		});
	}
	ctx.setLineDash([]);
	ctx.restore();
	//returns
	let indexAtPoint = function (x, y){
		try {
			x *= ratio;
			y *= ratio;
			//现根据x判断 所在x轴区间[xInt0, xInt0+1], 然后判断(x, y)是否在区间的直线上
			var xInt0 = Math.floor((x - padding.left) / xSpace);
			if(xInt0 >= 0) {
				for(var i=0,len=series.length; i<len; i++) {
					var data = series[i].data;
					var x0 = padding.left + xInt0 * xSpace;
					var x1 = x0 + xSpace;
					var y0 = _dataToPointY(padding.top, viewHeight, yMin, yMax, data[xInt0]);
					var y1 = _dataToPointY(padding.top, viewHeight, yMin, yMax, data[xInt0+1]);

					var k = (y1 - y0) / (x1 - x0),
							b = y0 - k * x0;
					var distance = Math.abs(k * x + b - y) / Math.pow((1 + k * k), 0.5);  //点到直线的距离
					//距离 相差3个像素, 那么认为(x, y)在这条直线上
					if(distance <= 4) {
						return i;
					}
				}
			}
		} catch(e) {
			console.error(e);
			return -1;
		}
		//
		return -1;
	};
	return {
		indexAtPoint
	}
};
/*
 绘制bar
------------------------------------------*/
let drawCountBars = (canvas, options) => {
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
			isHorizon = options.isHorizon || false,
			xData = options.x,
			yMin = options.yMin || 0,
			yMax = options.yMax,
			hoverIndex = options.hoverIndex,
			padding = options.padding || {left:0, top:0, right:0, bottom:0};
	
	if(yMax === undefined) {
		yMax = 0;
		series.forEach(function(bar){
			bar.data.forEach(function(e){
				let value = e.value;
				yMax = yMax > value ? yMax : value;
			});
		});
	}

	//canvas
	betterCanvasSize(canvas);
	let ratio = getCanvasPixRatio();
	let ctx = canvas.getContext('2d'),
			width = canvas.width,
			height = canvas.height,
			viewWidth = width - padding.left - padding.right,
			viewHeight = height - padding.top - padding.bottom;

	//draw data
	let xSpace = viewWidth / (xData.length);
	let barWidth = Math.round(xSpace * 0.5);

	ctx.save();
	//paint
	ctx.clearRect(0,0,width,height);
	//如果space 为Infinity , 绘图将会出现bug
	if(!isFinite(xSpace)) {
		return;
	}
	let drawBar = function(bars) {
		var data = bars.data;
		for(let j=0,len=data.length; j<len; j++) {
			let x = _toInt(padding.left + j * xSpace + xSpace / 2) - barWidth / 2,
					y = _to05(_dataToPointY(padding.top, viewHeight, yMin, yMax, data[j].value)),
					barHeight = height - y - padding.bottom;
			
			if(j === hoverIndex) {
				ctx.lineWidth = data[j].hover && data[j].hover.lineWidth || defaultHoverStyle.lineWidth;
				ctx.strokeStyle = data[j].hover && data[j].hover.strokeStyle || defaultHoverStyle.strokeStyle;
				ctx.fillStyle = data[j].hover && data[j].hover.fillStyle || defaultHoverStyle.fillStyle;
				var fontSize = barWidth > 20 ? 20 : barWidth * 0.7;
				fontSize = fontSize < 10 ? 10 : fontSize;
				ctx.font = `${fontSize}px Arial`;
				ctx.textAlign = 'center';
				ctx.fillText(data[j].value, x+barWidth/2, y - 8);
			} else {
				ctx.lineWidth = data[j].lineWidth || defaultDrawStyle.lineWidth;
				ctx.strokeStyle = data[j].strokeStyle || defaultDrawStyle.strokeStyle;
				ctx.fillStyle = data[j].fillStyle || defaultDrawStyle.fillStyle;
			}
			//draw bar
			ctx.fillRect(x, y, barWidth, barHeight);
			//
			ctx.beginPath();
			ctx.moveTo(x, y+barHeight);
			ctx.lineTo(x, y);
			ctx.lineTo(x+barWidth, y);
			ctx.lineTo(x+barWidth, y+barHeight);
			ctx.stroke();
		}
	}

	for(let i=0; i<series.length; i++) {
		let bars = series[i];
		drawBar(bars);
	}
	//hoverIndex的画到最上层
	/*
	if(hoverIndex > -1) {
		let line = series[hoverIndex];
		let data = line.data;
		ctx.lineWidth = line.hover && line.hover.lineWidth || defaultHoverStyle.lineWidth;
		ctx.strokeStyle = line.hover && line.hover.strokeStyle || defaultHoverStyle.strokeStyle;
		ctx.fillStyle = line.hover && line.hover.fillStyle || defaultHoverStyle.fillStyle;
		drawBar(data);

		//绘制标线
		ctx.setLineDash([5,2]);
		ctx.lineWidth = 1;
		let activeIndexes = line.activeIndexes || [];
		activeIndexes.forEach(function(index){
			let x = _toInt(padding.left + index * xSpace),
					y = _dataToPointY(padding.top, viewHeight, yMin, yMax, data[index]);
			ctx.beginPath();  //horizon dash line
			ctx.moveTo(x, y);
			ctx.lineTo(padding.left, y);
			ctx.stroke();
			ctx.beginPath();   //vertical dash line
			ctx.moveTo(x, y);
			ctx.lineTo(x, height - padding.bottom);
			ctx.stroke();
		});
	}
	*/
	ctx.setLineDash([]);
	ctx.restore();
	//returns
	let indexAtPoint = function (x, y){
		try {
			x *= ratio;
			y *= ratio;
			//计算x
			var index = Math.floor((x - padding.left) / xSpace),
					xAtIndex = padding.left + index * xSpace + xSpace / 2,
					isXInBar = Math.abs(x - xAtIndex) <= barWidth / 2;          //判断x是否在bar区间内
					console.log('x - xAtIndex', x - xAtIndex, isXInBar);
			if(isXInBar) {
				for(var i=0,len=options.series.length; i<len; i++) {
					var data = options.series[i].data;
					var	y0 = _to05(_dataToPointY(padding.top, viewHeight, yMin, yMax, data[index].value));
					var y1 = height - padding.bottom;;
					if(y>(y0-10) && y<y1) {
						return index;
					}
				}
			}
		} catch(e) {
			console.error(e);
			return -1;
		}
		//
		return -1;
	};
	return {
		indexAtPoint
	}
};
/*
绘制x,y轴
 ----------------------------------------------------------------*/
let drawAxis = (canvas, data, options) => {
	let len = data && data.length || 0;
	if(!len) {
		throw 'drawAxisX len is 0';
	}
	betterCanvasSize(canvas);
	let ratio = getCanvasPixRatio();
	//options
	let centerLabel = options && options.centerLabel || false;  //绘制bar的时候要 true
	let isVertical = options && options.isVertical || false;
	let activeIndexes = options && options.activeIndexes;
	let selectedIndex = options && options.selectedIndex;
	let minSpace = options && options.minSpace || 20;
	let textColor = options && options.textColor || '#888';
	let hoverColor = options && options.hoverColor || defaultHoverStyle.strokeStyle;
	let gridColor = options && options.gridColor || 'rgba(0,0,0,0.08)';
	let padding = {};
			padding.left = options.padding && options.padding.left * ratio;
			padding.top = options.padding && options.padding.top * ratio;
			padding.right = options.padding && options.padding.right * ratio;
			padding.bottom = options.padding && options.padding.bottom * ratio;
	
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;

	let space = 0;
	let labelWidth = 30;
	if(isVertical) {
		space = (height - padding.top - padding.bottom) / (centerLabel ? len : (len-1));
	} else {
		space = (width - padding.left - padding.right) / (centerLabel ? len : (len-1));
	}

	let minSpaceX = minSpace * ratio;  										//最少20px
	let interval = Math.ceil(minSpaceX / space);  //min is 1;

	//paint
	ctx.clearRect(0,0, width, height);
		//如果space 为Infinity , 绘图将会出现bug
	if(!isFinite(space)) {
		return;
	}
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=0; i<len; i+=interval) {
		ctx.strokeStyle = gridColor;
		ctx.fillStyle = textColor;
		if(isVertical) {
			let x = labelWidth / 2;
			let y = _dataToPointY(padding.top, height-padding.top-padding.bottom, data[0], data[data.length-1], data[i]);
			ctx.fillText(data[i], x, y+5*ratio);
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.moveTo(labelWidth, _to05(y));            //绘制horizon grid line
			ctx.lineTo(width-padding.right, _to05(y));
			ctx.stroke();
		} else {
			let x = padding.left + i*space + (centerLabel ? space/2 : 0);
			let y = height / 2;
			ctx.fillText(data[i], x, y);
		}
	}

	//selectedIndex
	/*
	if(selectedIndex >=0) {
		let rectW = 50;
		let center = padding.left + selectedIndex*space + space/2;
		center = _toInt(center);
		ctx.fillStyle = '#8d151b';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(selectedIndex+1+'', center, 15);
	}
	*/

	//activeIndexes
	if(activeIndexes.length > 0) {
		ctx.fillStyle = hoverColor;
		let rectW = 20 * ratio;
		for(var i=0,length=activeIndexes.length; i<length; i++) {
			let index = activeIndexes[i];
			if(isVertical) {
				let x = labelWidth / 2;
				let y = _dataToPointY(padding.top, height-padding.top-padding.bottom, data[0], data[data.length-1], data[index]);
				ctx.fillText(data[index], x, y+5*ratio);
			} else {
				let center = padding.left + index*space;
				center = _toInt(center);
				// ctx.fillStyle = '#222';
				// ctx.fillRect(center - rectW/2, 0, rectW, height);
				ctx.fillText(index+'', center, 15*ratio);
			}
		}
	}

};

module.exports = {
	drawCountLines,
	drawCountBars,
	drawAxis
}