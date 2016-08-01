
import KlineEditor from './KlineEditor';

function SearchEditor(dom, dataObj) {
	this._$root = $(dom);
	this._dataObj = dataObj;
	this._$main = $('<div class="main-editor"></div>');
	this._$config = $('<div class="config-editor"></div>');
	this._OHLC = {O:null, H:null, L:null, C:null}; //缓存dom
	this._OHLCInputs = {O:null, H:null, L:null, C:null}; //缓存input dom
	this._klineEditor = null;

	this._$root.append($('<div class="search-editor-wrapper"></div>').append(this._$main).append(this._$config));
	this._init();
	return this;
};

SearchEditor.prototype._initKlineEditor = function(){
	let canvasNode = this._$main.find('canvas.kline-canvas')[0];
	let $canvasNode = $(canvasNode);
	let height = $canvasNode.height();
	let width = $canvasNode.width();
	$canvasNode.attr({height, width}).css({height, width});
	this._klineEditor = new KlineEditor(canvasNode, this._dataObj.kline);
	this._klineEditor.onUpdateOHLC(this.updateOHLC.bind(this));
	this._klineEditor.onMoveIndex(this.handleMoveIndex.bind(this));
}

SearchEditor.prototype._initMain = function() {
	let header = $(`<div class='header'></div>`);
	let that = this;
	this._OHLC = {
		O: $('<span>O</span>'),
		H: $('<span>H</span>'),
		L: $('<span>L</span>'),
		C: $('<span>C</span>'),
	};	
	this._OHLCInputs = {
		O: $('<input type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexO(+event.target.value) }),
		H: $('<input type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexH(+event.target.value) }),
		L: $('<input type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexL(+event.target.value) }),
		C: $('<input type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexC(+event.target.value) }),
	};
	let OCLH = $(`<div class='OCLH-container'></div>`).append(this._OHLC.O).append(this._OHLC.H).append(this._OHLC.L).append(this._OHLC.C);
	let body = $(`<div class='body'><div class='kline-canvas-wrapper flex-center'><canvas tabindex='1' class='kline-canvas'/></div></div>`).prepend(OCLH);

	let OCLHInputs = $(`<div class='OCLH-inputs-container'></div>`)
									.append($('<span>O</span>').append(this._OHLCInputs.O))
									.append($('<span>H</span>').append(this._OHLCInputs.H))
									.append($('<span>L</span>').append(this._OHLCInputs.L))
									.append($('<span>C</span>').append(this._OHLCInputs.C));
	let footer = $(`<div class='footer'></div>`).append(OCLHInputs);
	this._$main.append(header).append(body).append(footer).append(footer);
	this._initKlineEditor();
};

SearchEditor.prototype.updateOHLC = function(O, H, L, C) {
	this._OHLC.O.text(`O ${O.toFixed(2)}`);
	this._OHLC.H.text(`H ${H.toFixed(2)}`);
	this._OHLC.L.text(`L ${L.toFixed(2)}`);
	this._OHLC.C.text(`C ${C.toFixed(2)}`);
}

SearchEditor.prototype.handleMoveIndex = function(index, data) { //data:[time, O, C, L, H]
	if(index > -1) {
		// this._OHLCInputs.O.closest('.OCLH-inputs-container').show();
		let O = data[1],
				C = data[2],
				L = data[3],
				H = data[4];

		this._OHLCInputs.O.val(O.toFixed(2));
		this._OHLCInputs.H.val(H.toFixed(2));
		this._OHLCInputs.L.val(L.toFixed(2));
		this._OHLCInputs.C.val(C.toFixed(2));
	} else {

	}
}

SearchEditor.prototype._initConfig = function() {

};

SearchEditor.prototype._init = function() {
	this._initMain();
	this._initConfig();
};



SearchEditor.prototype.dispose = function() {

};

module.exports = SearchEditor;