
let datePickerOptions = {
	format: "yyyy/mm/dd",
	language: "zh-CN",
	keyboardNavigation: false,
	autoclose: true,
};

let adjustConfig = (searchConfig) => {
	let dateRange = searchConfig.dateRange;
	if (dateRange && typeof dateRange[0] == 'string') { //将老格转换成新格式
		dateRange[0] = {date:dateRange[0], hour:'0', minute:'0', second:'0'};
		dateRange[1] = {date:dateRange[1], hour:'0', minute:'0', second:'0'};
	}
	if(!searchConfig.similarityThreshold) {
		searchConfig.similarityThreshold = {on: false, value: 0.6};
	}
};

function ConfigEditor(dom, searchConfig, info) {
	adjustConfig(searchConfig);
	this._$dom = $(dom);
	this._$wrapper = $(`<div class='modal-content-contianer config-editor-inner'></div>`);
	this._$info = $(`<div class='search-info-container'></div>`);
	this._$dom.append(this._$wrapper);
	this._$dom.append(this._$info);
	this._config = searchConfig;
	this._info = info;
	this._inputs = {startDate:null, 
									endDate:null, 
									typeStock:null, 
									typeFuture:null, 
									additionBars:null, 
									reduceBars:null, 
									addBars:null, 
									similarityCheck:null,
									similaritySelect:null,
									startTime:{hour:null,minute:null,second:null},
									endTime:{hour:null,minute:null,second:null},
								};

	this._onEdit = null;

	this._init();
	this._initActions();
}

ConfigEditor.prototype._init = function() {
	let { dateRange, additionDate, spaceDefinition, isLatestDate, similarityThreshold } = this._config;
	let d0 = dateRange[0],
			d1 = dateRange[1];
	this._inputs.startDate = $(`<input />`).val(d0.date);
	this._inputs.endDate = $(`<input />`).val(d1.date);
	this._inputs.typeStock = $(`<span class='stock fa'>股票</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.stock).toggleClass('fa-square-o', !spaceDefinition.stock);
	this._inputs.typeFuture = $(`<span class='stock fa'>期货</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.future).toggleClass('fa-square-o', !spaceDefinition.future);
	this._inputs.additionBars = $(`<input type='number' />`).val(additionDate.value);
	this._inputs.reduceBars = $(`<button>-</button>`);
	this._inputs.addBars = $(`<button>+</button>`);

	let hour0 = $(`<input type="number" min="0" max="23">`).val(d0.hour);
	let minute0 = $(`<input type="number" min="0" max="59">`).val(d0.minute);
	let second0 = $(`<input type="number" min="0" max="59">`).val(d0.second);
	let hour1 = $(`<input type="number" min="0" max="23">`).val(d1.hour);
	let minute1 = $(`<input type="number" min="0" max="59">`).val(d1.minute);
	let second1 = $(`<input type="number" min="0" max="59">`).val(d1.second);

	this._inputs.startTime.hour = hour0;
	this._inputs.startTime.minute = minute0;
	this._inputs.startTime.second = second0;

	this._inputs.endTime.hour = hour1;
	this._inputs.endTime.minute = minute1;
	this._inputs.endTime.second = second1;

	this._inputs.similarityCheck = $('<input type="checkbox" />').attr('checked', similarityThreshold.on);
	this._inputs.similaritySelect = $('<select><option value="0.9">90%</option><option value="0.8">80%</option><option value="0.7">70%</option><option value="0.6">60%</option></select>').attr('disabled', !similarityThreshold.on).val(similarityThreshold.value);

	this._$wrapper.append(`<div class='title'>搜索配置</div>`);
	
	//统计天数
	this._$wrapper.append(`<div class='item-title font-simsun'>后向统计范围</div>`);
	let $bars = $(`<div class='item-body-container days'></div>`)
							.append($(`<div class="inputs-wrapper"></div>`).append(this._inputs.reduceBars).append(this._inputs.additionBars).append(this._inputs.addBars))
							.append(`<span class='font-simsun'>根</span>`);
	this._$wrapper.append($bars);

	//选择时间
	let startDateDoms = $('<div>').addClass('inputs-groups').append($('<div>').addClass('inputs-wrapper').append(this._inputs.startDate).append(`<span class='date-icon fa fa-calendar-o'></span>`))
																													.append($(`<div class="times">`).append(hour0).append(`<span>:</span>`).append(minute0).append(`<span>:</span>`).append(second0));
																													
	let endDateDoms = $('<div>').addClass('inputs-groups').append($('<div>').addClass('inputs-wrapper').append(this._inputs.endDate).append(`<span class='date-icon fa fa-calendar-o'></span>`))
																													.append($(`<div class="times">`).append(hour1).append(`<span>:</span>`).append(minute1).append(`<span>:</span>`).append(second1));

	this._$wrapper.append(`<div class='item-title font-simsun'>搜索时间范围<span class="check-box-wrapper"><input type="checkbox" ${isLatestDate ? 'checked' : ''} />当前时间</span></div>`);
	let $date = $(`<div class='item-body-container date'></div>`)
							.append(startDateDoms)
							.append(`<span class='zhi'>至</span>`)
							.append(endDateDoms);

	this._$wrapper.append($date);
	//相似度过滤
	this._$wrapper.append($(`<div class="item-title font-simsun similarity">只显示相似度大于</div>`).prepend(this._inputs.similarityCheck).append(this._inputs.similaritySelect));

	//标的类型
	this._$wrapper.append(`<div class='item-title font-simsun hide'>标的类型</div>`);
	let $sidType = $(`<div class='item-body-container sid hide'></div>`)
									.append(this._inputs.typeStock)
									.append(this._inputs.typeFuture);
	this._$wrapper.append($sidType);

	//info
	let symbolStartDate = this._info.dateRange[0],
			symbolEndDate = this._info.dateRange[1];
	let dateStr1 = new Date(symbolStartDate).toISOString().slice(0, 10).replace(/-/g,'.');
	let dateStr2 = new Date(symbolEndDate).toISOString().slice(0, 10).replace(/-/g,'.');
	this._$info.append(`<p class='info-p font-simsun'><span class='title'>来源:</span><span class='content font-arial'>${this._info.symbol}</span></p>`)
							.append(`<p class='info-p font-simsun'><span class='title'>时间区间:</span><span class='content font-arial'>${dateStr1} - ${dateStr2}</span></p>`);
}

