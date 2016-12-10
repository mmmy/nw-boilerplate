
import PredictionWidget from '../PredictionWidget';
import BlockHeatMap from '../BlockHeatMap';
import searchForWatchList from '../../backend/searchForWatchList';
var searchPattern = searchForWatchList.searchPattern;

var NODATA = 'NODATA',
		FINISHED = 'FINISHED',
		SEARCHING = 'SEARCHING',
		ERROR = 'ERROR';
/*config: {
	initList:[]
 -----------------------------*/
function PredictionWatch(config) {
	this._$parent = $(config.dom);
	this._symbolInfo = config.symbolInfo;
	this._resolution = config.resolution;
	this._baseBars = config.baseBars;
	this._searchConfig = config.searchConfig;
	this.__searchMetaData = {kline:[]};
	this._state = {code:NODATA};
	this.__searchResults = {patterns:[],closePrices:[]};

	this._updateFuturesResolution();
	this._init();
}
PredictionWatch.prototype._init = function() {
	var percentInfoStr = `<div class="percent-info"><span>0</span><span>.</span><span>0</span><span>%</span></div>`;
	this._percentInfoDoms = [$(percentInfoStr), $(percentInfoStr), $(percentInfoStr), $(percentInfoStr)];
	this._pricesDoms = [$(percentInfoStr), $(percentInfoStr)];
	this._$root = $(`<div class="watchlist-prediction-wrapper">
											<div class="charts-wrapper">
												<div class="chart-header">
													<div class="symbol-info">
														<span class="discribe">--</span>
														<span class="symbol">--</span>
													</div>
													<div class="state-info">NODATA</div>
												</div>
												<div class="chart-body">
													<div class="prediction-chart"></div>
													<div class="heatmap-chart"></div>
												</div>
											</div>
											<div class="info-container">
												<div class="statistic-container"></div>
												<div class="price-container"></div>
												<button class="flat-btn">详细搜索结果</button>
											</div>
										</div>`);
	this._$symbolInfoDoms = [this._$root.find('.discribe'), this._$root.find('.symbol')];
	this._$stateDom = this._$root.find('.state-info');
	var that = this;
	var staitsticContainer = this._$root.find('.statistic-container');
	var priceContainer = this._$root.find('.price-container');

	this._$symbolInfoDoms[0].text(this._symbolInfo.ticker);
	this._$symbolInfoDoms[1].text(this._symbolInfo.symbol);

	[{
		title: '上涨比例',
		dom: this._percentInfoDoms[0],
	},{
		title: '下跌比例',
		dom: this._percentInfoDoms[1],
	},{
		title: '涨跌平均',
		dom: this._percentInfoDoms[2],
	},{
		title: '涨跌中位数',
		dom: this._percentInfoDoms[3]
	}].forEach(function(data){
		var newDom = $('<span class="statistic-item"></span>').append(`<h6>${data.title}</h6>`).append($(`<p></p>`).append(data.dom));
		staitsticContainer.append(newDom);
	});

	[{
		title: '现价',
		dom: this._pricesDoms[0],
	},{
		title: '涨跌',
		dom: this._pricesDoms[1],
	}].forEach(function(data){
		var newDom = $('<span class="price-item"></span>').append(`<h6>${data.title}</h6>`).append($(`<p></p>`).append(data.dom));
		priceContainer.append(newDom);
	});

	this._$parent.find(".watchlist-prediction-wrapper.add").before(this._$root);
	//k线图
	this._predictionWidget = new PredictionWidget(this._$root.find('.prediction-chart')[0], {showRange: false});
	this._predictionWidget.onHoverKline((index, data)=>{

	})
	this._predictionWidget.onScaleLines((yMin, yMax)=>{
		that._blockHeatMap.setData(that._predictionWidget.getLastPrices(), yMin, yMax);
	});
	//热点图
	this._blockHeatMap = new BlockHeatMap(this._$root.find('.heatmap-chart')[0], {textColor:'#999'});

	this._dataFeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10 * 1000, 2, 0);
	
	setTimeout(function(){that._fetchData();}, 500);       //马上进行取数据操作
	this._pulseUpdateStart();
}
PredictionWatch.prototype._pulseUpdateStart = function() {
	if(this._pulseUpdater) {
		return
	}
	var interval = 100000 * 1000;
	var that = this;
	this._pulseUpdater = setInterval(function(){
		that._fetchData();
	}, interval);
}
PredictionWatch.prototype._pulseUpdateStop = function() {
	clearInterval(this._pulseUpdater);
	this._pulseUpdater = null;
}
/*暂时解决方法, 期货先只支持5分钟数据, 而接口传过来的resolution, 现在只有"D"和"1"
--------------------------------------------- */
PredictionWatch.prototype._updateFuturesResolution = function() {
	if(this._symbolInfo.type === 'futures' && this._resolution === "1") {
		this._resolution = "5";
	}
}
/*将数据转换成需要渲染的格式
	---------------------------------------------*/
