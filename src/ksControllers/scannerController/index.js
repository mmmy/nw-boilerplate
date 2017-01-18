
import crossfilter from 'crossfilter';

var scannerController = {};

var _$filterTable = null;
var _$listWrapper = null;
var _datafeed = null;
var _data = null;

var _crossfilter = null; //统计信息

var _dimCategory = null;
var _dimIndustry = null;
var _dimAggregateValue = null;
var _dimVolume = null;
var _dimIndex = null;

//初始化需要缓存的dom
var _initCache = () => {
	_$filterTable = $('<div class="filter-wrapper"><table><thead><tr></tr></thead><tr></tr><tbody></tbody></table></div>');
	_$filterTable.find('thead>tr').append(['板块(概念)','行业','总市值','成交量(手)'].map(name=>{ return `<th>${name}</th>` }));
	
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
	_datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);
}

scannerController.init = (container) => {
	_initCache();

	var $title = $(`<div class="title">扫描<img src="./image/tooltip.png"/></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	$(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));


	$left.append(_$filterTable);
	$left.append(_$listWrapper);
	$left.append(`<div class="footer">
									注：选取的结果不代表其未来的绝对收益或概率；据历史回测统计，
									持续按照扫描结果进行交易操作，有相当概率跑赢基准(大盘)。
									欲了解更多关于我们的历史回测统计报告，请联系info@stone.io						
								</div>`);

	scannerController._initActions();
	scannerController._fetchData();
};

scannerController._initActions = () => {

};

scannerController._fetchData = () => {
	var fetch = () => {
		var data = {
			list: [],
		};
		var categories = ['手机游戏','智能制造','虚拟运行商','物联网','4G5G','海洋工程'];
		var industries = ['酿酒','石油石化','酒店餐饮','航天国防','医药流通','中药'];
		var subIndustries = ['高速公路','机场','电子元器件','生态园林','水上运输','工程器械'];
		var names = ['首旅酒店','全聚德','罗顿发展','华天酒店','金陵饭店','锦江股份'];
		var symbols = ['600258','002186','600209','000428','601007','601007'];
		for(var i=0; i<30; i++) {
			var item = {
				index: i,
				symbol: symbols[Math.round(Math.random() * 5)],
				name: names[Math.round(Math.random() * 5)],
				category: categories[Math.round(Math.random() * 5)],
				industry: industries[Math.round(Math.random() * 5)],
				subIndustries: subIndustries[Math.round(Math.random() * 5)],
				statistic: {
					up: Math.random(),
					mean: Math.random() * 2 - 1,
				},
				aggregateValue: Math.round(Math.random() * 3000),
				volume: Math.round(Math.random() * 50),
			};
			data.list.push(item);
		}
		return data;
	}

	var beforeFetch = () => {

	};
	var afterFetch = (data) => {
		_data = data;
		scannerController._update();
	};
	var failFetch = (error) => {
		console.error(error);
	};

	beforeFetch();
	setTimeout(()=>{
		afterFetch(fetch());
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
	
}

function _updateDimensions() {
	//板块, 行业, 总市值, 成交量
	var list = _data.list;
	_crossfilter = crossfilter(list);
	_dimCategory = _crossfilter.dimension((data)=>{
		return data.category;
	});
	_dimIndustry = _crossfilter.dimension((data)=>{
		return data.industry;
	});
	_dimAggregateValue = _crossfilter.dimension((data)=>{
		var ranges = [[-Infinity, 200],[200, 300],[300, 500],[500, 1000],[1000, 2000], [2000, Infinity]];
		var aggregateValue = data.aggregateValue;
		for(var i=0; i<ranges.length; i++) {
			if(aggregateValue >= ranges[i][0] && aggregateValue < ranges[i][1]) {
				return ranges[i];
			}
		}
	});
	_dimVolume = _crossfilter.dimension((data)=>{
		var ranges = [[-Infinity, 5],[5, 10],[10, 20],[20, 50],[50, 100],[100, Infinity]];
		var volume = data.volume;
		for(var i=0; i<ranges.length; i++) {
			if(volume >= ranges[i][0] && volume < ranges[i][1]) {
				return ranges[i];
			}
		}
	});
	_dimIndex = _crossfilter.dimension((data)=>{
		return data.index;
	});

	window.dims = [_dimCategory, _dimIndustry, _dimAggregateValue, _dimVolume];
}
//table row click
var _onFilter = (event) => {
	var $cur = $(event.currentTarget);
	var $table = $cur.closest('table');
	var $trChecked = $table.find('tr').has(':checked');
	var filterArr = [];
	$trChecked.each((index, ele)=>{
		filterArr.push($(ele).data().key);
	});
	var dim = $table.data().dim;
	if(filterArr.length > 0) {
		dim.filter((key)=>{ return filterArr.indexOf(key) > -1 });
	} else {
		dim.filterAll();
	}
};

function _updateFilterTable() {
	var dims = [
		_dimCategory,
		_dimIndustry,
		_dimAggregateValue,
		_dimVolume
	];
	var filters = dims.map((dim, i)=>{
		var groups = dim.group().all();
		if(i>1) {
			return groups.sort((a,b)=>{ return a.key[0] - b.key[0] });
		}
		return groups;
	});

	var tables = filters.map((group, i)=>{
		var $table = $(`<table><tbody></tbody></table>`).data('dim',dims[i]);
		$table.find('tbody').append(group.map(item=>{
			return $(`<tr><td><input type="checkbox"/><label></label></td><td>${item.key}</td><td>${item.value}</td></tr>`).data(item).click(_onFilter);
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
			`<span><div>${'上涨比例'}</div><div>${statistic.up.toFixed(1)+'%'}</div></span>`,
			`<span><div>${'涨跌平均数'}</div><div>${statistic.mean.toFixed(1)+'%'}</div></span>`,
			`<span><div>${industry}</div><div>${subIndustry}</div></span>`,
			`<span><div>${''}</div><div>${category}</div></span>`,
		];
		$item.append(children);
	}
};

module.exports = scannerController;
