
import SymbolListDropDown from './SymbolListDropDown';
import messager from '../messager';

var watchlistGuide = {};

watchlistGuide.start = (callback) => {
	let overlay = $(`<div class="modal-overlay font-msyh flex-center"></div>`);
	let modal = $(`<div class="watchlist-guide-container"></div>`);
	let contentWrapper = $(`<div class="inner-wrapper"></div>`);
	let $header = $(`<div class="header"><img src="./image/check_green.png" class="hide"/><h4 class="h4"></h4></div>`);
	let $body = $(`<div class="body"></div>`);
	let $footer = $(`<div class="footer"></div>`);

	contentWrapper.append($header).append($body).append($footer);
	modal.append(contentWrapper);
	overlay.append(modal);
	$(document.body).append(overlay);

	watchlistGuide._$header = $header;
	watchlistGuide._$body = $body;
	watchlistGuide._$footer = $footer;
	watchlistGuide._$overlay = overlay;
	watchlistGuide._callback = callback;

	var searchConfig = null;
	try {
		var store = require('../../store');
		searchConfig = $.extend(true, {}, store.getState().searchConfig);
	} catch(e) {
		console.error(e);
		var now = new Date();
		searchConfig = {
										additionDate: {type:'days', value:7},
										searchSpace: '000010',
										dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
										isLatestDate: true,
										similarityThreshold: {value: 0.6, on:true},
										vsimilarityThreshold: {value: 0.6, on:false},
										spaceDefinition: { stock: true, future: false },
										matchType: '形态',
										searchLenMax: 200
									};
	}

	searchConfig.similarityThreshold.value = 0.6;
	searchConfig.similarityThreshold.on = true;
	searchConfig.vsimilarityThreshold.value = 0.6;
	searchConfig.vsimilarityThreshold.on = false;

	watchlistGuide._data = {list:[],resolution:'D',baseBars:30,
														searchConfig: searchConfig
													};
	watchlistGuide._dataFeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);

	watchlistGuide._step1();
};

watchlistGuide._step1 = function() {
	let $header = watchlistGuide._$header,
			$body = watchlistGuide._$body,
			$footer = watchlistGuide._$footer;
	$header.find('h4').text('欢迎使用拱石的新功能——智能监控Watchlist');
	$body.append('<p><b>将关注的标的加入智能监控</b><br/>将您关注的标的加入智能监控, 我们将实时监控他们的走势并持续对<br/>它们进行搜索和统计。</p>')
	$body.append(`<div class="add-input-wrapper">
									<div class="inputs-group-wrapper">
										<span class="inputs-group"><span class="search-icon"></span><input role="input" placeholder="期货,股票,指数"/><button role="submit" class="flat-btn border-btn">添加</button></span>
									</div>
								</div>`);
	$body.append(`<div class="add-symbol-list"></div>`);
	
	var _remove = function(e) {
		var symbolInfo = $(e.target).parent().data();
		//remove at list
		var list = watchlistGuide._data.list;
		for(var i=0; i<list.length; i++) {
			if(list[i].symbolInfo.symbol === symbolInfo.symbol) {
				list.splice(i,1);
			}
		}
		//remove node
		$(e.target).parent().remove();
	}
	
	watchlistGuide._data.list.map(function(e){
		var symbolInfo = e.symbolInfo;
		var listItem = $(`<span class="symbol-item"><span>${symbolInfo.ticker}</span><span>${symbolInfo.symbol}</span><button class="flat-btn icon-btn-15 icon-close"></button></span>`).data(symbolInfo);
		listItem.find('.icon-close').click(_remove);
		$body.find('.add-symbol-list').append(listItem);
	});


	var _append = function(symbolObj) {
		console.log(symbolObj);
		let list = watchlistGuide._data.list;
		if(list.length >= 20) {
			//message
			messager.showWarningMessage("超过上限20个!");
			return;
		}
		//先查看有没有重复的
		for(var i=0; i<list.length; i++) {
			if(list[i].symbolInfo.ticker == symbolObj.symbol) {
				return;
			}
		}
		var symbolInfo = {ticker:symbolObj.symbol, symbol:symbolObj.description, exchange:symbolObj.exchange, type:symbolObj.type, instrument:symbolObj.instrument};
		list.push({symbolInfo});
		var listItem = $(`<span class="symbol-item"><span>${symbolInfo.ticker}</span><span>${symbolInfo.symbol}</span><button class="flat-btn icon-btn-15 icon-close"></button></span>`).data(symbolInfo);
		listItem.find('.icon-close').click(_remove);
		$body.find('.add-symbol-list').find('.warn').remove();
		$body.find('.add-symbol-list').append(listItem);
	};


	var $inputsWrapper = $body.find('.inputs-group-wrapper');
	var _dropDown = new SymbolListDropDown({
		wrapper: $inputsWrapper, 
		dataFeed: watchlistGuide._dataFeed,
		onSubmit: _append,
	});

	$footer.append($(`<button class="flat-btn border-btn">下一步</button>`).click(function(e){
		if(watchlistGuide._data.list.length == 0) {
			var $target = $body.find('.add-symbol-list');
			if($target.find('.warn').length == 0) {
				$target.append(`<p class="warn"><img src="./image/cuowu.png"/>  请至少添加一个标的!</p>`);
			}
		} else {
			watchlistGuide._step2();
		}
	}));
	$footer.append($(`<a class="flat-btn primary">&gt;&gt;暂时不添加</a>`).click(function(){
		watchlistGuide._end();
	}));
	$footer.append(`<p>您不再需要对每一支关注的标的手动进行重复搜索， 在每次启动拱石<br/>时，我们会为您呈现智能监控中所有标的的重复统计数据。</p>`);
}

