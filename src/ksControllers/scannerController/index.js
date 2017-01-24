
import helperModal from './helperModal';
import crossfilter from 'crossfilter';

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

//初始化需要缓存的dom
var _initCache = () => {
	_$filterTable = $(`<div class="filter-wrapper">
											<div class="filter-table"><table><thead><tr></tr></thead><tr></tr><tbody></tbody></table></div>
											<div class="reset-container"><span class="info"><span class="value">0</span>支股票</span><button class="flat-btn reset"><span>重置筛选</span></button></div>
										</div>`);
	_$filterTable.find('thead>tr').append(['板块（概念）','行业','总市值'].map(name=>{ return `<th>${name}</th>` }));
	
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
	_datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);

	_pieCharts = [
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
	];
	_barCharts = [
		$(`<div class="chart-wrapper"><figcaption>板块划分条形图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>行业划分条形图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>总市值分布图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
	];
}

scannerController.init = (container) => {
	helperModal.check();
	_initCache();

	var $title = $(`<div class="title"><span>扫描</span><img src="./image/tooltip.png"/><span class="date-info"></span></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	_$container = $(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));


	$left.append(`<h4 class="sub-title">Report<br/>结果列表</h4>`);
	$left.append(_$filterTable);
	$left.append(_$listWrapper);
	$left.append(`<div class="footer">
									注：选取的结果不代表其未来的绝对收益或概率；据历史回测统计，
									持续按照扫描结果进行交易操作，有相当概率跑赢基准(大盘)。
									欲了解更多关于我们的历史回测统计报告，请联系info@stone.io						
								</div>`);


	//right panel
	$right.append(`<h4 class="sub-title">Report<br/>简报</h4>`);
	$right.append(`<div class="scanner-info">
									<div class="row">
										<div class="col">
											<p>本次扫描根据最近:<span>20根日线</span></p>
											<p>搜索K线相似度高于:<span>80%</span></p>
										</div>
										<div class="col">
											<p>统计历史相似图形后向:<span>10天的走势</span></p>
											<p>成交量相似度高于:<span>70%的历史相似图形</span></p>
										</div>
									</div class="row">
								</div>`);
	$right.append(`<p class="clearfix red">选取涨跌品均值高于2倍标准差的7支个股呈现于此</p>`);
	$right.append($(`<div class="row charts-container"></div>`).append([$(`<div class="col piecharts-wrapper flex-between"></div>`).append(_pieCharts), $(`<div class="col barcharts-wrapper"></div>`).append(_barCharts)]));

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
	_$container.find('.title').click(function(event) {
		/* Act on the event */
		scannerController._fetchData();
	});
	_$container.find('.title img').click(function(event) {
		helperModal.show();
	});
};

scannerController._fetchData = () => {
	_data.list = [];
	_data.date = '';
	scannerController._update();

	var fetch = () => {
		var data = {
			date: '2019.12.12',
			list: [],
		};
		var categories = ['手机游戏','智能制造','虚拟运行商','物联网','4G5G','海洋工程','美女主播'];
		var industries = ['酿酒','石油石化','酒店餐饮','航天国防','医药流通','中药'];
		var subIndustries = ['高速公路','机场','电子元器件','生态园林','水上运输','工程器械'];
		var names = ['首旅酒店','全聚德','罗顿发展','华天酒店','金陵饭店','锦江股份'];
		var symbols = ['600258','002186','600209','000428','601007','601007'];
		for(var i=0; i<30; i++) {
			var item = {
				index: i,
				symbol: symbols[Math.round(Math.random() * 5)],
				name: names[Math.round(Math.random() * 5)],
				category: categories[Math.round(Math.random() * 6)],
				industry: industries[Math.round(Math.random() * 5)],
				subIndustries: subIndustries[Math.round(Math.random() * 5)],
				statistic: {
					up: Math.random(),
					mean: Math.random() * 2 - 1,
				},
				aggregateValue: Math.round(Math.random() * 2000),
				volume: Math.round(Math.random() * 50),
			};
			data.list.push(item);
		}
		return data;
	}

	var beforeFetch = () => {
		_$listWrapper.find('.waiting-overlay').remove();
		_$listWrapper.append('<div class="waiting-overlay flex-center"><i class="fa fa-spin fa-circle-o-notch"></i></div>');
	};
	var afterFetch = (data) => {
		_data = data;
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
	setTimeout(()=>{
		if(Math.random()>0) {
			afterFetch(fetch());
		} else {
			failFetch();
		}
	},200);

};

scannerController._update = () => {
	var data = _data;
	var list = data.list;

	//统计信息
	_updateDimensions();
	//udpate list
	_$listWrapper.empty();
	var $list = list.map(function(item){
		var dom = $(`<div class="item"></div>`).data({data: item});
		return dom;
	});
	_$listWrapper.append($list);
	_updateList();

	//update filter UI
	_updateFilterTable();

	//update right
	_updateRightPanel();

	//update title
	_$container.find('.date-info').text(_data.date + '期扫描结果');
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
		return data.category;
	});
	var _dimIndustry = crossf.dimension((data)=>{
		return data.industry;
	});
	var _dimAggregateValue = crossf.dimension((data)=>{
		var ranges = _aggregateRanges;
		var aggregateValue = data.aggregateValue;
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
	var handleClick = (e) => {

	};
	for(var i=0; i<$list.length; i++) {
		var $item = $($list[i]);
		var dataObj = $item.data().data;
		var { name, symbol, category, industry, subIndustry, statistic } = dataObj;

		var children = [
			`<span><div>${name}</div><div>${symbol}</div></span>`,
			`<span><div>${'--'}</div><div>${'--'}</div></span>`,
			`<span><div>${'上涨比例'}</div><div class="red">${statistic.up.toFixed(1)+'%'}</div></span>`,
			`<span><div>${'涨跌平均数'}</div><div class="red">${statistic.mean.toFixed(1)+'%'}</div></span>`,
			`<span><div>${industry}</div><div>${subIndustry}</div></span>`,
			`<span><div>${''}</div><div>${category}</div></span>`,
			`<span><div><button class="flat-btn detail"><i class="arrow-down"></i>详情</button></div></span>`,
		];
		$item.append(children);
	}
	_$filterTable.find('.info .value').text($list.length);

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
		$(chart).svgPercent({count:tops[i].value, total:total, caption:tops[i].key});
	});
	_barCharts.forEach((chart, i)=>{
		var keyFormatter = null;
		if(i==2) {
			keyFormatter = aggregateFormatter;
		}
		$(chart).barChart({data:groups[i], keyFormatter:keyFormatter});
	});

}

module.exports = scannerController;
