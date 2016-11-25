import store from '../../store';

let _setImageFuncs = [];
let _setImageSrcFuncs = [];
let _setCanvasVisibleFuncs = [];

let _updateDescribeById = function(id) {
	let patterns = store.getState().patterns;
	let pattern = patterns.rawData[id];
	let metaData = pattern && pattern.metaData;
	if(metaData) {
		let patternView = $(`#pattern_view_${id}`);
		patternView.find('.describe').text(metaData.name);
	}
}

let setFunc = (index, func) => {
	_setImageFuncs[index] = func;
};
let setImgSrcFunc = (index, func) => {
	_setImageSrcFuncs[index] = func;
};
let setCanvasVisibleFunc = (index, func) =>	{
	_setCanvasVisibleFuncs[index] = func;
}

let callFunc = (indexRange, patterns) => {
	// return;
	// let funcArr = _setImageFuncs.slice(indexRange[0], indexRange[1]);
	indexRange = indexRange	|| [0, _setImageFuncs.length];
	$('.pattern-toolbar-container').css('z-index', '5');
	try {
		let sequenCall = (index, lastIndex) => {
			if(index >= lastIndex || !_setImageFuncs[index] || store.getState().layout.waitingForPatterns) {
				$('.pattern-toolbar-container').css('z-index', '5');  //sortbar 显示bug
				return;
			}
			// console.info('!!!!!!!!!!!!!sequenCall :', index);
			_updateDescribeById(index);
			_setImageFuncs[index](sequenCall.bind(null, index+1, indexRange[1]), patterns && patterns[index]);
		};
		sequenCall(indexRange[0], indexRange[1]);
	} catch (e) {
		console.log(e);
	}
	// if(indexRange[1] == _setImageFuncs.length) {
	// 	setTimeout(() => {
	// 		let alert = false;
	// 		$('.echart img').each((i, e) => {
	// 			if ((e.width != 120) && (e.width != 200)) {
	// 				alert = true;
	// 			}
	// 		});
	// 		if(alert) {
	// 			var exec = require('child_process').exec;
	// 			var cmd = 'terminal-notifier -message "error! no img" -sound Glass -appIcon ~/Pictures/13.jpg';
	// 			exec(cmd);
	// 		}
	// 	},2000)
	// }
};

let updateImgAll = (size) => {
	_setImageSrcFuncs.forEach((func) => {
		func && func.call && func(size);
	});
};

//do not need any more
let updateCanvasVisible = (hide) => {
	_setCanvasVisibleFuncs.forEach((func) => {
		func && func.call && func(hide);
	});
};
//需要根据对应的css规则确定计算方式
let _$patternCollection = null;
let patternViewSizeHelper = () => {
	_$patternCollection = _$patternCollection || $('.pattern-collection');
	let patternCollectionW = _$patternCollection.width() - 6;
	let $body = $(document.body);
	let bodyWidth = $body.width();

	let patternViewW = 0;

	if(bodyWidth > 1650) {
		patternViewW = patternCollectionW / 4 - 2;
	} else {
		patternViewW = patternCollectionW / 3 - 2;
	}
 	return {width: Math.floor(patternViewW), height: Math.floor(patternViewW * 210 / 160)};
};

let getZPatternViewCanvasSize = () => {
	_$patternCollection = _$patternCollection || $('.pattern-collection');
	let $patternViews = _$patternCollection.find('.pattern-view:visible');
	let width = 0,
			height = 0;
	if($patternViews.length > 0) {
		let $canvas = $($patternViews[0]).find('canvas');
		width = $canvas.width();
		height = $canvas.height();
	} else {
		let patternViewSize = patternViewSizeHelper();
		width = patternViewSize.width - 60;
		height = patternViewSize.height - 120;
	}
	return {width: width , height: height };
};

module.exports = {
	setFunc,
	callFunc,
	setImgSrcFunc,
	updateImgAll,
	setCanvasVisibleFunc,
	updateCanvasVisible,
	patternViewSizeHelper,
	getZPatternViewCanvasSize,
};