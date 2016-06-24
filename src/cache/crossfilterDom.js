
let _yieldDateScatters = [];  //array of d3 object

let _industryPieCollection = null; //d3 object

let _yieldCountBarData = {nodes:[], maxBars: 20, xMin:0}; //d3 object

const _sortScatters = () => {
	let result = _yieldDateScatters.sort((a, b) => {
		return a.__data__.key.id - b.__data__.key.id;
	});
	_yieldDateScatters = result;
};

let setScatters = (scatters) => {
	// delete _yieldDateScatters;
	_yieldDateScatters = scatters;
	_sortScatters();
};

let getScatter = (id) => {
	return _yieldDateScatters[id];
};

//----------------
let setPieCollection = (pieNodes) => {
	_industryPieCollection = pieNodes;
};

let getPieSlice = (name) => {
	let len = _industryPieCollection.length;
	for (let i=0; i<len; i++) {
		if (_industryPieCollection[i].__data__.data.key === name) {
			return _industryPieCollection[i];
		}
	}
	return null;
};

//--------------------
let setCountBars = (bars, xMin, maxBars) => {
	

	if (typeof xMin === 'number') {
		_yieldCountBarData.xMin = xMin;
	}
	if (typeof maxBars === 'number') {
		_yieldCountBarData.maxBars = maxBars;
	}
	
	_yieldCountBarData.nodes = [];
	bars.forEach((node) => {
		_yieldCountBarData.nodes[node.__data__.data.key] = node;
	});
};

let getCountBar = (yieldRate) => {
	let interval = Math.abs(_yieldCountBarData.xMin) / _yieldCountBarData.maxBars * 2;
	let index = Math.floor((yieldRate - _yieldCountBarData.xMin) / interval);
	return _yieldCountBarData.nodes[index];
};

module.exports = {
	setScatters,
	getScatter,
	setPieCollection,
	getPieSlice,
	setCountBars,
	getCountBar,
};