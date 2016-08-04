
let datePickerOptions = {
	format: "yyyy/mm/dd",
	language: "zh-CN",
	keyboardNavigation: false,
	autoclose: true,
};

function ConfigEditor(dom, searchConfig) {
	this._$dom = $(dom);
	this._$wrapper = $(`<div class='modal-content-contianer config-editor-inner'></div>`);
	this._$dom.append(this._$wrapper);
	this._config = searchConfig;
	this._inputs = {startDate:null, endDate:null, typeStock:null, typeFuture:null, additionBars:null, reduceBars:null, addBars:null};

	this._init();
	this._initActions();
}

ConfigEditor.prototype._init = function() {
	let { dateRange, additionDate, spaceDefinition } = this._config;
	this._inputs.startDate = $(`<input />`).val(dateRange[0]);
	this._inputs.endDate = $(`<input />`).val(dateRange[1]);
	this._inputs.typeStock = $(`<span class='stock fa'>股票</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.stock).toggleClass('fa-square-o', !spaceDefinition.stock);
	this._inputs.typeFuture = $(`<span class='stock fa'>期货</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.future).toggleClass('fa-square-o', !spaceDefinition.future);
	this._inputs.additionBars = $(`<input type='number' />`).val(additionDate.value);
	this._inputs.reduceBars = $(`<button>-</button>`);
	this._inputs.addBars = $(`<button>+</button>`);

	this._$wrapper.append(`<div class='title'>搜索配置</div>`);
	this._$wrapper.append(`<div class='item-title font-simsun'>选择时间</div>`);

	let $date = $(`<div class='item-body-container date'></div>`)
							.append(this._inputs.startDate)
							.append(`<span class='date-icon fa fa-calendar-o'></span>`)
							.append(`<span class='zhi'>至</span>`)
							.append(this._inputs.endDate)
							.append(`<span class='date-icon fa fa-calendar-o'></span>`);

	this._$wrapper.append($date);
	//标的类型
	this._$wrapper.append(`<div class='item-title font-simsun'>标的类型</div>`);
	let $sidType = $(`<div class='item-body-container sid'></div>`)
									.append(this._inputs.typeStock)
									.append(this._inputs.typeFuture);
	this._$wrapper.append($sidType);

	//统计天数
	this._$wrapper.append(`<div class='item-title font-simsun'>统计天数</div>`);
	let $bars = $(`<div class='item-body-container days'></div>`)
							.append(this._inputs.reduceBars)
							.append(this._inputs.additionBars)
							.append(this._inputs.addBars)
							.append(`<span class='font-simsun'>天</span>`);
	this._$wrapper.append($bars);

}

ConfigEditor.prototype._initActions = function() {
	//init date picker
	let searchConfig = this._config;
	$(this._inputs.startDate).datepicker(datePickerOptions).on('hide', (e) => { 
		let dateStr = e.format();
		searchConfig.dateRange[0] = dateStr;
	});
	$(this._inputs.endDate).datepicker(datePickerOptions).on('hide', (e) => { 
		let dateStr = e.format();
		searchConfig.dateRange[1] = dateStr;
	});
	
	//init sid type
	this._inputs.typeStock.on('click', this._clickStock.bind(this));
	this._inputs.typeFuture.on('click', this._clickFuture.bind(this));

	//init addition date
	this._inputs.reduceBars.on('click', this._clickReduceBars.bind(this));
	this._inputs.addBars.on('click', this._clickAddBars.bind(this));
	this._inputs.additionBars.on('input', this._changeBars.bind(this));
}

ConfigEditor.prototype._clickStock = function(e) {
	this._config.spaceDefinition.stock = !this._config.spaceDefinition.stock;
	let isStock = this._config.spaceDefinition.stock;
	this._inputs.typeStock.toggleClass('fa-check-square-o selected', isStock).toggleClass('fa-square-o', !isStock);
}

ConfigEditor.prototype._clickFuture = function(e) {
	this._config.spaceDefinition.future = !this._config.spaceDefinition.future;
	let isFuture = this._config.spaceDefinition.future;
	this._inputs.typeFuture.toggleClass('fa-check-square-o selected', isFuture).toggleClass('fa-square-o', !isFuture);
}

ConfigEditor.prototype._clickReduceBars = function(e) {
	if(this._config.additionDate.value > 1) this._config.additionDate.value -= 1;
	this.updateBars();
}

ConfigEditor.prototype._clickAddBars = function(e) {
	this._config.additionDate.value += 1;
	this.updateBars();
}

ConfigEditor.prototype._changeBars = function(e) {
	let val = $(e.target).val();
	this._config.additionDate.value = +val;
	this.updateBars();
}

ConfigEditor.prototype.updateBars = function() {
	this._inputs.additionBars.val(this._config.additionDate.value);
}

module.exports = ConfigEditor;
