
import helperModal from './helperModal';
import crossfilter from 'crossfilter';
import PredictionWidget from '../PredictionWidget';
import BlockHeatMap from '../BlockHeatMap';
import getPrice from '../../backend/getPrice';
import OCLHTooltip from '../OCLHTooltip';
import statisticKline from '../../components/utils/statisticKline';
import request from '../../backend/request';
import config from '../../backend/config';
import watchlistController from '../watchlistController';
import LinesChart from './LinesChart';
import klineTooltip from './klineTooltip';

let { getLatestPrice, getPriceFromSina } = getPrice;

var scannerController = {};

var _$container = null;
var _$filterTable = null;
var _$listWrapper = null;
var _$listWrapperPast = null;
var _datafeed = null;
var _data = {date:'',list:[]};

var _aggregateRanges = [[-Infinity, 200],[200, 300],[300, 500],[500, 1000],[1000, 2000], [2000, Infinity]];

var _crossfilter = null; //统计信息

var _dimensions = [];
var _dimIndex = null;

//right panel
var _pieCharts = [];
var _barCharts = [];
var _$rightPane = null;

var _backtestChart = null;

//k线图
var _predictionCharts = [];
var _heatmapCharts = [];
var _resize = function() {
	_predictionCharts.forEach((chart) => {
		chart.resize();
	});
	_heatmapCharts.forEach((chart) => {
		chart.resize();
	});
};
var _tooltip = null;
var _triggerTooltip = (e) => {
	var x = e.pageX,
			y = e.pageY;
	var $item = $(e.target).closest('.item');
	var index = $item.prevAll().length;
	var predictionChart = _predictionCharts[index];
	if(predictionChart) {
		let isCursorOverBar = predictionChart.isCursorOverBar();
		if(isCursorOverBar) {
			let OCLH = predictionChart.getHoverOCLH();
			_tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3], OCLH[4])
							.setPosition(x,y,'fixed')
							.show();
		} else {
			_tooltip.hide();
		}
	}
};
var _hideTooltip = ()=>{
	_tooltip.hide();
};

var reOrderKline = (kline) => { //将[d,o,h,l,c,v] => [d,o,c,l,h,v]
	return kline.map(function(price){
		return [price[0],price[1],price[4],price[3],price[2],price[5]];
	});
};

//price updater interval
var _interval = null;
var _priceUpdaters = [];
var _priceUpdaters2 = [];
var _priceUpdate = (param, $item) => {
	var symbolInfo = $.extend({
		type: 'stock',
		symbol: '000001.SH',
	},param);
	var dataObj = $item.data().data;
	getPriceFromSina(symbolInfo, null, (data)=>{ //data: [{open,close,high,low,lastClose}]
		if(data.length == 0) return;
		var {open, close, high, low, lastClose} = data[0];
		//往期扫描的更新使用的是 过去的价格
		lastClose = dataObj.pricePast || lastClose;
		if(lastClose) {
			var upRate = (close - lastClose) / lastClose;
			let colorClass = '';
			if(upRate > 0) 
				colorClass = 'red';
			else if(upRate < 0) 
				colorClass = 'green';
			$item.find('[role="price"]').text(close && close.toFixed(2)).addClass(colorClass).animateCss('fadeIn');
			$item.find('[role="up-rate"]').text((upRate*100).toFixed(2) + '%').addClass(colorClass).animateCss('fadeIn');
			if(dataObj.pricePast) {
				dataObj.price = close;
				dataObj.upRate = upRate;
			}
		}
	}, (err)=>{
		console.warn(param, $item, err);
	});
};

//past scanner
var _pastScanner = {
	dateSelected:'',
	dataCache:{}
};
var _$sortButtons = null;
var _$selectDate = null;
window._pastScanner = _pastScanner;

//refresh watcher
var _intervalFresh = null;

var _handleAddWatchlist = function(e){
	var data = $(e.target).closest('.item').data().data;
	var symbolObj = {
		description: data.symbol,
		symbol: data.name,
		type: 'stock',
	};
	console.log(symbolObj);
	watchlistController.append(symbolObj);
}
var _handleSearchDetail = function(e){
	var now = new Date();
	var last = new Date(now - 50 * 24 * 3600 * 1000);
	var searchConfig = window.store.getState().searchConfig;
	searchConfig = $.extend(true,{},searchConfig);
	searchConfig.additionDate.value = 10;
	searchConfig.dateThreshold.on = false;
	searchConfig.isLatestDate = true;
	searchConfig.similarityThreshold = {on:true,value:0.8};
	searchConfig.vsimilarityThreshold = {on:true,value:0.6};
	searchConfig.dateRange[0].date = '1990/1/1';
	searchConfig.dateRange[1].date = last.toLocaleDateString();

	var data = $(e.target).closest('.item').data().data;
	var kline = data.pattern.kline;
	var dateRange = [];
	if(kline.length>0) {
		dateRange[0] = new Date(kline[0][0] * 1000);
		dateRange[1] = new Date(kline[kline.length - 1][0] * 1000);
	}
	
	var param = {
		symbol: data.symbol,
		kline: reOrderKline(kline),
		describe: data.name,
		dateRange: dateRange,
		bars: kline.length,
		searchConfig: searchConfig,
		dataCategory: 'cs',
		interval: 'D',
	};
	var actions = require('../../flux/actions');
	window.store.dispatch(actions.patternActions.getPatterns(param));
	
}

