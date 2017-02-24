
import PredictionWatch from './PredictionWatch';
import SymbolListDropDown from './SymbolListDropDown';
import messager from '../messager';

var now = new Date();

var defaultSearchConfig = {
	additionDate: {type:'days', value:30},
	searchSpace: '000010',
	dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
	isLatestDate: true,
	dateThreshold : {value: 0.3, on:true},
	similarityThreshold: {value: 0.6, on:true},
	spaceDefinition: { stock: true, future: false },
	matchType: '形态',
	searchLenMax: 200
};

/*config: {
	dataList:[],
	dom
	}
 -----------------------------*/
function WatchList(config) {
	config = config || {};
	this._category = config.category || 'default'; //分类
	var storage = window.actionsForIframe.mockStorage ? window.actionsForIframe.mockStorage() : require('../../backend/watchlistStorage').getDataFromStorage(this._category);
	this._searchConfig = storage.searchConfig || defaultSearchConfig;
	this._list = storage.list || [];
	this._resolution = storage.resolution || 'D';
	this._baseBars = storage.baseBars || 30;
	
	var that = this;
	this._dataFeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);
	//先获取更新symbolList 列表, 消除symbollist没有被tradingview加载的时候, 获取k线数据错误
	this._dataFeed.searchSymbolsByName('','','',function(list){ 
		// console.log('获取kline列表',list);
		that._init(config);
	}); // 消除bug
}

WatchList.prototype._init = function(config) {

	this._wrapper = config.dom;
	this._$container = $(`<div class="watchlist-container">
													<div class="watchlist-prediction-wrapper add">
														<div class="add-info-wrapper">
															<div><img src="./image/logo_white.png" height="20" alt="拱石"/></div>
															<div class="description">将您关注的标的加入Watchlist, 我们将实时监控它们<br/>的走势并对他们进行搜索和统计.</div>
														</div>
														<div class="add-input-wrapper">
															<div class="inputs-group-wrapper">
																<span class="inputs-group"><span class="search-icon"></span><input role="input" placeholder="期货,股票,指数"/><button role="submit" class="flat-btn border-btn">添加</button></span>
															</div>
														</div>
													</div>
											</div>`);

	$(this._wrapper).append(this._$container);

	this._initPredicitonList();

	this._initAddPanel();

	this._initResize();
}

WatchList.prototype._initResize = function()  {
	var that = this;
	window.addEventListener('resize',function(){
		that._list.forEach(function(item){
			item.prediction.resize();
		});
	});
}

WatchList.prototype._hideAddPanel = function() {
	var $dom = this._$container.find(".watchlist-prediction-wrapper.add");
	$dom.hide();
}

WatchList.prototype._showAddPanel = function() {
	var $dom = this._$container.find(".watchlist-prediction-wrapper.add");
	$dom.show();
}

WatchList.prototype._initAddPanel = function() {
	var $dom = this._$container.find(".watchlist-prediction-wrapper.add");
	var $input = $dom.find('input');
	var $inputsWrapper = $input.closest('.inputs-group-wrapper');
	var _dropDown = null;
	var that = this;
	_dropDown = new SymbolListDropDown({
		wrapper: $inputsWrapper, 
		dataFeed: that._dataFeed,
		onSubmit: this._append.bind(this),
	});
}
/* {description:"cf"
			exchange:"zc"
			full_name:"棉花"
			params:[]
			symbol:"棉花"
			type:"futures"
		}
------------------------------------------------ */
WatchList.prototype._append = function(symbolObj) {
	//先查看有没有重复的
	for(var i=0; i<this._list.length; i++) {
		if(this._list[i].symbolInfo.ticker == symbolObj.symbol) {
			messager.showWarningMessage("已经添加过该标的!");
			return 1;
		}
	}
	var symbolInfo = {ticker:symbolObj.symbol, symbol:symbolObj.description, exchange:symbolObj.exchange, type:symbolObj.type, instrument:symbolObj.instrument};
	var prediction = new PredictionWatch({dom: this._$container, baseBars:this._baseBars, resolution:this._resolution, symbolInfo: symbolInfo, searchConfig: this._searchConfig});
	this._list.push({symbolInfo,prediction});
	this._saveToFile();
	if(this._list.length >= 20) {
		this._hideAddPanel();
	}
	return 0;
}

