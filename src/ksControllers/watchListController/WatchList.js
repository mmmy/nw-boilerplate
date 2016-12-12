
import PredictionWatch from './PredictionWatch';
import SymbolListDropDown from './SymbolListDropDown';

var now = new Date();

var defaultSearchConfig = {
	additionDate: {type:'days', value:30},
	searchSpace: '000010',
	dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
	isLatestDate: true,
	similarityThreshold: {value: 0.6, on:true},
	spaceDefinition: { stock: true, future: false },
	matchType: '形态',
	searchLenMax: 200
};

/*config: {
	dataList:[]
 -----------------------------*/
function WatchList(config) {
	config = config || {};
	this._searchConfig = defaultSearchConfig;
	this._category = config.category || 'default'; //分类
	this._dataFeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10 * 1000, 2, 0);
	this._list = config.list || [{
																symbolInfo:{
																	symbol: '000001.SH',
																	ticker: '上证综合指数',
																	type: 'index',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'ru',
																	ticker: '橡胶',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'a',
																	ticker: '豆一',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'hc',
																	ticker: '热卷',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'cf',
																	ticker: '棉花',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'ma',
																	ticker: '甲醇',
																	type: 'futures',
																	exchange: '',
																}
															}];
	this._resolution = 'D';
	this._baseBars = 30;
	this._wrapper = config.dom;
	this._$container = $(`<div class="watchlist-container">
													<div class="watchlist-prediction-wrapper add">
														<div class="add-info-wrapper">
															<div><img src="./image/logo_white.png" height="20" alt="拱石"/></div>
															<div class="description">将您关注的标的加入Watchlist, 我们将试试监控它们<br/>的走势并对他们进行搜索和统计.</div>
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
	var symbolInfo = {ticker:symbolObj.symbol, symbol:symbolObj.description, exchange:symbolObj.exchange, type:symbolObj.type};
	var prediction = new PredictionWatch({dom: this._$container, baseBars:this._baseBars, resolution:this._resolution, symbolInfo: symbolInfo, searchConfig: this._searchConfig});
	this._list.push({symbolInfo,prediction});
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
		this._list[i].prediction = new PredictionWatch({dom: this._$container, baseBars:this._baseBars, resolution:this._resolution, symbolInfo: list[i].symbolInfo, searchConfig: defaultSearchConfig});
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
}
//排序UI
WatchList.prototype._sortPredictionList = function() {
	for(var i=1; i<this._list.length; i++) {
		var $thisDom = this._list[i].prediction.getRootDom();
		var $lastDom = this._list[i-1].prediction.getRootDom();
		$thisDom.insertAfter($lastDom);
	}
}
//删除 尾巴 len
WatchList.prototype._removeTailingList = function(len) {

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
