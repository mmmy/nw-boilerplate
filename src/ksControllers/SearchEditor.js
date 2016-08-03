
import KlineEditor from './KlineEditor';
import ConfigEditor from './ConfigEditor';

function SearchEditor(dom, dataObj, favoritesManager, favoritesController) {
	this._$root = $(dom);
	this._dataObj = dataObj;
	this._favoritesManager = favoritesManager;
	this._favoritesController = favoritesController;
	this._$main = $('<div class="main-editor"></div>');
	this._$config = $('<div class="config-editor"></div>');
	this._OHLC = { barsInfo:null, O:null, H:null, L:null, C:null}; //缓存dom
	this._OHLCInputs = {O:null, H:null, L:null, C:null}; //缓存input dom
	this._klineEditor = null;
	this._configEditor = null;

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
	this._klineEditor.onUpdateInfo(this.updateInfo.bind(this));
	this.updateInfo(this._dataObj.kline.length);
}

SearchEditor.prototype._initConfigEditor = function() {
	this._configEditor = new ConfigEditor(this._$config, this._dataObj.searchConfig);
}

SearchEditor.prototype._initMain = function() {
	let header = $(`<div class='header'></div>`);
	let that = this;
	this._OHLC = {
		barsInfo: $(`<span class='bars-info font-simsun'>0根K线</span>`),
		O: $('<span class="font-number number">N/A</span>'),
		H: $('<span class="font-number number">N/A</span>'),
		L: $('<span class="font-number number">N/A</span>'),
		C: $('<span class="font-number number">N/A</span>'),
	};	
	let OCLH = $(`<span class='OCLH-container'></span>`).append(this._OHLC.barsInfo)
																											.append(`<span>O</span>`).append(this._OHLC.O)
																											.append(`<span>H</span>`).append(this._OHLC.H)
																											.append(`<span>L</span>`).append(this._OHLC.L)
																											.append(`<span>C</span>`).append(this._OHLC.C);

	header.append(OCLH).append($(`<button class='btn select-range'>区域</button>`).click(this._handleStartSelectRange.bind(this)))
											.append($(`<button class='btn delete-range'>删除</button>`).click(this._handleResetSelectRange.bind(this)))
											.append($(`<button class='btn add-favorites'>收藏</button>`).focus(this._handleShouCangFocus.bind(this)).blur(this._handleShouCangBlur.bind(this)));

	this._OHLCInputs = {
		O: $('<input class="OCLH-input font-number" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexO(+event.target.value) }),
		H: $('<input class="OCLH-input font-number" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexH(+event.target.value) }),
		L: $('<input class="OCLH-input font-number" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexL(+event.target.value) }),
		C: $('<input class="OCLH-input font-number" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexC(+event.target.value) }),
	};
	let body = $(`<div class='body'><div class='kline-canvas-wrapper flex-center'><canvas tabindex='1' class='kline-canvas'/></div></div>`);

	let OCLHInputs = $(`<span style='display:none' class='OCLH-inputs-container'></span>`)
									.append($('<span class="input-label font-number">O</span>')).append(this._OHLCInputs.O)
									.append($('<span class="input-label font-number">H</span>')).append(this._OHLCInputs.H)
									.append($('<span class="input-label font-number">L</span>')).append(this._OHLCInputs.L)
									.append($('<span class="input-label font-number">C</span>')).append(this._OHLCInputs.C);
	let footer = $(`<div class='footer'></div>`).append(OCLHInputs).append(`<button class='search-btn'>搜索</button>`);
	this._$main.append(header).append(body).append(footer).append(footer);
	this._initKlineEditor();
	this._initConfigEditor();
};

SearchEditor.prototype.updateOHLC = function(O, H, L, C) {
	this._OHLC.O.text(O.toFixed(2)).css('color', '');
	this._OHLC.H.text(H.toFixed(2)).css('color', '');
	this._OHLC.L.text(L.toFixed(2)).css('color', '');
	this._OHLC.C.text(C.toFixed(2)).css('color', '');
	if(C > O) {
		this._OHLC.O.css('color', '#ae0006');
		this._OHLC.H.css('color', '#ae0006');
		this._OHLC.L.css('color', '#ae0006');
		this._OHLC.C.css('color', '#ae0006');
	}
}

SearchEditor.prototype.handleMoveIndex = function(index, data) { //data:[time, O, C, L, H]
	if(index > -1) {
		this._OHLCInputs.O.closest('.OCLH-inputs-container').show();
		let O = data[1],
				C = data[2],
				L = data[3],
				H = data[4];

		this._OHLCInputs.O.val(O.toFixed(2));
		this._OHLCInputs.H.val(H.toFixed(2));
		this._OHLCInputs.L.val(L.toFixed(2));
		this._OHLCInputs.C.val(C.toFixed(2));
	} else {
		this._OHLCInputs.O.closest('.OCLH-inputs-container').hide();
	}
}

SearchEditor.prototype.updateInfo = function(bars) {
	let text = bars + '根K线';
	this._OHLC.barsInfo.text(text);
}

SearchEditor.prototype._initConfig = function() {

};

SearchEditor.prototype._init = function() {
	this._initMain();
	this._initConfig();
};

SearchEditor.prototype._handleStartSelectRange = function(e) {
	this._klineEditor.startSelectRange();
}

SearchEditor.prototype._handleResetSelectRange = function(e) {
	this._klineEditor.resetRangeIndex();
}

SearchEditor.prototype._handleShouCangFocus = function(e) {
	// this._klineEditor.resetRangeIndex();
	let $target = $(e.target);
	let favoritesManager = this._favoritesManager;
	let favoritesController = this._favoritesController;
	let dataObj = this._dataObj;
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div style='position:absolute'></div>`);

	folders.forEach((folder) => {
		let button = $(`<div>${folder}</div>`).click((e) => {
			favoritesController.addFavorites(folder, dataObj);
			$target.children().remove();
		});
		optionsNode.append(button);
	});
	$target.append(optionsNode);
}

SearchEditor.prototype._handleShouCangBlur = function(e) {
	// this._klineEditor.resetRangeIndex();
	let $target = $(e.target);
	$target.children().remove();
}

SearchEditor.prototype.dispose = function() {

};

module.exports = SearchEditor;
