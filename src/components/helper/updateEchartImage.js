
let _setImageFuncs = [];

let setFunc = (index, func) => {
	_setImageFuncs[index] = func;
};

let callFunc = (indexRange) => {
	_setImageFuncs.slice(indexRange[0], indexRange[1]).forEach((func)=>{
		setTimeout(() => { func && func() });
	});
};

module.exports = {
	setFunc,
	callFunc,
};