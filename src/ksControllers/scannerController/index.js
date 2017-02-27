
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

let { getLatestPrice, getPriceFromSina } = getPrice;

var scannerController = {};

var _$container = null;
var _$filterTable = null;
var _$listWrapper = null;
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
var _priceUpdate = (param, $item) => {
	var symbolInfo = $.extend({
		type: 'stock',
		symbol: '000001.SH',
	},param);
	getPriceFromSina(symbolInfo, null, (data)=>{ //data: [{open,close,high,low,lastClose}]
		if(data.length == 0) return;
		var {open, close, high, low, lastClose} = data[0];
		if(lastClose) {
			var upRate = (close - lastClose) / lastClose;
			let colorClass = '';
			if(upRate > 0) 
				colorClass = 'red';
			else if(upRate < 0) 
				colorClass = 'green';
			$item.find('[role="price"]').text(close).addClass(colorClass).animateCss('fadeIn');
			$item.find('[role="up-rate"]').text((upRate*100).toFixed(2) + '%').addClass(colorClass).animateCss('fadeIn');
		}
	}, (err)=>{
		console.warn(param, $item, err);
	});
};

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
											<div class="filter-table"><table><thead><tr></tr></thead><tr></tr><tbody></tbody></table></div>
											<div class="reset-container"><span class="info"><span class="value">0</span>支股票</span><button class="flat-btn reset"><span>重置筛选</span></button></div>
										</div>`);
	_$filterTable.find('thead>tr').append(['概念','行业','总市值'].map(name=>{ return `<th>${name}</th>` }));
	
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
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

	var $title = $(`<div class="title"><span>扫描</span><img src="./image/tooltip.png"/><span class="date-info"></span><button class="refresh hide flat-btn btn-red">最新一期扫描结果已经出炉</button></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	_$container = $(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));


	$left.append(`<h4 class="sub-title">Results 结果列表</h4>`);
	$left.append(_$filterTable);
	$left.append(_$listWrapper);
	$left.append(`<div class="footer">
									注：选取的结果不代表其未来的绝对收益或概率；据历史回测统计，
									持续按照扫描结果进行交易操作，有相当概率跑赢基准(大盘)。
									欲了解更多关于我们的历史回测统计报告，请联系info@stone.io						
								</div>`);


	//right panel
	$right.append(`<h4 class="sub-title">Briefing 简报</h4>`);
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
	$right.append($content);

	_$rightPane = $right;

	scannerController._initActions();
	scannerController._fetchData();
};

scannerController._initActions = () => {
	_$filterTable.find('button.reset').click(function(event) {
		if(_dimIndex) {
			_dimensions.forEach(function(dim){ dim.filterAll(); });
			_$filterTable.find('input[type="checkbox"]').prop('checked', false);
			_$filterTable.find('tr.active').removeClass('active');
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
		if(hours > 9 && hours < 17) {
			_priceUpdaters.forEach((updater)=>{ updater(); });
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
};

scannerController.dispose = () => {
	window.removeEventListener('resize',_resize);
	clearInterval(_interval);  //clear updater
	clearInterval(_intervalFresh);  //clear updater
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
				baseBars: 20,
				prediction: 10,
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
									<button class="flat-btn detail"><i class="fa fa-play"></i><span class="name">展开</span></button>
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
	var $curCheckbox = $cur.find('input[type="checkbox"]');
	$curCheckbox.prop('checked', !$curCheckbox.prop('checked'));
	$cur.toggleClass('active', $curCheckbox.prop('checked'));

	var $table = $cur.closest('table');
	var $trChecked = $table.find('tr').has(':checked');
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
	var $tables = _$filterTable.find('td table');
	groups.forEach((group, i)=>{
		var $table = $($tables[i]);
		var $rows = $table.find('tr');
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

function updateTr($tr) {
	var { key, value } = $tr.data();
	if($.isArray(key)) {
		key = aggregateFormatter(key);
	}
	$tr.find('td:nth-child(2)').html(`<span>${key}</span>`);
	$tr.find('td:nth-child(3)').html(`<span>${value}</span>`);
	$tr.toggleClass('disabled', value <= 0);
	return $tr;
}
function _updateFilterTable() {
	var dims = _dimensions;
	var filters = dimsToGroups(_dimensions);
	var tables = filters.map((group, i)=>{
		var $table = $(`<table><tbody></tbody></table>`).data('dim',dims[i]);
		$table.find('tbody').append(group.map(item=>{
			var $tr =  $(`<tr><td><input type="checkbox"/><label></label></td><td></td><td></td></tr>`).data(item).click(_onFilter);
			return updateTr($tr);
		}));
		return $table;
	});
	_$filterTable.find('tbody>tr').empty().append(tables.map(table=>{
		return $('<td></td>').append(table);
	}));
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
		$item.find('button .name').text($item.hasClass('expand') ? '折叠' : '展开');
	};
	for(var i=0; i<$list.length; i++) {
		var $item = $($list[i]);
		var dataObj = $item.data().data;
		var { name, symbol, meta, categoryIndustry, categoryConcept, industry, subIndustry, statistic, aggregateValue, jiejin } = dataObj;

		var section1Children = [
			`<span><div>${name}</div><div>${symbol}</div></span>`,
			`<span><div role="price">${'--'}</div><div role="up-rate">${'--'}</div></span>`,
			`<span><div>${'上涨比例'}</div><div class="red">${(statistic.upPercent*100).toFixed(1)+'%'}</div></span>`,
			`<span><div>${'涨跌平均数'}</div><div class=${statistic.mean>=0 ? 'red' : 'green'}>${(statistic.mean*100).toFixed(2)+'%'}</div></span>`,
			`<span><div>${industry}</div><div>${subIndustry}</div></span>`,
			`<span><div>${categoryIndustry}</div><div>${categoryConcept}</div></span>`,
		];
		//section1
		$item.find('.section1').append(section1Children);
		
		//section2
		var $predictionPane = $(`<div class="prediction-wrapper"><div class="chart"><div class="prediction-chart"></div><div class="heatmap-chart"></div></div><div class="statistic flex-around"></div></div>`);
		var $infoPane = $(`<div class="info-wrapper"><div class="info-container"></div><button class="flat-btn btn-red">加入智能监控</button><button class="flat-btn btn-dark">详细搜索结果</button></div>`);
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
	_$filterTable.find('.info .value').text(filteredList.length);
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
