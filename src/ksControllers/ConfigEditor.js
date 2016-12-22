
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

function ConfigEditor(dom, searchConfig, info, watchlist) {
	adjustConfig(searchConfig);
	this._$dom = dom ? $(dom) : $(document.body);
	this._$overLay = dom ? null : $(`<div class="modal-overlay flex-center"><div class="config-modal-container">
																		<div class="close-icon"><span class="fa fa-close"></span></div>
																		<div class="modal-content-wrapper"></div>
																	</div></div>`);
	this._$wrapper = $(`<div class='modal-content-contianer config-editor-inner'></div>`);
	if(this._$overLay) {
		this._$overLay.find('.modal-content-wrapper').append(this._$wrapper);
		this._$dom.append(this._$overLay);
	} else {
		this._$dom.append(this._$wrapper);
	}
	this._config = searchConfig;
	this._watchlist = watchlist;
	this._resolution = 'D';
	this._baseBars = 1;
	if(watchlist) {
		this._resolution = watchlist.getResolution();
		this._baseBars = watchlist.getBasebars();
	}

	if(info) {
		this._$info = $(`<div class='search-info-container'></div>`);
		this._$dom.append(this._$info);
		this._info = info;
	}
	this._inputs = {
									baseBars:null,
									resolution:null,
									startDate:null, 
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

	this._inputs.baseBars = $('<input type="number" min="10" max="250" >').val(this._baseBars);
	this._inputs.resolution = $('<select><option value="D">日</option><option value="1">分钟</option></select>').val(this._resolution);
	
	this._inputs.startDate = $(`<input />`).val(d0.date);
	this._inputs.endDate = $(`<input />`).val(d1.date).attr('disabled', isLatestDate);
	this._inputs.typeStock = $(`<span class='stock fa'>股票</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.stock).toggleClass('fa-square-o', !spaceDefinition.stock);
	this._inputs.typeFuture = $(`<span class='stock fa'>期货</span>`).toggleClass('fa-check-square-o selected', spaceDefinition.future).toggleClass('fa-square-o', !spaceDefinition.future);
	this._inputs.additionBars = $(`<input min="1" max="100" type='number' />`).val(additionDate.value);
	this._inputs.reduceBars = $(`<button>-</button>`);
	this._inputs.addBars = $(`<button>+</button>`);

	let hour0 = $(`<input type="number" min="0" max="23">`).val(d0.hour);
	let minute0 = $(`<input type="number" min="0" max="59">`).val(d0.minute);
	let second0 = $(`<input type="number" min="0" max="59">`).val(d0.second);
	let hour1 = $(`<input type="number" min="0" max="23">`).val(d1.hour).attr('disabled', isLatestDate);
	let minute1 = $(`<input type="number" min="0" max="59">`).val(d1.minute).attr('disabled', isLatestDate);
	let second1 = $(`<input type="number" min="0" max="59">`).val(d1.second).attr('disabled', isLatestDate);

	this._inputs.startTime.hour = hour0;
	this._inputs.startTime.minute = minute0;
	this._inputs.startTime.second = second0;

	this._inputs.endTime.hour = hour1;
	this._inputs.endTime.minute = minute1;
	this._inputs.endTime.second = second1;

	this._inputs.similarityCheck = $('<input type="checkbox" />').prop('checked', similarityThreshold.on);
	this._inputs.similaritySelect = $('<select><option value="0.9">90%</option><option value="0.8">80%</option><option value="0.7">70%</option><option value="0.6">60%</option></select>').attr('disabled', !similarityThreshold.on).val(similarityThreshold.value);

	this._$wrapper.append(`<div class='title'>搜索配置</div>`);
	
	if(this._watchlist) {
		let dom1 = $('<span>根据最近</span>').append(this._inputs.baseBars).append('根');
		let dom2 = $('<span></span>').append(this._inputs.resolution).append('K线');
		let dom3 = $('<span>统计后向</span>').append(this._inputs.additionBars).append('根');
		this._$wrapper.append($('<div class="item-body-container watchlist font-simsun"></div>').append(dom1).append(dom2).append(dom3));
	} else {
		//统计天数
		this._$wrapper.append(`<div class='item-title font-simsun'>后向统计范围</div>`);
		let $bars = $(`<div class='item-body-container days'></div>`)
								.append($(`<div class="inputs-wrapper"></div>`).append(this._inputs.reduceBars).append(this._inputs.additionBars).append(this._inputs.addBars))
								.append(`<span class='font-simsun'>根</span>`);
		this._$wrapper.append($bars);
	}

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
	let similarity80 = !similarityThreshold.on || similarityThreshold.on && (+similarityThreshold.value < 0.8);
	this._$wrapper.append($(`<div class="item-title font-simsun similarity">只显示相似度大于</div>`).prepend(this._inputs.similarityCheck).append(this._inputs.similaritySelect).append($(`<span class="warning">(搜索结果数量可能比较小或为零)</span>`).toggleClass('hide', similarity80)));

	//标的类型
	this._$wrapper.append(`<div class='item-title font-simsun hide'>标的类型</div>`);
	let $sidType = $(`<div class='item-body-container sid hide'></div>`)
									.append(this._inputs.typeStock)
									.append(this._inputs.typeFuture);
	this._$wrapper.append($sidType);

	//确定按钮
	if(this._$overLay) {
		let $footer = $(`<div class="footer font-simsun"><button class="save-btn">保存配置</button><span class="reset-btn">重置</span></div>`);
		this._$wrapper.append($footer);
	}

	//info
	if(this._info) {
		let symbolStartDate = this._info.dateRange[0],
				symbolEndDate = this._info.dateRange[1];
		let dateStr1 = new Date(symbolStartDate).toISOString().slice(0, 10).replace(/-/g,'.');
		let dateStr2 = new Date(symbolEndDate).toISOString().slice(0, 10).replace(/-/g,'.');
		this._$info.append(`<p class='info-p font-simsun'><span class='title'>来源:</span><span class='content font-arial'>${this._info.symbol}</span></p>`)
								.append(`<p class='info-p font-simsun'><span class='title'>时间区间:</span><span class='content font-arial'>${dateStr1} - ${dateStr2}</span></p>`);
	}
}

ConfigEditor.prototype._initActions = function() {
	//init date picker
	let searchConfig = this._config;
	if($.fn.datepicker) {
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
	}
	this._inputs.baseBars.on('change', this._changeBasebars.bind(this));
	this._inputs.resolution.on('change', this._selectResolution.bind(this));
	//init sid type
	this._inputs.typeStock.on('click', this._clickStock.bind(this));
	this._inputs.typeFuture.on('click', this._clickFuture.bind(this));

	//init addition date
	this._inputs.reduceBars.on('click', this._clickReduceBars.bind(this));
	this._inputs.addBars.on('click', this._clickAddBars.bind(this));
	this._inputs.additionBars.on('change', this._changeBars.bind(this));

	this._inputs.startTime.hour.on('input', this._changeTime.bind(this, 0, 'hour'));
	this._inputs.startTime.minute.on('input', this._changeTime.bind(this, 0, 'minute'));
	this._inputs.startTime.second.on('input', this._changeTime.bind(this, 0, 'second'));
	this._inputs.endTime.hour.on('input', this._changeTime.bind(this, 1, 'hour'));
	this._inputs.endTime.minute.on('input', this._changeTime.bind(this, 1, 'minute'));
	this._inputs.endTime.second.on('input', this._changeTime.bind(this, 1, 'second'));
	this._$wrapper.find('.check-box-wrapper input[type="checkbox"]').on('change', this._toggleLatestTimeAuto.bind(this));

	this._inputs.similarityCheck.on('change', this._toggleSimilarityOn.bind(this));
	this._inputs.similaritySelect.on('change', this._changeSimilarityValue.bind(this));

	//close save & reset
	var that = this;
	if(this._$overLay) {
		this._$overLay.find('.close-icon').click(function(event) {
			that.dispose();
		});
	}
	this._$wrapper.find('.save-btn').click(this._handleSave.bind(this));
	this._$wrapper.find('.reset-btn').click(this._reset.bind(this));
	this._$wrapper.on('mouseup',function(e){
		e.stopPropagation();
	});
}

ConfigEditor.prototype._changeBasebars = function(e) {
	var baseBars = +e.target.value,
			min = +e.target.min,
			max = +e.target.max;
	if(baseBars<min) baseBars=min;
	if(baseBars>max) baseBars=max;
	e.target.value = baseBars;
	this._baseBars = baseBars;
}

ConfigEditor.prototype._selectResolution = function(e) {
	var resolution = e.target.value + '';
	this._resolution = resolution;
}

ConfigEditor.prototype._toggleSimilarityOn = function(e) {
	var isOn = !this._config.similarityThreshold.on;
	this._config.similarityThreshold.on = isOn;
	this._inputs.similaritySelect.attr('disabled', !isOn);
	this.onEdit();
	if(isOn) {
		$(e.target).siblings('.warning').toggleClass('hide', +this._config.similarityThreshold.value < 0.8);
	} else {
		$(e.target).siblings('.warning').addClass('hide');
	}
}

ConfigEditor.prototype._changeSimilarityValue = function(e) {
	var value = e.target.value;
	this._config.similarityThreshold.value = value;
	$(e.target).siblings('.warning').toggleClass('hide', +value < 0.8);
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
	let val = +$(e.target).val();
	var min = (typeof e.target.min != 'undefined' ? +e.target.min : 1);
	var max = (typeof e.target.max != 'undefined' ? +e.target.max : 100);

	if(val < min) val = min;
	if(val > max) val = max;
	this._config.additionDate.value = val;
	this.updateBars();
	this.onEdit();
}

ConfigEditor.prototype.updateBars = function() {
	this._inputs.additionBars.val(this._config.additionDate.value);
}

ConfigEditor.prototype.onEdit = function(handle) {
	if(handle) {
		this._onEdit = handle;
	} else {
		this._onEdit && this._onEdit();
	}
}

ConfigEditor.prototype._handleSave = function() {
	this._onSave && this._onSave({
		searchConfig: this._config,
		resolution: this._resolution,
		baseBars: this._baseBars
	});
	this.dispose();
}

ConfigEditor.prototype._reset = function() {
	if(this._watchlist) {
		this._config = this._watchlist.getSearchConfig();
		this._resolution = this._watchlist.getResolution();
		this._baseBars = this._watchlist.getBasebars();
		var { dateRange, additionDate, spaceDefinition, isLatestDate, similarityThreshold } = this._config;
		var d0 = dateRange[0],
				d1 = dateRange[1];

		this._inputs.baseBars.val(this._baseBars);
		this._inputs.resolution.val(this._resolution);
		this._inputs.additionBars.val(additionDate.value);

		this._inputs.startDate.val(d0.date);
		this._inputs.startTime.hour.val(d0.hour);
		this._inputs.startTime.minute.val(d0.minute);
		this._inputs.startTime.second.val(d0.second);

		this._inputs.endDate.val(d1.date).attr('disabled', isLatestDate);
		this._inputs.endTime.hour.val(d1.hour).attr('disabled', isLatestDate);
		this._inputs.endTime.minute.val(d1.minute).attr('disabled', isLatestDate);
		this._inputs.endTime.second.val(d1.second).attr('disabled', isLatestDate);
		this._$wrapper.find('.check-box-wrapper input[type="checkbox"]').prop('checked', isLatestDate);

		this._inputs.similarityCheck.prop('checked', similarityThreshold.on);
		this._inputs.similaritySelect.val(similarityThreshold.value).attr('disabled', !similarityThreshold.on);
	}
}

ConfigEditor.prototype.dispose = function() {
	if(this._$overLay) {
		this._$overLay.remove();
	} else {
		this._$wrapper.remove();
	}
}

ConfigEditor.prototype.onSave = function(handle) {
	this._onSave = handle;
}

module.exports = ConfigEditor;
