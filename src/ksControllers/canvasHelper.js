
let _canvasPixRatio = null;

let getCanvasPixRatio = () => {
	if(!_canvasPixRatio) {
		_canvasPixRatio = window.devicePixelRatio || 1;
	}
	return _canvasPixRatio;
};

let betterCanvasSize = (canvas) => {
	let ratio = getCanvasPixRatio();
	let parent = canvas.parentNode;
	// console.assert(parent,'canvas parent not exist');
	let width = parent && parent.clientWidth || canvas.width;
	let height = parent && parent.clientHeight || canvas.height;
	canvas.width = width * ratio;
	canvas.height = height * ratio;
};

let roundRect = function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  // if (typeof stroke == 'undefined') {
  //   stroke = true;
  // }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  // ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
  // ctx.restore();
}

module.exports = {
	getCanvasPixRatio,
	betterCanvasSize,
	roundRect
};