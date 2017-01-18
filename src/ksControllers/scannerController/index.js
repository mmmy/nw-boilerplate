
var scannerController = {};

var _$filters = []
var _$listWrapper = null;
var _datafeed = null;
var _data = null;

//初始化需要缓存的dom
var _initCache = () => {
	_$filters = [
		$(`<span>板块(概念)</span>`),
		$(`<span>行业</span>`),
		$(`<span>总市值</span>`),
		$(`<span>成交量(手)</span>`)
	];
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
	_datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);
}

scannerController.init = (container) => {
	_initCache();

	var $title = $(`<div class="title">扫描<img src="./image/tooltip.png"/></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	$(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));

	$left.append($('<div class="filter-wrapper"></div>').append(_$filters));
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
				symbol: symbols[Math.round(Math.random() * 5)],
				name: names[Math.round(Math.random() * 5)],
				category: categories[Math.round(Math.random() * 5)],
				industry: industries[Math.round(Math.random() * 5)],
				subIndustries: subIndustries[Math.round(Math.random() * 5)],
				statistic: {
					up: Math.random(),
					mean: Math.random() * 2 - 1,
				},
				aggregateValue: Math.round(Math.random() * 100000),
				volume: Math.round(Math.random() * 1000000),
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

	//udpate list
	_$listWrapper.empty();
	var $list = list.map(function(item){
		var dom = $(`<div class="item"></div>`).data({data: item});
		return dom;
	});
	_$listWrapper.append($list);
	_udpateList();

	//update filter
	
	//update right
	
}

//更新股票列表
function _udpateList() {
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
