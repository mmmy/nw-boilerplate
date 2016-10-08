import { betterCanvasSize, getCanvasPixRatio, roundRect } from './canvasHelper';

let _to05 = (number) => {
	return Math.floor(number) + 0.5;
};

let _toInt = (number) => {
	return Math.round(number);
};

let _dataToPointY = (marginTop, viewYHeight, yMin, yMax, O, C, L, H) => {
	let rate = viewYHeight / (yMin - yMax);
	let oY = (O - yMax) * rate + marginTop,
			cY = (C - yMax) * rate + marginTop,
			lY = (L - yMax) * rate + marginTop,
			hY = (H - yMax) * rate + marginTop;
	return {open:_to05(oY), close:_to05(cY), low:_to05(lY), high:_to05(hY)};
};

//options: {hoverIndex: , selectedIndex: , activeIndex: , mouse:{x}, yMin: number | '200%', yMax: ,selectedRange:[], predictionBars:, baseBarRange:[], symbolName:, symbolDescribe:, overflowPane:上界限渐变, overfowPaneBottom:}
let drawKline = (dom, kline, options) => { //kline: [date, O, C, L, H] or [O, C, L,H]
	let ctx = null;
	let d1 = new Date();
	if(dom.getContext) {
		ctx = dom.getContext('2d');
	} else {
		console.error('not canvas !!');
		return;
	}
	
	betterCanvasSize(dom);

	let width = dom.width;
	let height = dom.height - 1;

	let min = Infinity,
			max = -Infinity;
	for(let i=0; i<kline.length; i++) {
		let low = kline[i][3];
		let high = kline[i][4];
		min = min < low ? min : low;
		max = max > high ? max : high;
	}

	let diff = max - min;

	if(options && options.yMin) {
		if (typeof options.yMin == 'number') {
			min = options.yMin;
		} else if(typeof options.yMin == 'string') {
			min -= (parseInt(options.yMin)/100 - 1) * diff;   //相对于diff 便宜
		}
	}
	if(options && options.yMax) {
		if (typeof options.yMax == 'number') {
			max = options.yMax;
		} else if(typeof options.yMax == 'string') {
			max += (parseInt(options.yMax)/100 - 1) * diff;
		}
	}
	let predictionBars = options && options.predictionBars || 0;

	let len = kline.length;

	let margin = options && options.margin;
	let top = margin && margin.top || 0,
			left = margin && margin.left || 0,
			right = margin && margin.right || 0,
			bottom = margin && margin.bottom || 0;

	let viewYheight = height - top -bottom;
	let klineXSpace = (width - left - right) / (len + predictionBars);
	let klineW = 3;
	
	klineW = Math.round(klineXSpace/2) * 1.2;
	klineW += (klineW % 2 == 0) ? 1 : 0;
	if(klineW > 10) {
		// klineW += 4;
	} else if(klineW > 6) {
		// klineW += 2;
	}
	/*
	if(klineXSpace > 6) {
		klineW = 5;
	} else if(klineXSpace > 3) {
		klineW = 3;
	} else {
		klineW = 1;
	}
	*/


	let klineWhisker = [];
	let klineBox = [];
	let isUpCandle = []
	for(var i=0; i<len; i++) {
		let x = left + (i+1) * klineXSpace - klineXSpace/2;
		x = _to05(x);
		let prices = kline[i];
		isUpCandle.push(prices[2] > prices[1]);
		let ys = _dataToPointY(top, viewYheight, min, max, prices[1], prices[2], prices[3], prices[4]);

		// console.assert(ys.open < (height - top));
		// console.assert(ys.close < (height - top));
		// console.assert(ys.low < (height - top));
		// console.assert(ys.high < (height - top));
		// console.log(ys);
		let whisker = isUpCandle[i] ? [[[x, ys.high],[x, ys.close]], [[x, ys.open],[x, ys.low]]] : [[[x, ys.high], [x, ys.open]], [[x, ys.close], [x, ys.low]]];
		klineWhisker.push(whisker);

		let boxStartPoint = [x - Math.floor(klineW/2), whisker[0][1][1]],
				boxEndPoint = [x + Math.floor(klineW/2), whisker[1][0][1]];
		klineBox.push([boxStartPoint, boxEndPoint]);
	}

	//options
	let mouse = options && options.mouse;
	let activeIndex = options && options.activeIndex;
	let selectedIndex = options && options.selectedIndex;
	let hoverIndex = options && options.hoverIndex;
	let selectedRange = options && options.selectedRange;
	let baseBarRange = options && options.baseBarRange;
	let hoverY = options && options.hoverY;
	let symbolName = options && options.symbolName;
	let symbolDescribe = options && options.symbolDescribe;
	let overflowPane = options && options.overflowPane;
	let overflowPaneBottom = options && options.overflowPaneBottom;
	let ratio = getCanvasPixRatio();

	//start draw
	let upBorderColor = options && options.upBorderColor || '#888888',//'#8B171B',//'#ae0006',
			upColor = options && options.upColor || '#eee',//'#AC1822',
		 	downBorderColor = options && options.downBorderColor || '#444',//'#050505',
		 	downColor = options && options.downColor || '#555';//'rgba(0,0,0,0)';

	let backgroundColor = options && options.backgroundColor || '#fff';

	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);
	if(!kline || kline.length == 0) {
		return  {};
	}
	let d2 = new Date();
	for (let i=0; i<len; i++) {
		let rectPoints = klineBox[i];
		let whisker1 = klineWhisker[i][0],
				whisker2 = klineWhisker[i][1];
		// console.debug(rectPoints);
		ctx.strokeStyle = isUpCandle[i] ? upBorderColor : downBorderColor;
		ctx.fillStyle = isUpCandle[i] ? upColor : downColor;
		ctx.lineWidth = 1;
		if(mouse && mouse.x && (Math.abs(mouse.x - whisker1[0][0]) < klineW) || i===activeIndex || i===selectedIndex) {
			// ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.setLineDash([2, 6]);
			ctx.moveTo(whisker1[0][0], top);
			ctx.lineTo(whisker1[0][0], height-bottom);
			ctx.stroke();
		}
		ctx.fillRect(rectPoints[0][0], rectPoints[0][1], rectPoints[1][0]-rectPoints[0][0], rectPoints[1][1]-rectPoints[0][1]);
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.strokeRect(rectPoints[0][0], rectPoints[0][1], rectPoints[1][0]-rectPoints[0][0], rectPoints[1][1]-rectPoints[0][1]);
		// ctx.moveTo(rectPoints[0][0], rectPoints[0][1]);
		// ctx.lineTo(rectPoints[1][0], rectPoints[0][1]);
		// ctx.lineTo(rectPoints[1][0], rectPoints[1][1]);
		// ctx.lineTo(rectPoints[0][0], rectPoints[1][1]);
		// ctx.lineTo(rectPoints[0][0], rectPoints[0][1]);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(whisker1[0][0], whisker1[0][1]);
		ctx.lineTo(whisker1[1][0], whisker1[1][1]);
		ctx.stroke();		
		ctx.moveTo(whisker2[0][0], whisker2[0][1]);
		ctx.lineTo(whisker2[1][0], whisker2[1][1]);
		ctx.stroke();
	}
	//overflowPane , after baseBarRange
	if(overflowPaneBottom) {
		let rangeX1 = 0,
				rangeX2 = width;
		// if(baseBarRange){
		// 	rangeX1 = klineWhisker[baseBarRange[1]][0][0][0];
		// }
		let angle = Math.PI/36;
		let x0 = rangeX1/2 + rangeX2/2,
				y0 = height + (rangeX2 - rangeX1) / 2 / Math.tan(angle),
				r0 = y0 - height,
				r1 = (rangeX2 - rangeX1) / 2 / Math.sin(angle);

		let overflowTopGradient = ctx.createRadialGradient(x0, y0, r0, x0, y0, r1+2);

		overflowTopGradient.addColorStop(0, 'rgba(0,0,0,0.05)');
		overflowTopGradient.addColorStop(Math.sin(angle), 'rgba(0,0,0,0.05)');
		overflowTopGradient.addColorStop(1, 'rgba(0,0,0,0)');
		
		ctx.save();
		ctx.fillStyle = overflowTopGradient;
		ctx.fillRect(rangeX1,0,rangeX2-rangeX1,height);
		ctx.restore();
	}
	//overflowPaneBottom , after baseBarRange
	if(overflowPane) {
		let rangeX1 = 0,
				rangeX2 = width;
		if(baseBarRange){
			rangeX1 = klineWhisker[baseBarRange[1]][0][0][0];
		}
		let angle = Math.PI/72;
		let x0 = rangeX1,
				y0 = - (rangeX2 - rangeX1) / Math.tan(angle),
				r0 = -y0,
				r1 = (rangeX2 - rangeX1) / Math.sin(angle);

		let overflowTopGradient = ctx.createRadialGradient(x0, y0, r0, x0, y0, r1+2);

		overflowTopGradient.addColorStop(0, 'rgba(0,0,0,0.05)');
		overflowTopGradient.addColorStop(Math.sin(angle), 'rgba(0,0,0,0.05)');
		overflowTopGradient.addColorStop(1, 'rgba(0,0,0,0)');
		
		ctx.save();
		ctx.fillStyle = overflowTopGradient;
		ctx.fillRect(rangeX1,0,rangeX2-rangeX1,height);
		ctx.restore();
	}

	//hoverLine
	if(hoverIndex > -1) {
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.setLineDash([2, 2]);
		ctx.lineDashOffset = 1;
		ctx.strokeStyle = '#aaa';
		ctx.moveTo(klineWhisker[hoverIndex][0][0][0], top);
		ctx.lineTo(klineWhisker[hoverIndex][0][0][0], viewYheight + top);
		ctx.stroke();
	}
	//hoverY
	if(hoverY >= 0) {
		// let ratio = getCanvasPixRatio();
		hoverY *= ratio;
		hoverY = _to05(hoverY);
		ctx.beginPath();
		ctx.setLineDash([2, 2]);
		ctx.lineDashOffset = 1;
		ctx.strokeStyle = '#aaa';
		ctx.moveTo(left, hoverY);
		ctx.lineTo(width - right, hoverY);
		ctx.stroke();
	}
	//drawRangeRect
	if(selectedRange && selectedRange[0] >= 0 && selectedRange[1] >=0) {
		let rangeOption = options && options.rangeOption || {};

		let rangeX1 = klineWhisker[selectedRange[0]][0][0][0];
		let rangeX2 = klineWhisker[selectedRange[1]][0][0][0];
		ctx.save();
		ctx.shadowBlur = 0;
		ctx.shadowColor = 'rgba(0,0,0,1)';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.fillStyle = 'rgba(200,200,200,0.1)';
		ctx.fillRect(rangeX1, 20.5, rangeX2 - rangeX1, height);
		ctx.restore();
		ctx.fillStyle = '#333';
		ctx.fillRect(rangeX1, 0, rangeX2 - rangeX1, 20.5);
		//text
		ctx.beginPath();
		let text = selectedRange[1] - selectedRange[0] + 1 + '根K线';
		ctx.font = `bold ${12*ratio}px Microsoft Yahei`;
		ctx.textAlign = 'center';
		// ctx.lineWidth = 1;
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#fff';
		ctx.fillText(text, (rangeX2 + rangeX1)/2, 15);
		ctx.stroke();
		// ctx.strokeText(text, (rangeX2 + rangeX1)/2, 13);
		//close btn
		if(!rangeOption.noCloseBtn) {
			ctx.fillStyle = '#444';
			ctx.fillRect(rangeX2 - 20, 0, 20, 20);
			ctx.setLineDash([]);
			ctx.lineWidth = 2;
			let crossXCenter = rangeX2 - 10;
			let crossYCenter = 10;
			ctx.moveTo(crossXCenter - 3, crossYCenter - 3);
			ctx.lineTo(crossXCenter + 3, crossYCenter + 3);
			ctx.stroke();		
			ctx.moveTo(crossXCenter - 3, crossYCenter + 3);
			ctx.lineTo(crossXCenter + 3, crossYCenter - 3);
			ctx.stroke();
		}

		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(200,200,200,0.2)';
		ctx.moveTo(rangeX1, 20);
		ctx.lineTo(rangeX1, height);
		ctx.stroke();
		ctx.moveTo(rangeX2, 20);
		ctx.lineTo(rangeX2, height);
		ctx.stroke();
	}
	//baseBarRange
	if(baseBarRange && baseBarRange[0] >=0 && baseBarRange[1] >= 0) {
		let rangeX1 = klineWhisker[baseBarRange[0]][0][0][0];
		let rangeX2 = klineWhisker[baseBarRange[1]][0][0][0];
		let headerHeight = 3;
		ctx.save();
		let manGradient = ctx.createLinearGradient(0, headerHeight, 0, height);
		manGradient.addColorStop(0, 'rgba(200,200,200,0.15)');
		manGradient.addColorStop(1, 'rgba(200,200,200,0)');
		ctx.fillStyle = manGradient;//'rgba(200,200,200,0.15)';
		ctx.fillRect(rangeX1, headerHeight, rangeX2 - rangeX1, height);

		ctx.fillStyle = $.keyStone.configDefault.brownRed || '#B70017';
		// ctx.fillRect(rangeX1, 0, rangeX2 - rangeX1, headerHeight);
		roundRect(ctx, rangeX1, 0, rangeX2 - rangeX1, headerHeight, {tl:3,tr:3}, true);
		//text
		ctx.textAlign = 'center';
		let textSymbol = symbolName || '';
		ctx.beginPath();
		ctx.fillStyle = '#333';
		ctx.strokeStyle = '#333';
		ctx.font = `${10*ratio}px Microsoft Yahei`;
		ctx.fillText(textSymbol, (rangeX1 + rangeX2)/2, 30*ratio);
		ctx.stroke();

		let textDescribe = symbolDescribe || '';
		ctx.font = `${12*ratio}px Microsoft Yahei`;
		ctx.beginPath();
		ctx.fillStyle = '#666';
		ctx.strokeStyle = '#666';
		ctx.fillText(textDescribe, (rangeX1 + rangeX2)/2, 50*ratio);
		ctx.stroke();

		//left right line
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(200,200,200,0)';
		ctx.moveTo(rangeX1, headerHeight);
		ctx.lineTo(rangeX1, height);
		ctx.stroke();
		ctx.moveTo(rangeX2, headerHeight);
		ctx.lineTo(rangeX2, height);
		ctx.stroke();
	}
	// if(mouse) {
	// 	ctx.strokeStyle = '#aaa';
	// 	ctx.moveTo(Math.floor(mouse.x) + 0.5, 10);
	// 	ctx.lineTo(Math.floor(mouse.x) + 0.5, 200);
	// 	ctx.stroke();
	// }
	// console.debug('time used', new Date() - d2, new Date() - d1);
	let pointToIndex = (x, y) => {
		// let ratio = getCanvasPixRatio();
		x *= ratio;
		y = typeof y == 'number' ? y * ratio : false;
		let index = Math.floor((x - left) / klineXSpace); //先得到x 的index
		if(klineWhisker[index] == undefined) {
			return -1;
		}
		let indexYMin = klineWhisker[index][0][0][1];         //high 的y坐标
		let indexYMax = klineWhisker[index][1][1][1];         //low 的y坐标
		if(typeof y!='number' || (y > indexYMin - 10) && (y < indexYMax + 10)) {  //在10px 误差范围内, 或者 y == false
			return index;
		}
		return -1;
	};
	let indexToPoint = (index) => {
		let x = (index>-1) && klineWhisker[index][0][0][0]/ratio;
		let y = (index>-1) && klineWhisker[index][1][0][1]/ratio; //box bottom y
		return {x, y};
	};

	return {
		width,
		height,
		klineXSpace,
		pricePerPix: (max-min)/viewYheight,
		pointToIndex,
		indexToPoint,
		dataLen: kline.length,
		yMin: min,
		yMax: max
	};
};

