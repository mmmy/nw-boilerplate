
import KlineEditor from './KlineEditor';
import ConfigEditor from './ConfigEditor';
import { handleShouCangFocus, handleShouCangBlur } from './publicHelper';

function SearchEditor(dom, dataObj, favoritesManager, favoritesController) {
	this._$root = $(dom);
	this._dataObj = dataObj;
	this._favoritesManager = favoritesManager;
	this._favoritesController = favoritesController;
	this._$main = $('<div class="main-editor"></div>');
	this._$config = $('<div class="config-editor"></div>');
	this._OHLC = { barsInfo:null, O:null, H:null, L:null, C:null}; //缓存dom
	this._OHLCInputs = {O:null, H:null, L:null, C:null}; //缓存input dom
	this._floatTools = {addBars:null, rangeTool:null};

	this._klineEditor = null;
	this._configEditor = null;

	this._$root.append($('<div class="search-editor-wrapper"></div>').append(this._$main).append(this._$config));
	this._init();
	return this;
};

SearchEditor.prototype._initKlineEditor = function(){
	// let canvasNode = this._$main.find('canvas.kline-canvas')[0];
	// let $canvasNode = $(canvasNode);
	// let height = $canvasNode.height();
	// let width = $canvasNode.width();
	// $canvasNode.attr({height, width}).css({height, width});
	this._klineEditor = new KlineEditor(this._$main.find('.kline-editor-container')[0] , this._dataObj.kline);
	this._klineEditor.onUpdateOHLC(this.updateOHLC.bind(this));
	this._klineEditor.onMoveIndex(this.handleMoveIndex.bind(this));
	this._klineEditor.onUpdateInfo(this.updateInfo.bind(this));
	this._klineEditor.onEndDrawRange(this.handleEndDrawRange.bind(this));
	this._klineEditor.onRemoveRange(this.handleRemoveRange.bind(this));
	this.updateInfo(this._dataObj.kline.length);
}

SearchEditor.prototype._initConfigEditor = function() {
	this._configEditor = new ConfigEditor(this._$config, this._dataObj.searchConfig, {symbol:this._dataObj.symbol, dateRange:this._dataObj.dateRange});
}