//初始化需要缓存的dom
var _initCache = () => {
	_$filterTable = $(`<div class="filter-wrapper">
											<div class="filter-table"><div class="filter-title"><i class="fa fa-list"></i>筛选条件</div><div class="filter-body"></div></div>
											<div class="reset-container"><span class="info"><span class="value">0</span>支股票</span><button class="flat-btn reset" disabled><span>重置筛选</span></button></div>
										</div>`);
	// _$filterTable.find('thead>tr').append(['概念','行业','总市值'].map(name=>{ return `<th>${name}</th>` }));
	
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
	_$listWrapperPast = $(`<div class="list-wrapper-past"></div>`);
	_datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);

	_pieCharts = [
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
	];
	_barCharts = [
		$(`<div class="chart-wrapper"><figcaption>概念分布图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>行业分布图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>总市值分布图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
	];
}

scannerController.init = (container) => {
	helperModal.check();
	_initCache();

	var $title = $(`<div class="title"><span>扫描</span><img src="./image/tooltip.png"/><span class="date-info"></span><button class="refresh hide flat-btn btn-red round">最新一期扫描结果已经出炉</button></div>`)
	var $left = $(`<div class="scanner-left"><div class="header"><button class="flat-btn recent active">本期扫描结果</button><button class="flat-btn past">往期扫描结果</button><span class="active-line transition-position"></span></div><div class="content"></div></div>`);
	var $right = $(`<div class="scanner-right part1"></div>`);
	var $briefing = $('<div class="inner briefing"></div>');
	var $backtest = $('<div class="inner backtest"></div>');
	$right.append($briefing).append($backtest);//.append([`<button class="flat-btn briefing">简报Briefing</button>`,`<button class="flat-btn backtest">历史回测</button>`]);

	_$container = $(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));

	var $contentRecent = $(`<div class="recent-wrapper"></div>`),
			$contentPast = $(`<div class="past-wrapper"></div>`);
	var $labels = $(`<div class="table-header"><span>代码名称</span><span>现价</span><span>涨跌幅</span><span>涨跌平均</span><span>上涨比例</span><span>行业</span><span>概念</span></div>`);
	$contentRecent.append(_$filterTable).append($labels).append(_$listWrapper)

	// $left.append(`<h4 class="sub-title">Results 结果列表</h4>`);
	// $left.append(_$filterTable);
	// $left.append(_$listWrapper);
	$contentRecent.append(`<div class="footer">
									注：选取的结果不代表其未来的绝对收益或概率；据历史回测统计，
									持续按照扫描结果进行交易操作，有相当概率跑赢基准(大盘)。
									欲了解更多关于我们的历史回测统计报告，请联系info@stone.io						
								</div>`);
	//往期扫描
	var $sortButtons = $(`<div class="table-header"></div>`)
						.append([
							'<button class="flat-btn">代码名称</button>',
							'<button class="flat-btn" index="0" data-kstooltip="扫描当日收盘价">当日收盘价</button>',
							'<button class="flat-btn" index="1">现价</button>',
							'<button class="flat-btn" index="2" data-kstooltip="现价(或者10日后收盘价)和当日收盘价相比较的变化">涨跌幅</button>',
							'<button class="flat-btn" index="3" data-kstooltip="对扫描当日的图形进行测算的涨跌平均数">时测涨跌平均数</button>',
							'<button class="flat-btn" index="4" data-kstooltip="对扫描当日的图形进行测算的上涨比例">时测上涨比例</button>',
						]);
	_$sortButtons = $sortButtons;

	$contentPast.append('<div class="toolbar"><span class="select-ct"><select class="date"></select></span><button class="flat-btn btn-red round">查看</button><div class="right"><select class="filter"></select><span class="stock-num"><span class="value">0</span>只股票</span></div></div>');
	$contentPast.append($sortButtons).append(_$listWrapperPast);

	$left.find('.content').append([$contentRecent,$contentPast]);

	//right panel
	$briefing.append(`<h4 class="sub-title">Briefing 简报</h4>`);
	var $content = $('<div class="content"></div>');
	$content.append(`<div class="scanner-info">
									<div class="row">
										<div class="col">
											<p>本期扫描根据:<span>最近<span class="value">--</span>根日线</span></p>
											<p>统计后向走势:<span><span class="value">--</span>根日线</span></p>
										</div>
										<div class="col">
											<p>搜索历史相似图形:<span>K线相似度高于<span class="value">--</span>%,成交量相似度高于<span class="value">--</span>%</span></p>
											<p>结果选取标准:<span>涨跌平均值高于<span class="value">--</span>倍标准差*</span></p>
										</div>
									</div class="row">
								</div>`);
	$content.append('<p class="clearfix">*注: 每期扫描结果的选取标准可能略有差异</p>');
	$content.append($(`<div class="row charts-container"></div>`).append([$(`<div class="col piecharts-wrapper flex-between"></div>`).append(_pieCharts), $(`<div class="col barcharts-wrapper"></div>`).append(_barCharts)]));
	$briefing.append($content);

	//backtest
	$backtest.append(`<h4 class="sub-title">基于扫描的参数配置进行的历史回测 模拟本测试走势图</h4>`);
	$content = $('<div class="content"></div>');
	$content.append(`<div class="backtest-info">
										<p>
											对目前的沪深300成分股用拱石搜索系统的相似图形平均收益率 因子进行了分层回测，<br/>
											同时也测试了一种构建有效量化决策因子的有效方法：基于分组稳定性构建多空操作策略。
										</p>
									</div>`);
	$content.append(`<div class="backtest-chart">
										<div class="chart-header">
											<div>扫描策略的历史回测benchmark的走势</div>
											<p class="legend"><span>拱石20看10策略</span><span>Benchmark</span></p>
										</div>
										<div class="chart-container"></div>
										<div><ul><li class="active">三个月</li><li>六个月</li><li>一年</li><li>三年</li></ul></div>
									</div>`);
	$backtest.append($content);

	_$rightPane = $right;

	scannerController._initActions();
	scannerController._initPast();
	scannerController._fetchData();
	_$container.find('[data-kstooltip]').ksTooltip();
};

scannerController._initActions = () => {
	_$filterTable.find('button.reset').click(function(event) {
		if(_dimIndex) {
			_dimensions.forEach(function(dim){ dim.filterAll(); });
			// _$filterTable.find('input[type="checkbox"]').prop('checked', false);
			_$filterTable.find('span.active').removeClass('active');
			_redrawFilterUI();
		}
	});
	/*
	_$container.find('.title').click(function(event) {
		scannerController._fetchData();
	});
	*/
	_$container.find('.title img').click(function(event) {
		helperModal.show();
	});
	window.addEventListener('resize',_resize);
	_interval = setInterval(()=>{
		var now = new Date();
		var hours = now.getHours();
		if(hours > 9 && hours < 15) {
			_priceUpdaters.forEach((updater)=>{ updater(); });
			_priceUpdaters2.forEach((updater)=>{ updater(); });
		}
	}, 6000);
	_intervalFresh = setInterval(()=>{       //10分钟
		var date = _data.date;
		request(config.scannerDateOptions, (latestDate)=>{
			if(latestDate) {
				if(!date || (+new Date(date) != +new Date(latestDate))) {
					_$container.find('.refresh').removeClass('hide');
				}
			}
		}, (error)=>{
			console.error(error);
		});
	}, 10 * 60 * 1000);

	_tooltip = new OCLHTooltip(_$container);

	_$container.find('button.refresh').click(function(){
		scannerController._fetchData();
	});
	_$container.find('.scanner-left .header button').click(function(e){
		$(e.target).addClass('active').siblings().removeClass('active');
		var toPast = $(e.target).hasClass('past');
		$(e.target).closest('.scanner-left').children('.content').toggleClass('past', toPast);
	});

	_backtestChart = new LinesChart(_$rightPane.find('.backtest-chart .chart-container')[0]);
	_backtestChart.test();

	_$rightPane.find('.backtest-chart li').click(function(event) {
		var $target = $(event.target);
		$target.addClass('active').siblings().removeClass('active');
	});
	_$rightPane.find('.flat-btn.briefing').click((e)=>{
		_$rightPane.removeClass('part2').addClass('part1');
	});
	_$rightPane.find('.flat-btn.backtest').click((e)=>{
		_$rightPane.removeClass('part1').addClass('part2');
	});

};

scannerController.dispose = () => {
	window.removeEventListener('resize',_resize);
	clearInterval(_interval);  //clear updater
	clearInterval(_intervalFresh);  //clear updater
};

var _updatePastSelect = () => {
	//网络请求 获取往期列表
	new Promise((resolve, reject)=>{
		//start waiting
		request(config.scannerListOptions, resolve, reject);
	}).then((res)=>{
		var dateArr = JSON.parse(res);
		var optionNodes = dateArr.map(function(date){
			return `<option>${date}</option>`;
		});
		_$selectDate.empty().append(optionNodes);
		_$selectDate.selectmenu("refresh");
		_$selectDate.next().find('.ui-selectmenu-text').text('请选择往期期数');
		_$selectDate.parent().siblings('.flat-btn.btn-red').prop('disabled',true);
	}).catch((e)=>{
		_$listWrapperPast.find('.waiting-overlay').remove();
		_$listWrapperPast.append('<div class="waiting-overlay flex-center"><span class="info">获取往期列表失败<a class="flat-btn">重试</a></span></div>');
		_$listWrapperPast.find('.waiting-overlay .flat-btn').click(()=>{
			_updatePastSelect();
		});
		console.error(e);
	});
};

// 初始化往期UI
scannerController._initPast = () => {
	var $pastWrapper = _$container.find('.past-wrapper');
	var $selectDate = $pastWrapper.find('select.date').selectmenu({width: 142}).on('selectmenuchange',function(e){
		_$selectDate.parent().siblings('.flat-btn.btn-red').prop('disabled',false);
	});
	var $submit = $pastWrapper.find('button.btn-red');
	var $selectFilter = $pastWrapper.find('select.filter');
	$selectFilter.append(['<option value="0">全部</option>','<option value="1">只看上涨</option>','<option value="2">只看下跌</option>'])
								.selectmenu({width: 130})
								.on('selectmenuchange',function(e){
									var filterType = $selectFilter.val();
									var children = _$listWrapperPast.children();
									var count = 0;
									children.each(function(i, item){
										var data = $(item).data().data;
										var isShow = filterType == 0 ? true : !(filterType == 1 ^ (data && data.price>data.pricePast));
										$(item)[isShow ? 'show' : 'hide']().css('background-color','');
										if(isShow) count++;
									});
									if(filterType != 0) {
										_$listWrapperPast.children(':visible:even').css('background-color','#272A2D');
										_$listWrapperPast.children(':visible:odd').css('background-color','transparent');
									}
									_$container.find('.stock-num .value').text(count);
								});

	$submit.click(function(e){
		var date = $selectDate.val();
		_pastScanner.dateSelected = date;
		scannerController._fetchPastData();
	});
	//缓存
	_$selectDate = $selectDate;

	var handleSort = function(e){
		var $btn = $(e.currentTarget);
		var $nodes = _$listWrapperPast.children();

		var sortKeys = ['pricePast','price','upRate','meanPast','upRatePast'];
		var sortIndex = $btn.attr('index');
		var sortKey = sortKeys[sortIndex];
		var sortType = '';
		//reset other btns
		$btn.siblings().removeClass('asc desc');

		if($btn.hasClass('asc')) sortType = 'asc';
		if($btn.hasClass('desc')) sortType = 'desc';
		//sort
		$nodes = $nodes.sort(function(a,b){
			var data1 = $(a).data().data;
			var data2 = $(b).data().data;
			if(sortType == '') {
				return data1.index - data2.index;
			} else if(sortType == 'asc') {
				return data1[sortKey] - data2[sortKey];
			} else {
				return data2[sortKey] - data1[sortKey];
			}
		});
		$nodes.appendTo(_$listWrapperPast);
	};

	_$sortButtons.find('button').each(function(i,btn){
		var $btn = $(btn);
		if($btn.attr('index') === undefined) {
			$btn.prop('disabled',true);
		} else {
			$btn.sortButton().click(handleSort);
		}
	});

	_updatePastSelect();
};

scannerController._fetchPastData = () => {
	var date = _pastScanner.dateSelected;
	//先看有没有缓存
	var dataCache = _pastScanner.dataCache;
	if(dataCache[date]) {
		var data = dataCache[date].data;
		var list = data.list;
		var nodes = list.map(function(data){
			return $(`<div class="item"><div class="section1"></div></div>`).data({data});
		});
		_$listWrapperPast.empty().append(nodes);
		_updatePastList();
		
	} else {  //获取新数据
		var option = config.scannerQueryOptions(date);

		new Promise((resolve, reject)=>{
			//start waiting
			_$listWrapperPast.empty().find('.waiting-overlay').remove();
			_$listWrapperPast.append('<div class="waiting-overlay flex-center"><i class="fa fa-spin fa-circle-o-notch"></i></div>');
		
			request(option, resolve, reject);
		}).then((res)=>{
			var res = JSON.parse(res); //res: {sids:,EVs,hitRates,industries,prices0,prices10}
			var { sids, EVs, hitRates, industries, prices0, prices10, config } = res;
			var list = [];
			for(var i=0; i<sids.length; i++) {
				var data = {
					index: i,
					name: industries[i].secShortName,
					symbol: sids[i],
					pricePast: prices0[i][4],
					price: prices10[i].close,
					upRate: 0,
					meanPast: EVs[i],
					upRatePast: hitRates[i],
					kline: null
				};
				if(data.price) {
					data.upRate = (data.price - data.pricePast) / data.pricePast;
				}
				list.push(data);
			}
			var nodes = list.map(function(data){
				return $(`<div class="item"><div class="section1"></div></div>`).data({data});
			});
			_$listWrapperPast.find('.waiting-overlay').remove();
			_$listWrapperPast.empty().append(nodes);
			
			var cache = {data:{list:list,config}};
			dataCache[date] = cache;
			_updatePastList();

		}).catch((err)=>{
			_$listWrapperPast.find('.waiting-overlay').html('<span class="info">获取数据失败</span>');
			console.error(err);
		});
		// var list = [1,1,1,1,1,1,1,1,1].map(function(d, i){
		// 	var data = {
		// 		index: i,
		// 		name: Math.random() > 0.5 ? '浦发银行' : '恒瑞医药',
		// 		symbol: '600000.SH',
		// 		pricePast: Math.random()*2 + 15,
		// 		price: Math.random()*10,
		// 		upRate: 0,
		// 		meanPast: Math.random()*10 - 5,
		// 		upRatePast: Math.random()*100,
		// 		kline: null,                          //最近30根K线
		// 	};
		// 	data.upRate = (data.price - data.pricePast) / data.pricePast;
		// 	return data;
		// });
	}
};

scannerController._fetchData = () => {
	_data.list = [];
	_data.date = '';
	scannerController._update();

	var fetch = () => {
		var data = {
			date: '',
			list: [],
		};

		for(var i=0,len=originData.sids.length; i<len; i++) {
			var closePrices = originData.cps[i];
			var earns = closePrices.map((closePrice)=>{
				var len = closePrice.length;
				return (closePrice[len-1] - closePrice[0]) / closePrice[0];
			});
			var item = {
				index: i,
				symbol: originData.sids[i],
				name: names[Math.round(Math.random() * 5)],
				industry: originData.industries[i].industry1,
				subIndustry: originData.industries[i].industry2,
				meta: {
					fullName: '上海浦东发展银行股份有限公司',
				},
				pattern: {
					closePrice: originData.cps[i],
					kline: originData.patterns[i].data,
				},
				statistic: statisticKline(earns),
				aggregateValue: Math.round(Math.random() * 2000),

			}
			data.list.push(item);
		}

		return data;
	}
	var convertData = (originData) => {
		var data = {
			date: originData.today || '',
			list: [],
			options: {
				baseBars: originData.config && originData.config.dBack || 20,
				prediction: originData.config && originData.config.dCome || 10,
				similarityThreshold: 0.8,
				vsimilarityThreshold: 0.6,
				STDRate: 1,
			}
		};
		var len = originData.sids.length;
		for(var i=0; i<len; i++) {
			var industries = originData.industries[i];
			var latestData = originData.latestData[i];
			var jiejin_info = originData.jiejin_info[i]; //解禁信息
			var concepts = originData.concepts[i];
			var closePrices = originData.cps[i];
			var earns = closePrices.map((closePrice)=>{
				var len = closePrice.length;
				return (closePrice[len-1] - closePrice[0]) / closePrice[0];
			});
			var item = {
				index: i,
				symbol: originData.sids[i],
				name: industries.secShortName,
				industry: industries.industryName1,
				subIndustry: industries.industryName2,
				categoryIndustry: concepts[0] && concepts[0].word || '未知',
				categoryConcept: concepts[1] && concepts[1].word || '未知',    //概念分类
				meta: {
					fullName: industries.secFullName,
					turnoverRate: originData.turnoverRate[i],   //换手率
					PE: latestData.PE,													//市盈率
					PE1: latestData.PE1, 												//市盈率动
					PB: latestData.PB, 													//市净率
					jiejin: jiejin_info,                 			 //解禁信息

				},
				pattern: {
					closePrice: originData.cps[i],
					kline: originData.patterns[i],
				},
				statistic: statisticKline(earns),
				aggregateValue: latestData.marketValue
			};
			data.list.push(item);
		}
		return data;
	};
	var beforeFetch = () => {
		_$listWrapper.find('.waiting-overlay').remove();
		_$listWrapper.append('<div class="waiting-overlay flex-center"><i class="fa fa-spin fa-circle-o-notch"></i></div>');
		_$container.find('.scanner-info .value').text('--');
	};
	var afterFetch = (originData) => {
		originData = JSON.parse(originData);
		var data = convertData(originData);
		_data = data;
		// window._data = data;
		scannerController._update();
	};
	var failFetch = (error) => {
		console.error(error);
		var errorDom = $(`<div class="waiting-overlay flex-center error red"><i class="fa fa-warning"></i><span>更新失败!</span><a class="flat-btn">重试</a></div>`);
		errorDom.find('a.flat-btn').click(()=>{
			scannerController._fetchData();
		});
		_$listWrapper.find('.waiting-overlay').remove();
		_$listWrapper.append(errorDom);
	};

	beforeFetch();
	// setTimeout(()=>{
	// 	if(Math.random()>0) {
	// 		afterFetch(fetch());
	// 	} else {
	// 		failFetch();
	// 	}
	// },200);
	request(config.scannerOptions, afterFetch, failFetch);
};

scannerController._update = () => {
	var data = _data;
	var list = data.list;

	//统计信息
	_updateDimensions();
	//reset
	_predictionCharts = [];        //clear charts
	_priceUpdaters = [];
	//remove list
	_$listWrapper.empty();

	var $list = list.map(function(item){
		var dom = $(`<div class="item">
									<div class="section1"></div>
									<div class="section2"></div>
									<button class="flat-btn detail"><i class="fa fa-play"></i><span class="name"></span></button>
							</div>`)
							.data({data: item});
		return dom;
	});
	_$listWrapper.append($list);
	_updateList();

	//update filter UI
	_updateFilterTable();

	//update right
	_updateRightPanel();

	//update title
	_$container.find('.date-info').text(_data.date ? (_data.date + '期扫描结果') : '');

	_priceUpdaters.forEach((updater)=>{ updater(); });
	_$rightPane.find('.result-number').text(list.length);
	_$container.find('.refresh').addClass('hide');
}
function _updateDimensions() {
	var newDims = _generateDimensions();
	_crossfilter = newDims.crossfilter;
	_dimensions = newDims.dimensions;
	_dimIndex = newDims.dimIndex;
}
function _generateDimensions() {
	//板块, 行业, 总市值, 成交量
	var list = _data.list;
	var crossf = crossfilter(list);
	var _dimCategory = crossf.dimension((data)=>{
		return data.categoryConcept;
	});
	var _dimIndustry = crossf.dimension((data)=>{
		return data.industry;
	});
	var _dimAggregateValue = crossf.dimension((data)=>{
		var ranges = _aggregateRanges;
		var aggregateValue = data.aggregateValue / 1E8;
		for(var i=0; i<ranges.length; i++) {
			if(aggregateValue >= ranges[i][0] && aggregateValue < ranges[i][1]) {
				return ranges[i];
			}
		}
	});
	// var _dimVolume = crossf.dimension((data)=>{
	// 	var ranges = [[-Infinity, 5],[5, 10],[10, 20],[20, 50],[50, 100],[100, Infinity]];
	// 	var volume = data.volume;
	// 	for(var i=0; i<ranges.length; i++) {
	// 		if(volume >= ranges[i][0] && volume < ranges[i][1]) {
	// 			return ranges[i];
	// 		}
	// 	}
	// });
	var dimIndex = crossf.dimension((data)=>{
		return data.index;
	});
	var dimensions = [_dimCategory, _dimIndustry, _dimAggregateValue];

	return {
		crossfilter: crossf,
		dimensions: dimensions,
		dimIndex: dimIndex,
	};
}

var dimsToGroups = (dimensions) => {
	var groups = dimensions.map((dim, i)=>{
		var group = dim.group().all();
		if(i>1) {  //总市值, 交易量
			return group.sort((a,b)=>{ return a.key[0] - b.key[0] });
		}
		return group;
	});
	//总市值 固定为6条
	var ranges = _aggregateRanges;
	var aggregateGroup = groups[2];
	if(aggregateGroup.length > 0 && aggregateGroup.length < ranges.length) {
		for(var i=0; i<ranges.length; i++) {
			var key = ranges[i].concat([]);
			var keyS = JSON.stringify(key);
			var item = aggregateGroup[i];
			if(!item || (JSON.stringify(item.key) != keyS)) {
				var newItem = {key:key, value:0};
				aggregateGroup.splice(i,0,newItem); //插入
			}
		}
	}

	return groups;
};
//table row click
var _onFilter = (event) => {
	var $cur = $(event.currentTarget);
	if($cur.hasClass('disabled')) {
		return;
	}
	// var $curCheckbox = $cur.find('input[type="checkbox"]');
	// $curCheckbox.prop('checked', !$curCheckbox.prop('checked'));
	// $cur.toggleClass('active', $curCheckbox.prop('checked'));
	$cur.toggleClass('active');

	var $table = $cur.closest('.body');
	var $trChecked = $table.children('.active');
	var filterArr = [];
	$trChecked.each((index, ele)=>{
		filterArr.push(JSON.stringify($(ele).data().key));
	});
	var dim = $table.data().dim;
	if(filterArr.length > 0) {
		dim.filter((key)=>{
			return filterArr.indexOf(JSON.stringify(key)) > -1 ;
		});
	} else {
		dim.filterAll();
	}
	_redrawFilterUI();
};

function _redrawFilterUI() {
	//update UI
	var groups = dimsToGroups(_dimensions);
	var $tables = _$filterTable.find('.filter-body .body');
	groups.forEach((group, i)=>{
		var $table = $($tables[i]);
		var $rows = $table.children();
		group.forEach((obj, j)=>{
			updateTr($($rows[j]).data(obj));
		});
	});
	//filter list view
	_filterList();
}
var aggregateFormatter = (key) => {
		var unit = '亿';
		var str = '';
		if(key[0] == -Infinity) {
			str = '小于' + key[1];
		} else if(key[1] == Infinity) {
			str = '大于' + key[0];
		} else {
			str = key[0] + '-' + key[1];
		}
		str += unit;
		return str;
};

function updateTr($span) {
	var { key, value } = $span.data();
	if($.isArray(key)) {
		key = aggregateFormatter(key);
	}
	$span.find('i:nth-child(1)').html(`<span>${key}</span>`);
	$span.find('i:nth-child(2)').html(`<span>${value}</span>`);
	$span.toggleClass('disabled', value <= 0);
	$span.attr('title',key);
	return $span;
}
function _updateFilterTable() {
	var dims = _dimensions;
	var names = ['概念','行业','总市值'];
	var filters = dimsToGroups(_dimensions);
	var tables = filters.map((group, i)=>{
		var $table = $(`<div><div class="name"><span>${names[i]}</span><span><hr/><hr/></span></div><div class="body"></div></div>`);
		$table.find('.body').data('dim',dims[i]).append(group.map(item=>{
			var $span =  $(`<span><i></i><i></i></span>`).data(item).click(_onFilter);
			// var $span =  $(`<span><input type="checkbox"/><label></label><i></i><i></i></span>`).data(item).click(_onFilter);
			return updateTr($span);
		}));
		return $table;
	});
	_$filterTable.find('.filter-body').empty().append(tables);
}
//更新往期列表
function _updatePastList() {
	var date = _pastScanner.dateSelected;
	var config = _pastScanner.dataCache[date] && _pastScanner.dataCache[date].data.config;
	var prediction = config && config.dCome || 10;
	var $list = _$listWrapperPast.children();
	_priceUpdaters2 = [];
	for(var i=0; i<$list.length; i++) {
		var $item = $($list[i]);
		var dataObj = $item.data().data;
		var {name, symbol, pricePast, price, meanPast, upRatePast, kline} = dataObj;
		var upRate = price && (price - pricePast)/price;
		var children = [
			`<span class="kline-tooltip"><div>${name}</div><div>${symbol}</div></span>`,
			`<span><div>${pricePast.toFixed(2)}</div></span>`,
			`<span><div role="price">${price && price.toFixed(2) || '--'}</div></span>`,
			`<span><div role="up-rate" class=${upRate && (upRate>=0 ? 'red':'green')}>${(upRate !== undefined && (upRate * 100).toFixed(2) || '--') + '%'}</div></span>`,
			`<span><div class=${meanPast>=0 ? 'red':'green'}>${(meanPast*100).toFixed(2) + '%'}</div></span>`,
			`<span><div class=${upRatePast>=0 ? 'red':'green'}>${(upRatePast*100).toFixed(2) + '%'}</div></span>`,
		];
		$item.find('.section1').append(children);
		if(!price) {
			_priceUpdaters2.push(_priceUpdate.bind(null, {symbol:symbol}, $item));
		}
	}
	var str = _priceUpdaters2.length == 0 ? `${prediction}天后收盘价` : '现价';
	_$sortButtons.find('button:nth-child(3)').contents()[0].textContent = str;

	_priceUpdaters2.forEach(function(updater){ updater(); });
	//other update
	_$container.find('select.filter').val('0').selectmenu('refresh');
	_$container.find('.stock-num .value').text($list.length);
	_$sortButtons.find('button.sort-btn').removeClass('asc desc');
	_$sortButtons.find('button:nth-child(4)').data('kstooltip', str + '和当日收盘价相比较的变化');
	_$sortButtons.find('button:nth-child(5)').trigger('click').trigger('click');
	//初始化k线弹出框
	klineTooltip($list.find('.kline-tooltip'));
}
//更新股票列表
function _updateList() {
	var $list = _$listWrapper.children();
	$list.on('mouseout',_hideTooltip);

	var handleClick = (e) => {

	};
	var expandItem = (e) => {
		var $item = $(e.target).closest('.item');
		$item.toggleClass('expand');
		// $item.find('button .name').text($item.hasClass('expand') ? '折叠' : '展开');
	};
	for(var i=0; i<$list.length; i++) {
		var $item = $($list[i]);
		var dataObj = $item.data().data;
		var { name, symbol, meta, categoryIndustry, categoryConcept, industry, subIndustry, statistic, aggregateValue, jiejin } = dataObj;

		var section1Children = [
			`<span><div>${name}</div><div>${symbol}</div></span>`,
			`<span><div role="price">${'--'}</div></span>`,
			`<span><div role="up-rate">${'--'}</div></span>`,
			`<span><div class=${statistic.mean>=0 ? 'red' : 'green'}>${(statistic.mean*100).toFixed(2)+'%'}</div></span>`,
			`<span><div class="red">${(statistic.upPercent*100).toFixed(1)+'%'}</div></span>`,
			`<span><div>${industry}</div><div>${subIndustry}</div></span>`,
			`<span><div>${categoryIndustry}</div><div>${categoryConcept}</div></span>`,
		];
		//section1
		$item.find('.section1').append(section1Children);
		
		//section2
		var $predictionPane = $(`<div class="prediction-wrapper"><div class="chart"><div class="prediction-chart"></div><div class="heatmap-chart"></div></div><div class="statistic flex-around"></div></div>`);
		var $infoPane = $(`<div class="info-wrapper"><div class="info-container"></div><button class="flat-btn btn-red round">加入智能监控</button><button class="flat-btn btn-dark round">详细搜索结果</button></div>`);
		$item.find('.section2').append([$predictionPane, $infoPane]);
				//charts
		var predictionChart = new PredictionWidget($predictionPane.find('.prediction-chart')[0], {showRange: false, slient: true, axis: true, padding: {right: 70}});
		var heatmapChart = new BlockHeatMap($predictionPane.find('.heatmap-chart')[0], {textColor: '#999'});
		predictionChart.setData(reOrderKline(dataObj.pattern.kline), dataObj.pattern.closePrice, null, 10);
		var {yMin, yMax} = predictionChart.getLineChartMinMax();
		var labelDecimal = 3;
		heatmapChart.setData(predictionChart.getLastPrices(), yMin, yMax, {labelDecimal});

		_predictionCharts.push(predictionChart);
		_heatmapCharts.push(heatmapChart);
				//statistic
		/*
		var nodes = [
			`<span><div>上涨比例</div><div class="red">${(statistic.upPercent*100).toFixed(1)+'%'}</div></span>`,
			`<span><div>下跌比例</div><div class="red">${(statistic.downPercent*100).toFixed(1)+'%'}</div></span>`,
			`<span><div>涨跌平均</div><div class=${statistic.mean>=0 ? 'red' : 'green'}>${(statistic.mean*100).toFixed(2)+'%'}</div></span>`,
			`<span><div>涨跌中位数</div><div class=${statistic.median>=0 ? 'red' : 'green'}>${(statistic.median*100).toFixed(2)+'%'}</div></span>`,
		];*/
		var nodes = [];
		$predictionPane.find('.statistic').append(nodes);
				//info sections
		var infoNodes = [
			[
				`<div class="full-name" title="${dataObj.meta.fullName}">${dataObj.meta.fullName}</div>`,
				/*`<div><span title=${dataObj.industry}>${dataObj.industry}</span><span title=${dataObj.subIndustry}>${dataObj.subIndustry}</span></div>`,
				`<div><span title=${dataObj.categoryIndustry}>${dataObj.categoryIndustry}</span><span title=${dataObj.categoryConcept}>${dataObj.categoryConcept}</span></div>`,*/
			],
			[
				`<div><span class="des">近10日平均换手率:</span><span>${meta.turnoverRate.toFixed(2)}%</span></div>`,
				`<div><span class="des">总市值:</span><span>${$.keyStone.amountFormatter(aggregateValue)}</span></div>`,
				`<div><span class="des">市盈率:</span><span>${meta.PE}</span></div>`,
				`<div><span class="des">市盈率[动]:</span><span>${meta.PE1}</span></div>`,
				`<div><span class="des">市净率:</span><span>${meta.PB}</span></div>`,
			],
			(meta.jiejin.date ?
				[
					`<div><span class="des">最新解禁:</span><span>${meta.jiejin.date || '--'}</span></div>`,
					`<div><span class="des">解禁数量:</span><span>${meta.jiejin.number ? ($.keyStone.amountFormatter(meta.jiejin.number)+'股') : '--'}</span></div>`,
					`<div><span class="des">占总股本比例:</span><span>${meta.jiejin.rate_percent || '--'}%</span></div>`,
				]
				:
				[`<div><span class="des no-jiejin">近期或无解禁信息</span>`]
			)
		];
		var $infoContainer = $infoPane.find('.info-container');
		infoNodes.forEach((nodeArr) => {
			$infoContainer.append($('<div class="info-section"></div>').append(nodeArr));
		});
		//others
		$item.find('button.detail').click(expandItem);
		//udpater
		_priceUpdaters[i] = _priceUpdate.bind(null, {symbol:dataObj.symbol}, $item);
		//buttons actions
		$infoPane.find('.btn-red').click(_handleAddWatchlist);
		$infoPane.find('.btn-dark').click(_handleSearchDetail);
	}

	_$filterTable.find('.info .value').text($list.length);
	_$filterTable.find('button.reset').prop('disabled',true);
	//init tooltip trigger
	$list.find('.main-wrapper').on('mousemove', _triggerTooltip);
};
//filter list 
function _filterList() {
	var filteredList = _dimIndex.top(Infinity);
	var ids = filteredList.map((item)=>{ return item.index });
	_$listWrapper.children().each((i, ele)=>{
		var data = $(ele).data().data;
		var index = data.index;
		$(ele).toggleClass('hide', ids.indexOf(index) == -1);
	});
	_$listWrapper.children(':visible:even').css('background-color','#272A2D');
	_$listWrapper.children(':visible:odd').css('background-color','transparent');
	_$filterTable.find('.info .value').text(filteredList.length);
	_$filterTable.find('button.reset').prop('disabled',!(_$listWrapper.children('.hide').length>0));
}

//update right panel
function _updateRightPanel() {
	var list = _data.list;
	var options = _data.options;
	var newDims = _generateDimensions();
	var dimensions = newDims.dimensions;
	var dimIndex = newDims.dimIndex;
	var groups = dimsToGroups(dimensions);

	var total = dimIndex.top(Infinity).length;
	var tops = groups.map((group)=>{
		var maxValueObj = group.reduce((pre, cur)=>{
			return cur.value > pre.value ? cur : pre;
		},{value:0});
		return maxValueObj;
	});
	_pieCharts.forEach(function(chart, i){
		var caption = tops[i].key;
		if(typeof caption == 'object') {
			caption = aggregateFormatter(caption);
		}
		$(chart).svgPercent({count:tops[i].value, total:total, caption:caption});
	});
	_barCharts.forEach((chart, i)=>{
		var keyFormatter = null;
		if(i==2) {
			keyFormatter = aggregateFormatter;
		}
		$(chart).barChart({data:groups[i], keyFormatter:keyFormatter});
	});

	//update options UI
	var _$infoValues = _$container.find('.scanner-info .value');
	options && [options.baseBars, options.prediction, options.similarityThreshold*100, options.vsimilarityThreshold*100, options.STDRate].forEach(function(num,i){
		$(_$infoValues[i]).text(num);
	});
}

module.exports = scannerController;