PredictionWatch.prototype._udpate = function() {

}
/*渲染charts
 ----------------------------------------------*/
PredictionWatch.prototype._renderCharts = function() {

	let kline = this.__searchMetaData.kline,
			closePrices = this.__searchResults.closePrices,
			predictionBars = this._searchConfig.additionDate.value;

	this._predictionWidget.setData(kline, closePrices, null, predictionBars);

	var {yMin, yMax} = this._predictionWidget.getLineChartMinMax(),
			labelDecimal = 3;
	this._blockHeatMap.setData(this._predictionWidget.getLastPrices(), yMin, yMax, {labelDecimal});
}

PredictionWatch.prototype._renderStuffs = function() {
	this._$stateDom.text(this._state.code);
}
//搜索, 只在fecthData中调用
PredictionWatch.prototype._search = function() {
	var symbol = this._symbolInfo.symbol,
			type = this._symbolInfo.type,
			kline = this.__searchMetaData.kline,
			bars = kline.length,
			searchConfig = this._searchConfig,
			dataCategory = this._dataFeed.getDataCategory(),
			interval = this._resolution;

	var that = this;
	var cb = function(patterns, closePrices) {
		that.__searchResults.patterns = patterns;
		that.__searchResults.closePrices = closePrices;
		that._state.code = FINISHED;
		that._udpate();
		that._renderCharts();
		that._renderStuffs();
	};
	var errorCb = function(error) {
		console.error(error);
		that._state.code = ERROR;
		that._renderStuffs();
	};
	searchPattern({symbol, kline, bars, searchConfig, dataCategory, interval}, cb, errorCb);
}
/*先获取kline数据, 然后搜索pattern, 完成后渲染
 -------------------------------------------------*/
PredictionWatch.prototype._fetchData = function() {
	this._state.code = SEARCHING;
	this._renderStuffs();
	var resolution = this._resolution,
			rangeStartDate = new Date('2016/10/1') / 1000,
			rangeEndDate = new Date() / 1000;
	var that = this;
	// this._dataFeed.searchSymbolsByName(this._symbolInfo.ticker, '', 'index', function(d){
	// 	console.log('searchSymbolsByName', d);
	// });
	var cb = function(kline) {  //kline: [[open,close,high,low],]
		setTimeout(function(){
			that.__searchMetaData.kline = kline.slice(- that._baseBars) || [];
			that._search();
		});
	};
	var errorCb = function(e) {
		console.error(e);
		that._state.code = ERROR;
		that._renderStuffs();	
	};
	//调用这个 之前一定要注意的是kfeed的symbolist 需要 解析完成, 否则会出现bug
	this._dataFeed.getBars(this._symbolInfo, resolution, rangeStartDate, rangeEndDate, cb, errorCb ,{arrayType:true});
}
/*将数据装换成需要搜索的格式
 ------------------------------------------------*/
PredictionWatch.prototype.getSearchMetaData = function() {

}
/*更新配置, 并获取数据,渲染
 ------------------------------------------------*/
PredictionWatch.prototype.updateConfig = function(config) {
	this._searchConfig = config.searchConfig;
	this._resolution = config.resolution;
	this._baseBars = config.baseBars;

	this._updateFuturesResolution();
	this._fetchData();
}
PredictionWatch.prototype.getRootDom = function() {
	return this._$root;
}
PredictionWatch.prototype._cancelSearch = function() {

}
PredictionWatch.prototype.dispose = function() {
	this._pulseUpdateStop();
	this._cancelSearch();
	this._$root.remove();
}

module.exports = PredictionWatch;