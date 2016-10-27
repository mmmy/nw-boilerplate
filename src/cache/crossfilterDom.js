
let _yieldDateScatters = [];  //array of d3 object
let _selectedScatter = null;
let _lastId = -1;

let _industryPieCollection = null; //d3 object

let _yieldCountBarData = {nodes:[], maxBars: 20, xMin:0}; //d3 object

const _sortScatters = () => {
	let result = _yieldDateScatters.sort((a, b) => {
		return a.__data__.key.id - b.__data__.key.id;
	});
	_yieldDateScatters = result;
};

let setScatters = (scatters, selectedScatter, selectedId=0) => {
	// delete _yieldDateScatters;
	_yieldDateScatters = scatters || _yieldDateScatters;
	_selectedScatter = selectedScatter || _selectedScatter;
	if(scatters) { 
		_sortScatters();
	}
	let node = getScatter(selectedId);
	if(node && _selectedScatter) {
		let $node = $(node);
		//console.debug($node, $node.attr('transform'), $node.attr('d'));
		$(_selectedScatter).attr('transform', $node.attr('transform')).attr('d', $node.attr('d'));
		let lastNode = getScatter(_lastId);
		lastNode && (lastNode.style.fill = '');
		node.style.fill = 'transparent';
		_lastId = selectedId;
	}
};

let getScatter = (id) => {
	return _yieldDateScatters[id];
};

//----------------
let setPieCollection = (pieNodes, selectedIndustry) => {
	_industryPieCollection = pieNodes;
	let matchPie = getPieSlice(selectedIndustry);
	let piePath = matchPie && matchPie.lastChild;
	if(piePath) {
		$(piePath).addClass('selected');
	}
};

let getPieSlice = (name) => {
	let len = _industryPieCollection.length;
	let node = null;
	for (let i=0; i<len; i++) {
		if (_industryPieCollection[i].__data__.data.key === name) {
			node = _industryPieCollection[i];
			break;
		}
	}

	if(node && !node.parentNode) {   //需要更新
		_industryPieCollection = $('g.pie-slice');
		return getPieSlice(name);
	}

	return node;
};

//--------------------
let setCountBars = (bars, outLines, xMin, maxBars, selectedYield) => {
	

	if (typeof xMin === 'number') {
		_yieldCountBarData.xMin = xMin;
	}
	if (typeof maxBars === 'number') {
		_yieldCountBarData.maxBars = maxBars;
	}
	
	_yieldCountBarData.bars = [];
	_yieldCountBarData.outLines = [];
	bars.forEach((node) => {
		_yieldCountBarData.bars[node.__data__.data.key] = node;
	});
	outLines.forEach((outline) => {
		_yieldCountBarData.outLines[outline.__data__.data.key] = outline;
	});

	let outline = getCountBar(selectedYield, true);
	outline && $(outline).addClass('selected');
};

let getCountBar = (yieldRate, isOutline=true) => {
	let interval = Math.abs(_yieldCountBarData.xMin) / _yieldCountBarData.maxBars * 2;
	let index = Math.floor((yieldRate - _yieldCountBarData.xMin) / interval);
	return _yieldCountBarData[isOutline ? 'outLines' : 'bars'][index];
};

let getCountBarAll = () => {
	return _yieldCountBarData;
}

module.exports = {
	setScatters,
	getScatter,
	setPieCollection,
	getPieSlice,
	setCountBars,
	getCountBar,
	getCountBarAll
};