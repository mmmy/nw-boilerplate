
let _setImageFuncs = [];

let setFunc = (index, func) => {
	_setImageFuncs[index] = func;
};

let callFunc = (indexRange) => {
	// let funcArr = _setImageFuncs.slice(indexRange[0], indexRange[1]);
	$('.pattern-toolbar-container').css('z-index', '5');
	try {
		let sequenCall = (index, lastIndex) => {
			if(index >= lastIndex || !_setImageFuncs[index]) {
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
};

module.exports = {
	setFunc,
	callFunc,
};