ConfigEditor.prototype._initActions = function() {
	//init date picker
	let searchConfig = this._config;
	$(this._inputs.startDate).datepicker(datePickerOptions).on('hide', (e) => { 
		let dateStr = e.format();
		searchConfig.dateRange[0].date = dateStr;
		this.onEdit();
	});
	$(this._inputs.endDate).datepicker(datePickerOptions).on('hide', (e) => { 
		let dateStr = e.format();
		searchConfig.dateRange[1].date = dateStr;
		this.onEdit();
	});
	
	//init sid type
	this._inputs.typeStock.on('click', this._clickStock.bind(this));
	this._inputs.typeFuture.on('click', this._clickFuture.bind(this));

	//init addition date
	this._inputs.reduceBars.on('click', this._clickReduceBars.bind(this));
	this._inputs.addBars.on('click', this._clickAddBars.bind(this));
	this._inputs.additionBars.on('input', this._changeBars.bind(this));

	this._inputs.startTime.hour.on('input', this._changeTime.bind(this, 0, 'hour'));
	this._inputs.startTime.minute.on('input', this._changeTime.bind(this, 0, 'minute'));
	this._inputs.startTime.second.on('input', this._changeTime.bind(this, 0, 'second'));
	this._inputs.endTime.hour.on('input', this._changeTime.bind(this, 1, 'hour'));
	this._inputs.endTime.minute.on('input', this._changeTime.bind(this, 1, 'minute'));
	this._inputs.endTime.second.on('input', this._changeTime.bind(this, 1, 'second'));
	this._$wrapper.find('.check-box-wrapper input[type="checkbox"]').on('change', this._toggleLatestTimeAuto.bind(this));

	this._inputs.similarityCheck.on('change', this._toggleSimilarityOn.bind(this));
	this._inputs.similaritySelect.on('change', this._cahngeSimilarityValue.bind(this));
}

ConfigEditor.prototype._toggleSimilarityOn = function() {
	var isOn = !this._config.similarityThreshold.on;
	this._config.similarityThreshold.on = isOn;
	this._inputs.similaritySelect.attr('disabled', !isOn);
	this.onEdit();
}

ConfigEditor.prototype._cahngeSimilarityValue = function(e) {
	var value = e.target.value;
	this._config.similarityThreshold.value = value;
	this.onEdit();
} 

ConfigEditor.prototype._toggleLatestTimeAuto = function(e) {
	this._config.isLatestDate = !this._config.isLatestDate;
	var isLatestDate = this._config.isLatestDate;
	this._inputs.endDate.attr('disabled', isLatestDate);
	this._inputs.endTime.hour.attr('disabled', isLatestDate);
	this._inputs.endTime.minute.attr('disabled', isLatestDate);
	this._inputs.endTime.second.attr('disabled', isLatestDate);
	this.onEdit()
}

ConfigEditor.prototype._changeTime = function(index, name, e) {
	let value = e.target.value || '0';
	this._config.dateRange[index][name] = value;
	this.onEdit()
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
	if(this._config.additionDate.value > 0) this._config.additionDate.value -= 1;
	this.updateBars();
	this.onEdit();
}

ConfigEditor.prototype._clickAddBars = function(e) {
	var additionDateValue = +this._config.additionDate.value;
	this._config.additionDate.value = additionDateValue + 1;
	this.updateBars();
	this.onEdit();
}

ConfigEditor.prototype._changeBars = function(e) {
	let val = $(e.target).val();
	this._config.additionDate.value = +val;
	this.updateBars();
	this.onEdit();
}

ConfigEditor.prototype.updateBars = function() {
	this._inputs.additionBars.val(this._config.additionDate.value);
}

ConfigEditor.prototype.onEdit = function(handle) {
	if(handle) {
		this._onEdit = handle;
	}else {
		this._onEdit && this._onEdit();
	}
}

module.exports = ConfigEditor;