SearchEditor.prototype._initMain = function() {
	let header = $(`<div class='header'></div>`);
	let that = this;
	this._OHLC = {
		barsInfo: $(`<span class='bars-info font-simsun'>0根K线</span>`),
		O: $('<span class="font-arial number">N/A</span>'),
		H: $('<span class="font-arial number">N/A</span>'),
		L: $('<span class="font-arial number">N/A</span>'),
		C: $('<span class="font-arial number">N/A</span>'),
	};
	let name = this._dataObj.name||'未命名';
	let $nameInput = $(`<span class='rename-container'><span class='ks-input-wrapper'><input value=${name} ><button class='ks-check'>check</button><button class='ks-delete'>del</button></span></span>`).hide();
	$nameInput.find('.ks-check').click(this._handleRename.bind(this));
	$nameInput.find('.ks-delete').click((e) => { $nameInput.hide(); });

	let $name = $(`<span class='title-name'><span class='name-content'>${name}</span></span>`).append($(`<button class='flat-btn'>改</button>`).click((e)=>{ $nameInput.show(); }));

	let OCLH = $(`<span class='OCLH-container'></span>`).append(this._OHLC.barsInfo)
																											.append(`<span class='font-arial'>O</span>`).append(this._OHLC.O)
																											.append(`<span class='font-arial'>H</span>`).append(this._OHLC.H)
																											.append(`<span class='font-arial'>L</span>`).append(this._OHLC.L)
																											.append(`<span class='font-arial'>C</span>`).append(this._OHLC.C);

	header.append($name).append($nameInput).append(OCLH).append($(`<button class='flat-btn tool-btn select-range'>区域</button>`).click(this._handleStartSelectRange.bind(this)))
											// .append($(`<button class='flat-btn tool-btn delete-range'>删除</button>`).click(this._handleDeleteBars.bind(this)))
											.append($(`<button class='flat-btn tool-btn save'>保存</button>`))
											.append($(`<button class='flat-btn tool-btn add-favorites'>收藏</button>`).focus(handleShouCangFocus.bind(null, this._favoritesManager, this._favoritesController, this._dataObj)).blur(handleShouCangBlur.bind(null)));

	this._OHLCInputs = {
		O: $('<input class="OCLH-input font-arial" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexO(+event.target.value) }),
		H: $('<input class="OCLH-input font-arial" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexH(+event.target.value) }),
		L: $('<input class="OCLH-input font-arial" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexL(+event.target.value) }),
		C: $('<input class="OCLH-input font-arial" type="number" step="0.1"/>').on('input', function(event){ that._klineEditor.setMoveIndexC(+event.target.value) }),
	};

	let searchEditorContainer = $(`<div class='kline-editor-container'></div>`);

	let body = $(`<div class='body'></div>`).append(searchEditorContainer);

	let OCLHInputs = $(`<span style='display:none' class='OCLH-inputs-container'></span>`)
									.append($('<span class="input-label font-arial">O</span>')).append(this._OHLCInputs.O)
									.append($('<span class="input-label font-arial">H</span>')).append(this._OHLCInputs.H)
									.append($('<span class="input-label font-arial">L</span>')).append(this._OHLCInputs.L)
									.append($('<span class="input-label font-arial">C</span>')).append(this._OHLCInputs.C);
	let footer = $(`<div class='footer'></div>`).append(OCLHInputs)
																							.append(`<span class='tool-btn search-button-wrapper'><button class='flat-btn search font-simsun'>搜索</button></span>`);
																							// .append($(`<button class='flat-btn tool-btn save'>保存</button>`));

	
	this._floatTools.addBars = $(`<span class='add-bars-container'></span>`).append($(`<span class='two-button-wrapper'></span>`)
																																									.append($(`<button class='flat-btn add-bars font-simsun'>新增</button>`).click(this._handleAddBars.bind(this)))
																																									.append($(`<input type='number' value='1' min='1'/>`)))
												.append($(`<button class='flat-btn delete-bars'>Del</button>`).click(this._handleDeleteBars.bind(this)))
												.hide();
												// .append($(`<button class='flat-btn bars-count font-number'>1<i class='fa fa-caret-down'><i/></button>`));

	this._floatTools.rangeTool = $(`<span class='range-tools-container'></span>`).append($(`<span class='two-button-wrapper'></span>`)
																																											.append($(`<button class='flat-btn mode-single active font-simsun'>单</button>`).click(this._handleSetRangeMode.bind(this, 0)))
																																											.append($(`<button class='flat-btn mode-linear font-simsun'>线</button>`).click(this._handleSetRangeMode.bind(this, 1))))
															.append($(`<button class='flat-btn delete-bars'>Del</button>`).click(this._handleDeleteBars.bind(this)))
	this._floatTools.rangeTool.hide();															

	this._$main.append(header).append(body).append(footer).append(footer).append(this._floatTools.addBars).append(this._floatTools.rangeTool);
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

SearchEditor.prototype.handleMoveIndex = function(index, data, showAddBtn) { //data:[time, O, C, L, H]
	if(index > -1) {
		this._OHLCInputs.O.closest('.OCLH-inputs-container').show();
		showAddBtn && this._floatTools.addBars.show();
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
		this._floatTools.addBars.hide();
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
	let $target = $(e.target);
	// $target.css('box-shadow','0 0 1px #444 inset');
	$target.addClass('active');
	this._klineEditor.startSelectRange();
}

SearchEditor.prototype._handleDeleteBars = function(e) {
	if(!this._klineEditor.deleteAtRange()) {
		this._klineEditor.deleteAtSelectedIndex();
	}
}

SearchEditor.prototype._handleShouCangFocus = function(e) {
	// this._klineEditor.resetRangeIndex();
	let $target = $(e.target);
	if($target.find('.shoucang-pop-menu').length > 0) {
		return;
	}
	let that = this;
	let favoritesManager = this._favoritesManager;
	let favoritesController = this._favoritesController;
	let dataObj = this._dataObj;
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div class='shoucang-pop-menu font-simsun'></div>`);

	let $title = $(`<h4 class='title'>另存为</h4>`);
	let $content = $(`<div class='content transition-all'></div>`);
	let $footer = $(`<div class='footer transition-all'></div>`).append($(`<span class='name'>新建文件夹</span>`))
																							.append($(`<i class='fa fa-plus toggle-btn'></i>`).click(function(event) {
																								$content.toggleClass('strech', true);
																								$footer.toggleClass('show-all', true);
																							}))
																							.append($(`<div class='input-wrapper'></div>`).append($(`<input />`).blur(function() { $target.focus()/* 消除bug*/})))
																							.append($(`<i class='fa fa-plus add-btn'></i>`).click(function(event) {
																								/* Act on the event */
																								let name = $footer.find('input').val();
																								if(name) {
																									favoritesController.addNewFolder(name);
																									let button = $(`<div class='item'>${name}</div>`).click((e) => {
																										favoritesController.addFavorites(name, dataObj);
																										$target.children().remove();
																									});
																									$content.append(button);
																								}
																							}));

	folders.forEach((folder) => {
		let button = $(`<div class='item'>${folder}</div>`).click((e) => {
			favoritesController.addFavorites(folder, dataObj);
			$target.children().remove();
		});
		$content.append(button);
	});

	optionsNode.append($title).append($content).append($footer);
	$target.append(optionsNode);
}

SearchEditor.prototype._handleShouCangBlur = function(e) {
	// this._klineEditor.resetRangeIndex();
	let $target = $(e.target);
	if($target.find(e.relatedTarget).length > 0) {
		return;
	}
	$target.children().remove();
}

SearchEditor.prototype._handleAddBars = function(e) {
	let bars = $(e.target).next().val();
	this._klineEditor.insertNewAfterSelectedIndex(bars);
}

SearchEditor.prototype._handleSetRangeMode = function(mode, e) { //0:single, 1:range
	this._klineEditor.setRangeMoveMode(mode);
	let $target = $(e.target);
	$target.addClass('active');
	$target.siblings('button').removeClass('active');
}

SearchEditor.prototype.handleEndDrawRange = function(range) { //
	// this._$main.find('.select-range').css('box-shadow','');
	this._$main.find('.select-range').removeClass('active');
	this._floatTools.rangeTool.show();
}

SearchEditor.prototype.handleRemoveRange = function() {
	this._floatTools.rangeTool.hide();
}

SearchEditor.prototype._handleRename = function(e) {
	// this._favoritesManager.updateFavorites(this._dataObj)
	let name = $(e.target).siblings('input').val() || '';
	name = name.trim().slice(0, 8);
	let folderName = this._favoritesController.getActiveName();
	if(name) {
		this._dataObj.name = name;
		this._$root.find('.name-content').text(name);
		this._favoritesManager.updateFavorites(folderName, this._dataObj);
	}
	$(e.target).closest('.rename-container').hide();
}

SearchEditor.prototype.dispose = function() {
	//save
	let folderName = this._favoritesController.getActiveName();
	this._favoritesManager.updateFavorites(folderName, this._dataObj);
};

module.exports = SearchEditor;
