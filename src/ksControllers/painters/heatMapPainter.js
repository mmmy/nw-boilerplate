
import { betterCanvasSize } from '../canvasHelper';

let _to05 = (number) => {
	return Math.floor(number) + 0.5;
};
let _toInt = (number) => {
	return Math.floor(number);
};
/*****
	data: {min: , max: , blocks: [], colors:[] },
	options: {
	
	}
	****/
let drawBlockHeatMap = (canvas, data, options) => {
	if(!canvas || !canvas.getContext) {
		cosnole.warn('drawBlockHeatMap, canvas is not canvas !');
		return;
	}

	betterCanvasSize(canvas);

	let ctx = canvas.getContext('2d');

	options = options || {};
	let blockWidth = options.blockWidth || 10;
	let blockGap = options.blockGap || 1;
	blockWidth = _toInt(blockWidth);

	let width = canvas.width,
			height = canvas.height,
			blocksLen = data.blocks.length,
			eachBlockHeight = (height - (blocksLen - 1) * blockGap) / blocksLen;

	ctx.clearRect(0,0,width, height);
	// let blocksSorted = data.blocks.concat([]).sort((a, b) => {
	// 	return a - b;
	// });

	let blocksY = [];
	let blocksColor = data.colors;

	for(let i=0; i<blocksLen; i++) {
		let blockY = i * (eachBlockHeight + blockGap);
		blockY = _toInt(blockY);
		blocksY.push(blockY);

		// let indexInSort = blocksSorted.indexOf(data.blocks[i]);
		// let color = data.colors[indexInSort] || 'green';
		// blocksColor.push(color);
	}

	//labels
	let labelWidth = width - blockWidth,
			labelX = blockWidth + labelWidth / 2,
			fontSize = options.fontSize || 10,
			textColor = options.textColor || '#000';
	let labels = data.labels || [];

	//draw
	let drawEachHeight = Math.floor(eachBlockHeight);
	ctx.save();
	ctx.textAlign = 'center';
	ctx.font = 'italic ' + fontSize + 'px Arial';
	blocksY.forEach((y, i) => {
		ctx.fillStyle = blocksColor[i];
		ctx.fillRect(0, y, blockWidth, drawEachHeight);
		let label = labels[i];
		if(label) {
			ctx.fillStyle = textColor;
			ctx.fillText(label, labelX, (i+1)*(drawEachHeight + blockGap) + fontSize/2);	
		}
	});
	ctx.restore();

};

module.exports = {
	drawBlockHeatMap
}