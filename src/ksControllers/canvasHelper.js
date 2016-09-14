
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

module.exports = {
	getCanvasPixRatio,
	betterCanvasSize
};