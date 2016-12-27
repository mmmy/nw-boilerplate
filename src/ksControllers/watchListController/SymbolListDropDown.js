
function SymbolListDropDown(options) {
	this._$wrapper = options.wrapper;
	this._$input = this._$wrapper.find('[role="input"]');
	this._$submit = this._$wrapper.find('[role="submit"]');
	this._dataFeed = options.dataFeed;
	this._onSumbmit = options.onSubmit;

	this._$container = $('<div class="symbol-list-container"></div>');
	this._$wrapper.append(this._$container);

	this._activeIndex = -1;
	this._symbolList = [];

	this._initActions();
	this._hide();
	// this._fetchData();
}

SymbolListDropDown.prototype._initActions = function() {
	var that = this;
	this._disableSubmit();
	this._$input.on('input.symbol-change', this._fetchData.bind(this));
	// this._$input.on('focus', this._fetchData.bind(this));
	this._$submit.on('click', function(){
		// var $active = that._$container.find('.symbol-item.active');
		// if($active.length>0) {
		// 	that._hide();
		// 	that._submit($active.data());
		// }
		var symbolObj = that._$input.data();
		if(symbolObj) {
			that._submit(symbolObj);
		}
		that._$input.select();
	});
}
//添加
SymbolListDropDown.prototype._submit = function(symbolObj) {
	this._$input.val(symbolObj.symbol);
	this._onSumbmit && this._onSumbmit(symbolObj);
}
SymbolListDropDown.prototype._enableSubmit = function() {
	this._$submit.attr('disabled', false);
}
SymbolListDropDown.prototype._disableSubmit = function() {
	this._$submit.attr('disabled', true);
}
SymbolListDropDown.prototype._showLoading = function() {
	this._$container.empty();
	this._$container.append('<div><img src="./image/loading-small.gif" /></div>');
	this._$container.show();
}
SymbolListDropDown.prototype._fetchData = function() {
	this._showLoading();
	this._disableSubmit();
	var symbol = this._$input.val();
	if(symbol === '') {
		this._hide();
	} else {
		this._dataFeed.searchSymbolsByName(symbol,'','',this._render.bind(this));
	}
}

SymbolListDropDown.prototype._render = function(symbolList) {
	this._disableSubmit();
	this._$container.empty();
	var that = this;
	if(symbolList.length === 0) {
		this._$container.append("<div><i>没有符合要求的标的</i></div>")
	} else {
		this._activeIndex = 0;
		symbolList.forEach(function(symbolObj, i){
			var { description, symbol, type } = symbolObj;
			if(type == 'stock') type = '股票';
			if(type == 'index') type = '指数';
			if(type == 'futures') type = '期货';
			var symbolItem = $(`<div class='symbol-item'></div>`)
												.append(`<span>${symbol}</span>`)
												.append(`<span>${description}</span>`)
												.append(`<span>${type}</span>`)
												.toggleClass('active', i===that._activeIndex)
												.data(symbolObj)

			symbolItem.on('click', function(e){
				that._hide();
				var $cur = $(e.currentTarget);
				var symbolObj = $cur.data();
				that._$input.data(symbolObj);
				that._$input.val(symbolObj.symbol);
				that._enableSubmit();
				// that._submit($cur.data());
			});

			that._$container.append(symbolItem);
		});
	}
}

SymbolListDropDown.prototype._hide = function() {
	this._$container.hide();
}

SymbolListDropDown.prototype.next = function() {

}

SymbolListDropDown.prototype.dispose = function() {
	this._$input.off('input.symbol-change');
	this._$wrapper.find('.symbol-list-container').remove();
}

module.exports = SymbolListDropDown;
