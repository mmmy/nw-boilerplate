
var scannerController = {};
var _$title = null;
var _$left = null;
var _$right = null;

scannerController.init = (container) => {
	var $title = $(`<div class="title">扫描<img src="./image/tooltip.png"/></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	$(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));

	var filterList = [
		
	];

	_$title = $title;
	_$left = $left;
	_$right = $right;


	scannerController._initActions();
};

scannerController._initActions = () => {

};

scannerController._fetchData = () => {

};

module.exports = scannerController;