let _priceIntervals = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
let _getPriceInterval = (priceMin, priceMax, viewHeight) => {
	let spaceMin = 40;

	let minInterval = (priceMax - priceMin) / (viewHeight / spaceMin);

	let len = _priceIntervals.length;
	if(minInterval < _priceIntervals[0]) {
		return _priceIntervals[0];
	}
	for(let i=1; i<len; i++) {
		if(_priceIntervals[i-1] <= minInterval && _priceIntervals[i] >= minInterval) {
			return _priceIntervals[i-1];
		}
	}
	return _priceIntervals[len-1];
};

let drawAxisY = (canvas, priceRange, options) => {
	betterCanvasSize(canvas);
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;
	let priceMin = priceRange[0],
			priceMax = priceRange[1];

	let ratio = getCanvasPixRatio();

	let rate = height / (priceMin - priceMax);

	let priceInterval = _getPriceInterval(priceMin, priceMax, height/ratio);

	let priceShow = Math.floor(priceMin/10) * 10,
			priceShowMax = Math.ceil(priceMax);
	
	//options
	let hoverY = options && options.hoverY;

	//paint
	ctx.clearRect(0,0, width, height);
	ctx.fillStyle = '#000';//'rgba(0, 0, 0, 0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = '#000';
	ctx.textAlign = 'center';
	ctx.font = `${10*ratio}px Arial`;
	
	while(priceShow < priceShowMax) {
		let centerY = (priceShow - priceMax) * rate + 0;
		ctx.fillText(priceShow.toFixed(2), width/2, centerY);
		priceShow = priceShow + priceInterval;
	}

	if(hoverY >=0) {
		// let ratio = getCanvasPixRatio();
		hoverY *= ratio;
		let rectH = 20 * ratio;
		ctx.fillStyle = '#222';
		let priceAtHover = hoverY /rate + priceMax;
		ctx.fillRect(0, hoverY - rectH / 2, width, rectH);
		ctx.fillStyle = '#fff';
		ctx.fillText(priceAtHover.toFixed(2), width/2, hoverY+5);
	}
};

