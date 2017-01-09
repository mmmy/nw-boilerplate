
var searchPatternGuide = {};

searchPatternGuide.check = function() {
	var storage = window.localStorage;
	var key = '__FIRST_IN_TRADINGVIEW';
	// if(!storage[key]) {
		searchPatternGuide.start();
		// storage[key] = true;
	// }
};

searchPatternGuide.start = function() {
	var _$overlay = $(`<div class="modal-overlay black flex-center"></div>`);
	var _$modal = $(`<div class="search-pattern-guide"></div>`);

	var _$header = $(`<div class="title"></div>`);
	var _$body = $(`<div class="body"><div class="content"></div></div>`);
	var _$footer = $(`<div class="footer"></div>`);
	_$modal.append([_$header, _$body, _$footer]);
	_$overlay.append(_$modal);
	$(window.document.body).append(_$overlay);

	var steps = [
		'<img src="./image/fuck.jpg">',
		'<img src="./image/loading-small.gif">',
		'<img src="./image/fuck.jpg">',
		'<img src="./image/screenshort_origin.png">',
	];
	
	var len = steps.length;
	var curIndex = 0;
	var goStep = function(isNext) {
		var $content = _$body.find('.content');
		var width = $content.width() / len;
		curIndex = isNext ? (curIndex + 1) : (curIndex - 1);
		$content.css('left', - width * curIndex);
	};
	var lastBtn = $(`<button class="flat-btn border-btn">上一步</button>`).click(function(event) {
		goStep(false);
	});
	var nextBtn = $(`<button class="flat-btn border-btn">下一步</button>`).click(function(event) {
		goStep(true);
	});
	_$body.find('.content').append(steps);
	_$footer.append([lastBtn, nextBtn]);
};

module.exports = searchPatternGuide;
