import { betterCanvasSize, getCanvasPixRatio, roundRect } from './canvasHelper';

let _to05 = (number) => {
	return Math.floor(number) + 0.5;
};

let _toInt = (number) => {
	return Math.round(number);
};

let _dataToPointY = (marginTop, viewYHeight, yMin, yMax, O, C, L, H, V, volumeMax, volumeMaxHeight, klineGapBottom, centerKline) => {
	volumeMaxHeight = volumeMaxHeight || 0;
	klineGapBottom = klineGapBottom || 0;
	let rate = (viewYHeight - klineGapBottom - (centerKline ? 0 : volumeMaxHeight)) / (yMin - yMax);
	let oY = (O - yMax) * rate + marginTop,
			cY = (C - yMax) * rate + marginTop,
			lY = (L - yMax) * rate + marginTop,
			hY = (H - yMax) * rate + marginTop;
	let vY = marginTop + viewYHeight - V / volumeMax * volumeMaxHeight;
	if(oY == cY) { //至少绘制一个像素的高度
		cY += 1;
	}
	return {open:_to05(oY), close:_to05(cY), low:_to05(lY), high:_to05(hY), volume:_to05(vY)};
};

var paddingDefault = {top:0,right:0,bottom:0,left:0};
/**
options: {
	padding: {left: number, right: number},
	drawLen: ,
	hoverIndex: , 
	selectedIndex: , 
	activeIndex: , 
	mouse:{x}, 
	yMin: number | '200%', 
	yMax: ,
	selectedRange:[], 
	predictionBars:, 
	baseBarRange:[], 
	symbolName:, 
	symbolNameColor:, 
	symbolDescribe:, 
	symbolDescribeColor:, 
	overflowPane:上界限渐变, 
	overfowPaneBottom:
	volume: false,
	volumeHeight: 0.2,
	klineGapBottom: 0,
	centerKline:false, //当绘制交易量的时候有时需要将K线绘制到中心
}
**/
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
	let ratio = getCanvasPixRatio();

	let volume = options && options.volume || false;
	let centerKline = options && options.centerKline || false;
	//绘制volume的高度比例, 那么K线的高度为0.8;
	let volumeHeight = options && options.volumeHeight || 0.2;
	//绘制K线底部与volume的间隔, 以防靠的太近
	let klineGapBottom = options && options.klineGapBottom || 0;
	//辅助计算值
	let volumeMaxHeight = 0;
	if(volume) {
		volumeMaxHeight = Math.round(height * volumeHeight);
	}

	let min = Infinity,
			max = -Infinity;
	let volumeMax = 0; //记录volume的最高值
	for(let i=0; i<kline.length; i++) {
		let low = kline[i][3];
		let high = kline[i][4];
		min = min < low ? min : low;
		max = max > high ? max : high;
		volumeMax = Math.max(volumeMax, kline[i][5]);
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
	//预测未来多少天
	let predictionBars = options && options.predictionBars || 0;

	let len = kline.length,
			drawLen = options && options.drawLen || len;

	let padding = options && options.padding;
	let top = padding && padding.top * ratio || 0,
			left = padding && padding.left * ratio || 0,
			right = padding && padding.right * ratio || 0,
			bottom = padding && padding.bottom * ratio || 0;

	let viewYheight = height - top -bottom;
	let klineXSpace = (width - left - right) / (drawLen + predictionBars);
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
	let isUpCandle = [];
	let volumeTops = [];
	for(var i=0; i<len; i++) {
		let x = left + (i+1) * klineXSpace - klineXSpace/2;
		x = _to05(x);
		let prices = kline[i];
		isUpCandle.push(prices[2] >= prices[1]);
		let ys = _dataToPointY(top, viewYheight, min, max, prices[1], prices[2], prices[3], prices[4], prices[5], volumeMax, volumeMaxHeight, klineGapBottom, centerKline);

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
		volumeTops.push(ys.volume)
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
	let symbolNameColor = options && options.symbolNameColor || '#333';
	let symbolDescribe = options && options.symbolDescribe;
	let symbolDescribeColor = options && options.symbolDescribeColor || '#666';
	let overflowPane = options && options.overflowPane;
	let overflowPaneBottom = options && options.overflowPaneBottom;

	if(baseBarRange && baseBarRange[1] && baseBarRange[1]+1>=len) {
		baseBarRange[1] = len - 1;
	}
	//start draw
	let upBorderColor = options && options.upBorderColor || '#888888',//'#8B171B',//'#ae0006',
			upColor = options && options.upColor || '#eee',//'#AC1822',
		 	downBorderColor = options && options.downBorderColor || '#444',//'#050505',
		 	downColor = options && options.downColor || '#555';//'rgba(0,0,0,0)';

	let backgroundColor = options && options.backgroundColor || 'rgba(0,0,0,0)';

	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, width, height);
	if(!kline || kline.length == 0) {
		return  {};
	}
	// let d2 = new Date();
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
		if(i===selectedIndex) { //被选中的k线
			ctx.strokeStyle = '#8d151b';
			ctx.fillStyle = ctx.strokeStyle;
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

		//draw volume 
		if(volume) {
			let vY = volumeTops[i],
			    vX = whisker1[0][0] - Math.floor(klineW/2);
			let vHeight = top + viewYheight - vY;
			ctx.beginPath();
			ctx.fillRect(vX, vY, klineW, vHeight);
		}
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
		ctx.moveTo(0, hoverY);
		ctx.lineTo(width - right, hoverY);
		ctx.stroke();
	}
	//drawRangeRect
	if(selectedRange && selectedRange[0] >= 0 && selectedRange[1] >=0) {
		let rangeOption = options && options.rangeOption || {};
		let offsetTop = (rangeOption.top || 0) * ratio;
		let rangeHeight = 20 * ratio;

		let rangeX1 = klineWhisker[selectedRange[0]][0][0][0];
		let rangeX2 = klineWhisker[selectedRange[1]][0][0][0];
		ctx.save();
		ctx.shadowBlur = 0;
		ctx.shadowColor = 'rgba(0,0,0,1)';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.fillStyle = 'rgba(200,200,200,0.1)';
		ctx.fillRect(rangeX1, rangeHeight+offsetTop, rangeX2 - rangeX1, height);
		ctx.restore();
		ctx.fillStyle = '#333';
		ctx.fillRect(rangeX1, offsetTop, rangeX2 - rangeX1, rangeHeight);
		//text
		ctx.beginPath();
		let text = selectedRange[1] - selectedRange[0] + 1 + '根K线';
		ctx.font = `bold ${12*ratio}px Microsoft Yahei`;
		ctx.textAlign = 'center';
		// ctx.lineWidth = 1;
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#fff';
		ctx.fillText(text, (rangeX2 + rangeX1)/2, 15*ratio + offsetTop);
		ctx.stroke();
		// ctx.strokeText(text, (rangeX2 + rangeX1)/2, 13);
		//close btn
		if(!rangeOption.noCloseBtn) {
			ctx.fillStyle = '#444';
			ctx.fillRect(rangeX2 - rangeHeight, offsetTop, rangeHeight, rangeHeight);
			ctx.setLineDash([]);
			ctx.lineWidth = 2;
			let crossXCenter = rangeX2 - rangeHeight/2;
			let crossYCenter = rangeHeight/2 + offsetTop;
			let lineHalfLength = 3*ratio;
			ctx.moveTo(crossXCenter - lineHalfLength, crossYCenter - lineHalfLength);
			ctx.lineTo(crossXCenter + lineHalfLength, crossYCenter + lineHalfLength);
			ctx.stroke();		
			ctx.moveTo(crossXCenter - lineHalfLength, crossYCenter + lineHalfLength);
			ctx.lineTo(crossXCenter + lineHalfLength, crossYCenter - lineHalfLength);
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
		let index0 = baseBarRange[0],
				index1 = baseBarRange[1];
		let rangeX1 = klineWhisker[index0][0][0][0];
		let rangeX2 = klineWhisker[index1][0][0][0];
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
		
		//判断文字是否应该绘制 , 当K线顶部到达文字y轴区域则不绘制
		let shouldDrawText = true;
		for(let i=index0; i<=index1; i++) {
			if(klineWhisker[i][0][0][1] < 30*ratio){
				shouldDrawText = false;
				break;
			}
		}
		//text
		if(shouldDrawText) {

			ctx.textAlign = 'center';
			let textSymbol = symbolName || '';
			ctx.beginPath();
			ctx.fillStyle = symbolNameColor;
			ctx.strokeStyle = symbolNameColor;
			ctx.font = `${10*ratio}px Microsoft Yahei`;
			ctx.fillText(textSymbol, (rangeX1 + rangeX2)/2, 25*ratio);
			ctx.stroke();

			let textDescribe = symbolDescribe || '';
			ctx.font = `${12*ratio}px Microsoft Yahei`;
			ctx.beginPath();
			ctx.fillStyle = symbolDescribeColor;
			ctx.strokeStyle = symbolDescribeColor;
			ctx.fillText(textDescribe, (rangeX1 + rangeX2)/2, 40*ratio);
			ctx.stroke();

		}

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
		let indexYMin = Math.min(klineWhisker[index][0][0][1],klineWhisker[index][0][1][1],klineWhisker[index][1][0][1],klineWhisker[index][1][1][1]);         //high 的y坐标
		let indexYMax = Math.max(klineWhisker[index][0][0][1],klineWhisker[index][0][1][1],klineWhisker[index][1][0][1],klineWhisker[index][1][1][1]);         //low 的y坐标
		let offset = 10*ratio;
		// if(y) console.log('in pointToIndex',index,y, y > indexYMin - offset , y < indexYMax + offset);
		if(typeof y!='number' || (y > indexYMin - offset) && (y < indexYMax + offset)) {  //在10px 误差范围内, 或者 y == false
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
	if(!canvas) {
		console.trace();
		return;
	}
	betterCanvasSize(canvas);
	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;
	let priceMin = priceRange[0],
			priceMax = priceRange[1];

	//options
	let hoverY = options && options.hoverY;
	let textColor = options && options.textColor || '#000';
	let hoverColor = options && options.hoverColor || '#fff';
	let hoverBackground = options && options.hoverBackground || '#222';
	let labelWidth = options && options.labelWidth;
	let padding = options && options.padding || paddingDefault;
	let labelFormatter = options && labelFormatter || null;
	let marks = options && options.marks;
	
	let ratio = getCanvasPixRatio();
	let viewHeight = height - padding.top - padding.bottom;

	let rate = viewHeight / (priceMin - priceMax);

	let priceInterval = _getPriceInterval(priceMin, priceMax, viewHeight/ratio);

	let priceShow = Math.floor(priceMin/10) * 10,
			priceShowMax = Math.ceil(priceMax);

	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = '#000';//'rgba(0, 0, 0, 0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = textColor;
	ctx.textAlign = 'center';
	ctx.font = `${10*ratio}px Arial`;
	ctx.textBaseline = 'middle';
	
	while(priceShow < priceShowMax) {
		let centerY = (priceShow - priceMax) * rate + 0 + padding.top;
		let x = labelWidth && labelWidth/2 || width/2;
		var label = priceShow.toFixed(2);
		label = labelFormatter ? labelFormatter(label) : label;
		ctx.fillText(label, x, centerY);
		priceShow = priceShow + priceInterval;
	}
	let rectH = 20 * ratio;
	//marks 比如要显示一个参考线
	if(marks) {
		marks.forEach(function(mark){
			var val = mark.value;
			val *= ratio;
			var centerY = (val - priceMax) * rate + padding.top;
			let W = labelWidth || width;
			ctx.fillStyle = hoverBackground;
			ctx.fillRect(0, centerY - rectH / 2, W, rectH);
			ctx.fillStyle = hoverColor;
			ctx.fillText(val.toFixed(2), W/2, centerY);
			ctx.setLineDash([3,3]);
			ctx.strokeStyle = hoverBackground;
			ctx.beginPath();
			ctx.moveTo(W, centerY);
			ctx.lineTo(width, centerY);
			ctx.stroke();

			ctx.setLineDash([]);
		});
	}

	if(hoverY >=0) {
		// let ratio = getCanvasPixRatio();
		hoverY *= ratio;
		ctx.fillStyle = hoverBackground;
		let priceAtHover = (hoverY - padding.top) /rate + priceMax;
		let W = labelWidth || width;
		ctx.fillRect(0, hoverY - rectH / 2, W, rectH);
		ctx.fillStyle = hoverColor;
		ctx.fillText(priceAtHover.toFixed(2), W/2, hoverY);
	}
};
/*
	options: {
		hoverIndex: ,
		selectedIndex: ,
		padding: {left:,right:,top:,bottom},
	}
 */
let drawAxisX = (canvas, len, options) => {
	len = parseInt(len) || 0;
	if(!len) {
		console.error('drawAxisX len is 0');
		return;
	}
	betterCanvasSize(canvas);
	//options
	let hoverIndex = options && options.hoverIndex;
	let selectedIndex = options && options.selectedIndex;
	let padding = options && options.padding || {left:0, right:0, top:0, bottom:0};
	let textColor = options && options.textColor || '#000';
	let hoverColor = options && options.hoverColor || '#fff';
	let hoverBackground = options && options.hoverBackground || '#222';

	let ctx = canvas.getContext('2d');
	let width = canvas.width;
	let height = canvas.height;

	let spaceX = (width - padding.left - padding.right) / len;
	let ratio = getCanvasPixRatio();

	let minSpaceX = 20*ratio;
	let interval = Math.ceil(minSpaceX / spaceX);  //min is 1;

	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=0; i<len; i+=interval) {
		ctx.strokeStyle = textColor;
		ctx.fillStyle = textColor;
		let center = padding.left + i*spaceX + spaceX/2;
		ctx.fillText(i+1+'', center, 15);
	}

	//selectedIndex
	if(selectedIndex >=0) {
		let rectW = 50;
		let center = padding.left + selectedIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#8d151b';
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = '#fff';
		ctx.fillText(selectedIndex+1+'', center, 15);
	}

	//hoverIndex
	if(hoverIndex>=0) {
		let rectW = 50 * ratio;
		let center = padding.left + hoverIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = hoverBackground;
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = hoverColor;
		ctx.fillText(hoverIndex+1+'', center, 15*ratio);
	}

};

let drawAxisTime = (canvas, timeArr, options) => { //timeArr:['2012-01-21 09:21:33']
	let len = timeArr.length || 0;
	if(!len) {
		console.warn('drawAxisX len is 0');
		return;
	}
	if(!canvas) {
		console.trace();
		return;
	}
	betterCanvasSize(canvas);
	let ctx = canvas.getContext('2d');
	let drawLen = options && options.drawLen || len;

	let width = canvas.width;
	let height = canvas.height;
	//options
	let hoverIndex = options && options.hoverIndex;
	let selectedIndex = options && options.selectedIndex;
	let showTime = options && options.showTime || false; //是否显示时分秒
	let textColor = options && options.textColor || '#000';
	let hoverColor = options && options.hoverColor || '#fff';
	let hoverBackground = options && options.hoverBackground || '#222';
	let padding = options && options.padding || paddingDefault;
	let noGap = options && options.noGap || false; // 标志不是为k线绘制时间轴

	let viewWidth = width - padding.left - padding.right;
	let spaceX = viewWidth / (noGap ? drawLen-1 : drawLen);
	let interval = 1;
	let minSpaceX = 0;
	let ratio = getCanvasPixRatio();

 	let isDateStr = timeArr[0] && timeArr[0].length == 10;

	if(showTime) {
		minSpaceX = 55 * ratio;
 		interval = Math.ceil(minSpaceX / spaceX);
	} else {
 		minSpaceX = isDateStr ? 75 * ratio : 20 * ratio;
 		interval = Math.ceil(minSpaceX / spaceX);
	}
	//paint
	ctx.clearRect(0,0, width, height);
	// ctx.fillStyle = 'rgba(0,0,0,0.1)';
	// ctx.fillRect(0, 0, width, height);
	ctx.font = `${10*ratio}px Arial`;
	ctx.textAlign = 'center';
	for(let i=interval-1; i<len; i+=interval) {
		ctx.strokeStyle = textColor;
		ctx.fillStyle = textColor;
		let center = i*spaceX + spaceX / 2 + padding.left;
		if(noGap) center = i*spaceX + padding.left;
		let timeText = timeArr[i];
		let text = showTime ? timeText.slice(-8) : (isDateStr ? timeText : timeText.slice(8, 10));
		ctx.fillText(text, center, 15*ratio);
	}

	//selectedIndex
	if(selectedIndex >=0) {
		let rectW = showTime ? 120 : 60;
		rectW *= ratio;
		let center = selectedIndex*spaceX + spaceX/2;
		center = _toInt(center);
		ctx.fillStyle = '#8d151b';
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
		let center = hoverIndex*spaceX + spaceX/2 + padding.left;
		if(noGap) center = hoverIndex*spaceX + padding.left;
		//不让画出边界
		if(center < rectW/2) {
			center = rectW / 2;
		}
		if(center + rectW/2 > width) {
			center = width - rectW / 2;
		}
		center = _toInt(center);
		ctx.fillStyle = hoverBackground;
		ctx.fillRect(center - rectW/2, 0, rectW, height);
		ctx.fillStyle = hoverColor;
		ctx.fillText(text, center, 15*ratio);
	}

};


module.exports = {
	drawKline,
	drawAxisY,
	drawAxisX,
	drawAxisTime,
};