let drawAxisX = (canvas, len, options) => {
	len = parseInt(len) || 0;
	if(!len) {
		throw 'drawAxisX len is 0';
	}
	betterCanvasSize(canvas);
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;

	let spaceX = width / len;
	let ratio = getCanvasPixRatio();
	//options
	let hoverIndex = options && options.hoverIndex;
	let selectedIndex = options && options.selectedIndex;

	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=0; i<len; i++) {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		let center = i*spaceX + spaceX/2;
		ctx.fillText(i+1+'', center, 15);
	}

	//selectedIndex
	if(selectedIndex >=0) {
		let rectW = 50;
		let center = selectedIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#BD3035';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(selectedIndex+1+'', center, 15);
	}

	//hoverIndex
	if(hoverIndex>=0) {
		let rectW = 50 * ratio;
		let center = hoverIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#222';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(hoverIndex+1+'', center, 15*ratio);
	}

};

let drawAxisTime = (canvas, timeArr, options) => { //timeArr:['2012-01-21 09:21:33']
	let len = timeArr.length || 0;
	if(!len) {
		throw 'drawAxisX len is 0';
	}
	betterCanvasSize(canvas);
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;

	let spaceX = width / len;
	let interval = 1;
	let minSpaceX = 0;
	let ratio = getCanvasPixRatio();

	//options
	let hoverIndex = options && options.hoverIndex;
	let selectedIndex = options && options.selectedIndex;
	let showTime = options && options.showTime || false; //是否显示时分秒
	if(showTime) {
		minSpaceX = 55 * ratio;
 		interval = Math.ceil(minSpaceX / spaceX);
	} else {
 		minSpaceX = 20 * ratio;
 		interval = Math.ceil(minSpaceX / spaceX);
	}
	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=interval-1; i<len; i+=interval) {
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		let center = i*spaceX + spaceX/2;
		let timeText = timeArr[i];
		let text = showTime ? timeText.slice(-8) : timeText.slice(8, 10);
		ctx.fillText(text, center, 15*ratio);
	}

	//selectedIndex
	if(selectedIndex >=0) {
		let rectW = showTime ? 120 : 60;
		rectW *= ratio;
		let center = selectedIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#BD3035';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(selectedIndex+1+'', center, 15*ratio);
	}

	//hoverIndex
	if(hoverIndex>=0) {
		let rectW = showTime ? 120 : 70;
		rectW *= ratio;
		let timeText = timeArr[hoverIndex];
		let text = showTime ? timeText : timeText.slice(0, 10);
		let center = hoverIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#222';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(text, center, 15*ratio);
	}

};


module.exports = {
	drawKline,
	drawAxisY,
	drawAxisX,
	drawAxisTime,
};
