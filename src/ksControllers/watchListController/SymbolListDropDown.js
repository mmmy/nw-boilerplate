
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
	this._fetchData();
}

SymbolListDropDown.prototype._initActions = function() {
	var that = this;
	this._$input.on('input.symbol-change', this._fetchData.bind(this));
	this._$input.on('focus', this._fetchData.bind(this));
	this._$submit.on('click', function(){
		var $active = that._$container.find('.symbol-item.active');
		if($active.length>0) {
			that._sleep();
			that._submit($active.data());
		}
	});
}
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
	var symbol = this._$input.val();
	this._dataFeed.searchSymbolsByName(symbol,'','',this._render.bind(this));
}

SymbolListDropDown.prototype._render = function(symbolList) {
	console.log(symbolList);
	this._disableSubmit();
	this._$container.empty();
	var that = this;
	if(symbolList.length === 0) {
		this._$container.append("<p><i>没有符合要求的标的</i></p>")
	} else {
		this._activeIndex = 0;
		this._enableSubmit();
		symbolList.forEach(function(symbolObj, i){
			var { description, symbol, type } = symbolObj;
			var symbolItem = $(`<div class='symbol-item'></div>`)
												.append(`<span>${symbol}</span>`)
												.append(`<span>${description}</span>`)
												.append(`<span>${type}</span>`)
												.toggleClass('active', i===that._activeIndex)
												.data(symbolObj)

			symbolItem.on('click', function(e){
				that._sleep();
				var $cur = $(e.currentTarget);
				that._submit($cur.data());
			});

			that._$container.append(symbolItem);
		});
	}
}

SymbolListDropDown.prototype._sleep = function() {
	this._$container.hide();
}

SymbolListDropDown.prototype.next = function() {

}

SymbolListDropDown.prototype.dispose = function() {
	this._$input.off('input.symbol-change');
	this._$wrapper.find('.symbol-list-container').remove();
}

module.exports = SymbolListDropDown;