WatchList.prototype.append = function(symbolObj) {
	if(this._list.length >= 20) {
		messager.showWarningMessage("添加数量超过上限20!",3000);
		return 2;
	}
	var code = this._append(symbolObj);
	if(code === 0) {
		messager.showSuccessMessage("添加成功!");
	}
	return code;
}

WatchList.prototype._disposeAll = function() {
	// for(var i=0,len=this._predictionList.length; i<len; i++) {
	// 	this._predictionList[i].dispose();
	// 	this._predictionList[i] = null;
	// }
	// this._predictionList = [];
}

WatchList.prototype._initPredicitonList = function() {
	this._disposeAll();
	var list = this._list;
	for(var i=0,len=list.length; i<len; i++) {
		this._list[i].prediction = new PredictionWatch({dom: this._$container, baseBars:this._baseBars, resolution:this._resolution, symbolInfo: list[i].symbolInfo, searchConfig: this._searchConfig});
	}
}

WatchList.prototype.dispose = function() {

}

WatchList.prototype._updatePredictionsConfig = function() {
	for(var i=0; i<this._list.length; i++) {
		this._list[i].prediction.updateConfig({searchConfig:this._searchConfig, baseBars:this._baseBars, resolution:this._resolution});
	}
}

WatchList.prototype._render = function() {

}

WatchList.prototype.getList = function() {
	var list = this._list.map(function(item, i){
		return {symbolInfo: item.symbolInfo};
	});
	return list;
}
//点击编辑watchlist保存之后
WatchList.prototype.updateList = function(symbolInfoList) {
	var newList = [];
	var oldList = this._list;
	var newLen = symbolInfoList.length;
	var oldLen = this._list.length;
	for(var i=0; i<newLen; i++) {
		var symbolInfo = symbolInfoList[i].symbolInfo;
		for(var j=0; j<oldList.length; j++) {
			if(oldList[j].symbolInfo.symbol === symbolInfo.symbol) {
				newList.push(oldList[j]);
				oldList.splice(j,1);
			}
		}
	}
	//删除操作
	for(var i=0; i<oldList.length; i++) {
		oldList[i].prediction.dispose();
	}
	this._list = newList;
	this._sortPredictionList();
	//保存
	this._saveToFile();
	if(this._list.length < 20) {
		this._showAddPanel();
	}
}
//排序UI
WatchList.prototype._sortPredictionList = function() {
	for(var i=1; i<this._list.length; i++) {
		var $thisDom = this._list[i].prediction.getRootDom();
		var $lastDom = this._list[i-1].prediction.getRootDom();
		$thisDom.insertAfter($lastDom);
	}
}
//持久化
WatchList.prototype._saveToFile = function() {
	var listForSave = this._list.map(function(item){
		return {symbolInfo: item.symbolInfo};
	});
	var data = {
		list: listForSave,
		searchConfig: this._searchConfig,
		resolution: this._resolution,
		baseBars: this._baseBars,
	};
	try {
		require('../../backend/watchlistStorage').saveToFile(data,this._category);
	} catch(e) {
		console.error(e);
	}
}
WatchList.prototype.saveToFile = function() {
	this._saveToFile();
}
WatchList.prototype.updateConfig = function(config) {
	var isChanged = false;
	if(JSON.stringify(this._searchConfig) != JSON.stringify(config.searchConfig)) {
		this._searchConfig = config.searchConfig;
		isChanged = true;
	}
	if(this._resolution != config.resolution) {
		this._resolution = config.resolution;
		isChanged = true;
	}
	if(this._baseBars != config.baseBars) {
		this._baseBars = config.baseBars;
		isChanged = true;
	}

	if(isChanged) {
		this._updatePredictionsConfig();
		this._saveToFile();
		// this._render();
	}
}
WatchList.prototype.getSearchConfig = function() {
	return $.extend(true, {}, this._searchConfig);
}
WatchList.prototype.getResolution = function() {
	return this._resolution;
}
WatchList.prototype.getBasebars = function() {
	return this._baseBars;
}
module.exports = WatchList;
