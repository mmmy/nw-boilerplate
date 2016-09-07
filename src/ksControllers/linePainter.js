let _priceToY = (height, yMax, yMin, price) => {
    let rate = height / (yMin - yMax);
    return (price - yMax) * rate;
};
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
    var height = canvas.height,
        width = canvas.width;

    let strokeStyle = options && options.lineColor || 'rgba(100,100,100,0.5)';

    var dataLen = options && options.dataLen || lines && lines[0] && lines[0].length,
        emptyLeftLen = options && options.emptyLeftLen || 0,
        yMin = options && options.yMin || Infinity,
        yMax = options && options.yMax || -Infinity;

    var visibilitys = options && options.visibilitys;

    var len = lines.length;

    if(yMin == Infinity || yMax == -Infinity) {
	    for (let i = 0; i < len; i++) {
	        yMin = Math.min(Math.min.apply(null, lines[i]), yMin);
	        yMax = Math.max(Math.max.apply(null, lines[i]), yMax);
	    }	
    }

    var xInterval = width / (dataLen + emptyLeftLen - 1);

    var ctx = canvas.getContext('2d');
    //init
    ctx.save();
    ctx.strokeStyle = strokeStyle;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'square';
    ctx.setLineDash([0,0]);

    for (let i = 0; i < len; i++) {
        
        if(visibilitys && !visibilitys[i]) continue;

        let priceArr = lines[i];
        ctx.beginPath();
        priceArr.forEach((price, index) => {
            let y = _priceToY(height, yMax, yMin, price);
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
			if(priceArr) {
				ctx.beginPath();
				ctx.strokeStyle = options && options.activeColor || 'red';
				priceArr.forEach((price, index) => {
					let y = _priceToY(height, yMax, yMin, price);
					let x = (emptyLeftLen + index) * xInterval;
					if(index == 0){
						ctx.moveTo(x, y);
					}else{
						ctx.lineTo(x, y);
					}
				});
				ctx.stroke();
			}
		}    
    ctx.restore();

};

module.exports = {
    drawLines,
}