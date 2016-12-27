
import { betterCanvasSize } from './canvasHelper';

let _to05 = (number) => {
    return Math.floor(number) + 0.5;
};

let _priceToY = (height, yMax, yMin, price, volumeMaxHeight) => {
    volumeMaxHeight = volumeMaxHeight || 0;
    let rate = (height - volumeMaxHeight) / (yMin - yMax);
    return (price - yMax) * rate;
};
/*
高度, volume高度, volume最大值, volume值
 */
let _volumeToY = (height, volumeMaxHeight, volumeMax, volume) => {
    return _to05(height - volume / volumeMax * volumeMaxHeight);
}
/***
	options: {
		yMin:
		yMax:
		emptyLeftLen:
		dataLen:
		activeIndex:
		activeColor:
        visibilitys:
	}
****/
let drawLines = (canvas, lines, options) => {
    if (!canvas || !canvas.getContext) {
        console.warn('drawLlines , canvas is not canvas!');
        return;
    }
    
    // betterCanvasSize(canvas);

    var height = canvas.height,
        width = canvas.width;

    let strokeStyle = options && options.lineColor || 'rgba(200,200,200,0.5)';
    //dataLen :预测的天数
    var dataLen = options && options.dataLen || lines && lines[0] && (lines[0].length - 1),
        emptyLeftLen = options && options.emptyLeftLen || 0,
        yMin = options && options.yMin || Infinity,
        yMax = options && options.yMax || -Infinity;

    var visibilitys = options && options.visibilitys;
    var patterns = options && options.patterns || []; //需要获取volume 数据
    var volumeHeight = options && options.volumeHeight || 0.2;
    var padding = options && options.padding || {};
    var right = padding.right || 0;

    var volume = patterns.length > 0;
    var volumeMaxHeight = 0;
    if(volume) {
        volumeMaxHeight = height * volumeHeight;
    }

    var len = lines.length;

    if(yMin == Infinity || yMax == -Infinity) {
	    for (let i = 0; i < len; i++) {
	        yMin = Math.min(Math.min.apply(null, lines[i]), yMin);
	        yMax = Math.max(Math.max.apply(null, lines[i]), yMax);
	    }	
    }

    var xInterval = (width - right) / (dataLen + emptyLeftLen);

    var ctx = canvas.getContext('2d');
    //init
    ctx.save();
    var gradient = ctx.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(0.1, 'rgba(200,200,200,0.5)');
    gradient.addColorStop(0.9, 'rgba(200,200,200,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.5)');
    ctx.strokeStyle = gradient;//strokeStyle;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'square';
    ctx.setLineDash([0,0]);

    for (let i = 0; i < len; i++) {
        
        if(visibilitys && !visibilitys[i]) continue;

        let priceArr = lines[i];
        ctx.beginPath();
        priceArr.forEach((price, index) => {
            let y = _priceToY(height, yMax, yMin, price, volumeMaxHeight);
            let x = (emptyLeftLen + index) * xInterval;
            if (index == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

		//active line
		let activeIndex = options && options.activeIndex;
		activeIndex = parseInt(activeIndex);
		if(!isNaN(activeIndex) && (!visibilitys || visibilitys[activeIndex])) {
			let priceArr = lines[activeIndex];
            let pattern = patterns[activeIndex];
            let kline = pattern && pattern.kLine.slice(-dataLen); //[5] = volume
			if(priceArr) {
				ctx.beginPath();
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0,0,0,1)';
                ctx.shadowOffsetY = 5;
				ctx.strokeStyle = options && options.activeColor || 'red';
				priceArr.forEach((price, index) => {
					let y = _priceToY(height, yMax, yMin, price, volumeMaxHeight);
					let x = (emptyLeftLen + index) * xInterval;
					if(index == 0){
						ctx.moveTo(x, y);
					}else{
						ctx.lineTo(x, y);
					}
				});
				ctx.stroke();
                ctx.restore();
                ctx.clearRect(emptyLeftLen * xInterval, height - volumeMaxHeight, width, volumeMaxHeight);
                if(kline && (kline.length > 0)) {
                    var maxVolume = 0;
                    for(var j=0; j<kline.length; j++) {
                        maxVolume = Math.max(kline[j][5], maxVolume);
                    }
                    var klineW = Math.round(xInterval/2) * 1.2;
                        klineW += (klineW % 2 == 0) ? 1 : 0;
                    for(var j=0; j<dataLen; j++) {
                        let vX = (emptyLeftLen + j + 1) * xInterval;
                        let prices = kline[j];
                        if(prices) { //有volume
                            let vY = _volumeToY(height,volumeMaxHeight,maxVolume,prices[5])
                            let isUp = prices[2] >= prices[1];
                            ctx.strokeStyle = isUp ? '#a44044' : '#7e1b1b';
                            ctx.fillStyle = ctx.strokeStyle;
                            ctx.beginPath();
                            ctx.rect(vX - (klineW-1)/2, vY, klineW, height - vY);
                            ctx.stroke();
                            ctx.fill();
                        }
                    }
                }

			}
		}    
    ctx.restore();

};

module.exports = {
    drawLines,
}