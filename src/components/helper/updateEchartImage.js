import store from '../../store';

let _setImageFuncs = [];
let _setImageSrcFuncs = [];

let setFunc = (index, func) => {
	_setImageFuncs[index] = func;
};
let setImgSrcFunc = (index, func) => {
	_setImageSrcFuncs[index] = func;
};


let callFunc = (indexRange) => {
	// return;
	// let funcArr = _setImageFuncs.slice(indexRange[0], indexRange[1]);
	$('.pattern-toolbar-container').css('z-index', '5');
	try {
		let sequenCall = (index, lastIndex) => {
			if(index >= lastIndex || !_setImageFuncs[index] || store.getState().layout.waitingForPatterns) {
				$('.pattern-toolbar-container').css('z-index', '5');  //sortbar 显示bug
				return;
			}
			// console.info('!!!!!!!!!!!!!sequenCall :', index);
			_setImageFuncs[index](sequenCall.bind(null, index+1, indexRange[1]));
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

module.exports = {
	setFunc,
	callFunc,
	setImgSrcFunc,
	updateImgAll,
};