watchlistGuide._step2 = function() {

	let $header = watchlistGuide._$header,
			$body = watchlistGuide._$body,
			$footer = watchlistGuide._$footer,
			$overlay = watchlistGuide._$overlay;

	// $overlay.find('.inner-wrapper').css('opacity',0);
	$body.empty();
	$footer.empty();
	$header.find('h4').html('非常好!  现在请您设置搜索统计的条件。');
	$header.find('img').removeClass('hide');

	var searchConfig = watchlistGuide._data.searchConfig,
			resolution = watchlistGuide._data.resolution,
			baseBars = watchlistGuide._data.baseBars;

	var ConfigEditor = require('../ConfigEditor');
	var configEditor = new ConfigEditor($body, searchConfig, null, null, {resolution,baseBars});

	$footer.append($('<button class="flat-btn border-btn btn-red">开始体验</button>').click(function(){
		var {searchConfig, resolution, baseBars} = configEditor.getConfig();
		console.log(searchConfig, resolution, baseBars);
		watchlistGuide._data.searchConfig = searchConfig;
		watchlistGuide._data.resolution = resolution;
		watchlistGuide._data.baseBars = baseBars;

		watchlistGuide._end();
	}));
	$footer.append(`<p>您可以设置参数条件, 根据最近多少根K线的走势图形进行匹配搜索<br/>统计后向多少根K线的走势数据</p>`);
	// setTimeout(function(){
	// 	$overlay.find('.inner-wrapper').css('opacity',1);
	// },100);
}

watchlistGuide._end = function() {
	watchlistGuide._$overlay.remove();
	watchlistGuide._$header = null;
	watchlistGuide._$body = null;
	watchlistGuide._$footer = null;
	watchlistGuide._$overlay = null;
	//添加默认值
	if(watchlistGuide._data.list.length == 0) {
		watchlistGuide._data.list = [
																{
																	symbolInfo:{
																		symbol: '000001.SH',
																		ticker: '上证综合指数',
																		type: 'index',
																		exchange: '',
																		instrument: '',  //记录期货的主力合约
																	}
																},{
																	symbolInfo:{
																		symbol: '399106.SZ',
																		ticker: '深证综合指数',
																		type: 'index',
																		exchange: '',
																		instrument: '',
																	}
																}
															];
	}
	watchlistGuide._callback && watchlistGuide._callback(watchlistGuide._data);
}

module.exports = watchlistGuide;
