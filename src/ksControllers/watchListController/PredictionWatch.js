
import PredictionWidget from '../PredictionWidget';
import BlockHeatMap from '../BlockHeatMap';
import searchForWatchList from '../../backend/searchForWatchList';
import statisticKline from '../../components/utils/statisticKline';
import getPrice from '../../backend/getPrice';
import config_marketing_time from '../../backend/config_marketing_time';

let { getLatestTime, getLatestPrice, getPriceFromSina } = getPrice;

var SearchPattern = searchForWatchList.SearchPattern;

var dev_local = $.DEBUG;

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
	this._state = {code:NODATA, lastCode:null};
	this.__searchResults = {patterns:[],closePrices:[]};
	this.__latestPrice2 = []; //分钟级别的最新的数据
	this.__latestDayPrice2 = []; //天级别的 , 用来计算涨跌

	this._searchPatternInstance = new SearchPattern();
	this._researchTimes = 0;

	this._updateFuturesResolution();
	this._init();
}
PredictionWatch.prototype._init = function() {
	var percentInfoStr = `<div class="percent-info"><span>--</span><span>.</span><span>--</span><span>%</span></div>`;
	this._percentInfoDoms = [$(percentInfoStr), $(percentInfoStr), $(percentInfoStr), $(percentInfoStr)];
	this._pricesDoms = [$(percentInfoStr), $(percentInfoStr)];
	this._$root = $(`<div class="watchlist-prediction-wrapper">
											<div class="charts-wrapper">
												<div class="chart-header">
													<div class="symbol-info">
														<span class="describe">--</span>
														<br/>
														<span class="symbol">--</span>
													</div>
													<div class="state-info"></div>
												</div>
												<div class="chart-body transition-all">
													<div class="prediction-chart"></div>
													<div class="heatmap-chart"></div>
												</div>
												<div class="chart-footer">
													<button role="search" class="flat-btn border-btn" disabled>详细搜索结果</button>
												</div>
											</div>
											<div class="info-container">
												<div class="statistic-container"></div>
												<div class="price-container"></div>
											</div>
										</div>`);
	this._$symbolInfoDoms = [this._$root.find('.describe'), this._$root.find('.symbol')];
	this._$stateDom = this._$root.find('.state-info');

	this._$chartBody = this._$root.find('.chart-body');
	this._$predictionChart = this._$root.find('.prediction-chart');
	this._$heatmapChart = this._$root.find('.heatmap-chart');
	this._$statisticContainer = this._$root.find('.statistic-container');

	var that = this;
	var staitsticContainer = this._$root.find('.statistic-container');
	var priceContainer = this._$root.find('.price-container');

	this._$symbolInfoDoms[0].text(this._symbolInfo.ticker);
	this._$symbolInfoDoms[1].text(this._symbolInfo.symbol);

	this._$searchDetailBtn = this._$root.find('[role="search"]').click(this._searchDetail.bind(this));
	
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
	}].forEach(function(data, i){
		var newDom = $('<span class="statistic-item"></span>').append(`<div class="title">${data.title}</div>`).append($(`<div></div>`).append(data.dom));
		staitsticContainer.append(newDom);
		if(i % 2 === 1) {
			staitsticContainer.append('<hr/>');
		}
	});

	[{
		title: '现价',
		dom: this._pricesDoms[0],
	},{
		title: '涨跌',
		dom: this._pricesDoms[1],
	}].forEach(function(data){
		var newDom = $('<span class="price-item"></span>').append(`<div class="title">${data.title}</div>`).append($(`<div></div>`).append(data.dom));
		priceContainer.append(newDom);
	});

	this._$parent.find(".watchlist-prediction-wrapper.add").before(this._$root);
	//k线图
	this._predictionWidget = new PredictionWidget(this._$root.find('.prediction-chart')[0], {showRange: false, slient: true});
	this._predictionWidget.onHoverKline((index, data)=>{

	})
	this._predictionWidget.onScaleLines((yMin, yMax)=>{
		that._blockHeatMap.setData(that._predictionWidget.getLastPrices(), yMin, yMax);
	});
	//热点图
	this._blockHeatMap = new BlockHeatMap(this._$root.find('.heatmap-chart')[0], {textColor:'#999'});

	this._dataFeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);
	
	this._fetchLastDayPrice(); //获取前一天的收盘价, 用来计算涨跌
	setTimeout(function(){
		that._fetchPredictionData();
		that._fetchLatestPrice();
	}, 2000);       //马上进行取数据操作
	//开启定时器更新数据
	this.watchDateTimeOnce();
	this._pulseWatchDatetime();
	// this._pulseUpdatePredictionStart();
	// this._pulseUpdatePriceStart();
}
/* 在开始的时候调用一次, 然后在监视时间定时器中调用
----------------------------------------------- */
PredictionWatch.prototype.watchDateTimeOnce = function() {
	var now = new Date(),
			day = now.getDay(),
			hour = now.getHours(),
			minute = now.getMinutes(),
			M = hour * 60 + minute;
	var type = this._symbolInfo.type;

	var isMarketingTime = false;
	
	if(day>0 && day<6) {                  //只有在非周六,周日 的交易时间内, 才开启更新
		var timeArr = config_marketing_time[type];
		for(var i=0; i<timeArr.length; i++) {
			var timeRange = timeArr[i];  //[['9:00','11:30'],['13:00','15:00']]
			var T0s = timeRange[0].split(':'),
					T1s = timeRange[1].split(':');
			//将时间换算成分钟
			var M0 = parseInt(T0s[0]) * 60 + parseInt(T0s[1]),
					M1 = parseInt(T1s[0]) * 60 + parseInt(T1s[1]);
			if((M >= M0) && (M <= M1)) {   //在交易时间内
				isMarketingTime = true;
				break;
			}
		}
	}
	if(isMarketingTime) {
		this.pulseUpdateDataStart();
	} else {
		this.pulseUpdateDataStop();
	}
}

// PredictionWatch.prototype.

//用来监听时间, 如果是该symbol的交易时间, 那么开启各个pulse数据更新, 否则关闭
PredictionWatch.prototype._pulseWatchDatetime = function() {
	var that = this;
	clearInterval(this._pulseWatchInterval);
	this._pulseWatchInterval = setInterval(function(){  //一分钟一次
		that.watchDateTimeOnce();
	}, 3 * 1000);
}

PredictionWatch.prototype.pulseUpdateDataStart = function() {
	this._pulseUpdatePredictionStart();
	this._pulseUpdatePriceStart();
}
PredictionWatch.prototype.pulseUpdateDataStop = function() {
	this._pulseUpdatePredictionStop();
	this._pulseUpdatePriceStop();
}
PredictionWatch.prototype.isFutures = function() {
	return this._symbolInfo.type == 'futures';
}
PredictionWatch.prototype._pulseUpdatePredictionStart = function() {
	if(this._pulseUpdater) {
		return
	}
	//期货5分钟刷新一次
	var interval = dev_local ? 5 * 1000 : (this.isFutures() ? 5 * 60 : 60) * 1000;
	var that = this;
	this._pulseUpdater = setInterval(function(){
		that._fetchPredictionData();
	}, interval);
}
PredictionWatch.prototype._pulseUpdatePredictionStop = function() {
	clearInterval(this._pulseUpdater);
	this._pulseUpdater = null;
}
PredictionWatch.prototype._pulseUpdatePriceStart = function() {
	if(this._pulsePriceUpdater) {
		return;
	}
	var interval = 10 * 1000;
	var that = this;
	this._pulsePriceUpdater = setInterval(function() {
		that._fetchLatestPrice();
	}, interval);
}
PredictionWatch.prototype._pulseUpdatePriceStop = function() {
	clearInterval(this._pulsePriceUpdater);
	this._pulsePriceUpdater = null;
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
PredictionWatch.prototype._updateStatisticUI = function() {
	var statistic = statisticKline(this.__searchResults.patterns);
	var { median, mean, upPercent, downPercent, up, down } = statistic;
	this._percentInfoDoms[0].updatePercentInfo(upPercent, 1).animateCss('fadeIn');
	this._percentInfoDoms[1].updatePercentInfo(downPercent, 1).animateCss('fadeIn');
	this._percentInfoDoms[2].updatePercentInfo(mean).animateCss('fadeIn');
	this._percentInfoDoms[3].updatePercentInfo(median).animateCss('fadeIn');
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
	var kline = this.__searchMetaData.kline;
	var close = 0;
	if(kline.length>0) {
		close = kline[kline.length-1][2];
	}
	if(dev_local) {
		this._$stateDom.text(this._researchTimes + this._state.code + ' ' + new Date().toTimeString() + ' ' + 'last close ' + close);
	}

	var $charts = this._$root.find('.prediction-chart,.heatmap-chart');
	var chartOpacity = 1;
	this._$watingOverLay = this._$watingOverLay || $(`<div class="waiting-overlay flex-center"><div><i class="fa fa-circle-o-notch fa-spin"></i><br/>搜索中</div></div>`);
	this._$errorWaitingOverLay = this._$errorWaitingOverLay || $(`<div class="waiting-overlay flex-center"><div><i class="fa fa-circle-o-notch fa-spin"></i><br/>搜索失败<br><span class="error">正在重新搜索</span></div></div>`);
	this._$zeroOverLay = this._$zeroOverLay || $(`<div class="waiting-overlay flex-center"><div><img src="./image/warn.png" /><br/>搜索结果为零<br></div></div>`);
	this._$errorOverLay = this._$errorOverLay || $(`<div class="waiting-overlay flex-center"><div><img src="./image/warn.png" /><br/>搜索失败<br></div></div>`);
	this._$offLineOverLay = this._$offLineOverLay || $(`<div class="waiting-overlay flex-center"><div><img src="./image/warn.png" /><br/>请检查你的网络连接<br></div></div>`);
	
	this._$watingOverLay.remove();
	this._$errorWaitingOverLay.remove();
	this._$errorOverLay.remove();
	this._$zeroOverLay.remove();
	this._$offLineOverLay.remove();

	switch(this._state.code) {
		case NODATA:
			this._$zeroOverLay.appendTo(this._$statisticContainer);
			break;
		case ERROR: //error 停留的时间很短
			if(!window.navigator.onLine) {
				this._$offLineOverLay.appendTo(this._$statisticContainer);
			} else {
				this._$errorOverLay.appendTo(this._$statisticContainer);
			}
			break;
		case SEARCHING:
			if(this._state.lastCode == ERROR)
				this._$errorWaitingOverLay.appendTo(this._$statisticContainer);
			else
				this._$watingOverLay.appendTo(this._$statisticContainer);
			// chartOpacity = 0.5;
			break;
		case FINISHED:
			break;
		default: 
			break;
	}
	// $charts.css('opacity',chartOpacity);
}
/* 搜索失败, 重新搜索, 5次之后停止
-------------------------------------------- */
PredictionWatch.prototype._research = function() {
	console.log('research');
	this._researchTimes ++;
	if(this._researchTimes < 6) {
		this._fetchPredictionData();
	} else {
		// if(this._state.lastCode == FINISHED) { //如果上一次的是成功的, 用来区别第一的失败和重复后的失败
		// 	this._researchTimes = 0;
		// }
	}
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
		that._state.lastCode = that._state.code;
		if(!closePrices || closePrices.length==0) {
			that._state.code = NODATA;
		} else {
			that._state.code = FINISHED;
			that._$searchDetailBtn.attr('disabled',false);
		}
		that._researchTimes = 0;
		// that._udpate();
		that._renderCharts();
		that._renderStuffs();
		that._updateStatisticUI();
	};
	var errorCb = function(error) {
		console.error(error);
		that._state.lastCode = that._state.code;
		that._state.code = ERROR;
		that._renderStuffs();
		that._research();
	};
	this._searchPatternInstance.search({symbol, kline, bars, searchConfig, dataCategory, interval}, cb, errorCb);
}
/*先获取kline数据, 然后搜索pattern, 完成后渲染
 -------------------------------------------------*/
PredictionWatch.prototype._fetchPredictionData = function() {
	this._state.lastCode = this._state.code;
	this._state.code = SEARCHING;
	this._renderStuffs();
	//清空数据, 绘图
	this.__searchResults.patterns = [];
	this.__searchResults.closePrices = [];
	this._renderCharts();
	var periodLengthSeconds = window.Kfeeds.DataPulseUpdater.prototype.periodLengthSeconds; //参考kfeed.js
	var resolution = this._resolution, 		//股票,指数:'D' || '1', 期货:'D' || '5'
			rangeStartDate = 0,//new Date('2016/10/1') / 1000,
			rangeEndDate = 0,//new Date() / 1000;
			now = new Date(),
			nowSeconds = Math.ceil(now / 1000);

	//开始时间为当前时间往前两倍baseBar的时间, 往后两个bar的时间
	//天数据应该没有问题, 但是分钟级别的会有问题
	rangeStartDate = nowSeconds - periodLengthSeconds(resolution, this._baseBars * 2);
	rangeEndDate = nowSeconds + periodLengthSeconds(resolution, 2);

	var that = this;
	// this._dataFeed.searchSymbolsByName(this._symbolInfo.ticker, '', 'index', function(d){
	// 	console.log('searchSymbolsByName', d);
	// });
	var cb = function(kline) {  //kline: [[open,close,high,low],]
		setTimeout(function(){
			//截断数据
			that.__searchMetaData.kline = kline.slice(- that._baseBars) || [];
			that._search();
		});
	};
	var errorCb = function(e) {
		console.error('获取K线 错误',e);
		that._state.lastCode = that._state.code;
		that._state.code = ERROR;
		that._renderStuffs();
		that._research();
	};
	//如果是天数据, 直接获取K线数据
	if(this._symbolInfo.type == 'D') {
		//调用这个 之前一定要注意的是kfeed的symbolist 需要 解析完成, 否则会出现bug
		this._dataFeed.getBars(this._symbolInfo, resolution, rangeStartDate, rangeEndDate, cb, errorCb ,{arrayType:true});
	} else {
		//先获取最近的时间
		getLatestTime(this._symbolInfo, this._resolution, now, function({latestTime}){
			var latestSeconds = Math.ceil(latestTime / 1000);
			var rangeStartDate1 = latestSeconds - periodLengthSeconds(resolution, that._baseBars * 2);
			var rangeEndDate1 = latestSeconds + periodLengthSeconds(resolution, 2);
			that._dataFeed.getBars(that._symbolInfo, resolution, rangeStartDate1, rangeEndDate1, cb, errorCb, {arrayType:true});
		}, errorCb);
	}
}
/* 获取前一天的收盘价, 从拱石服务器
---------------------------------- */
PredictionWatch.prototype._fetchLastDayPrice = function() {
	var that = this;
	getLatestPrice(this._symbolInfo, this._resolution,
									function(priceArr) {
										that.__latestDayPrice2 = priceArr;
									},
									function(err) {
										console.error(err);
									},
									{isDay: true}
								)
}
PredictionWatch.prototype._fetchLatestPrice = function() {
	var that = this;
	var cb = function(priceArr){                  //{datetime:,close:,open:,high:,low:,volume:,amount:}
							that.__latestPrice2 = priceArr;
							that._updateLatestPriceUI();
						};
	var errorCb = function(err) {
		console.error(err);
	};
	//期货从拱石服务器取
	if(this._symbolInfo.type == 'futures') {
		getLatestPrice(this._symbolInfo, this._resolution, cb, errorCb);
	} else {
		getPriceFromSina(this._symbolInfo, this._resolution, cb, errorCb);
	}
}
//更新实时价格
PredictionWatch.prototype._updateLatestPriceUI = function() {
	if(this.__latestPrice2 && this.__latestPrice2.length>0) {
		var nowPriceObj = this.__latestPrice2[this.__latestPrice2.length - 1];
		var	close1 = nowPriceObj.close;
		var price = close1,
				lastClose = nowPriceObj.lastClose; //如果从新浪取数据, 那么就有lastClose
		this._pricesDoms[0].updatePercentInfo(price/100).removeClass('red green');
		this._pricesDoms[1].removeClass('red green');

		//第二种方案
		if(!lastClose && this.__latestDayPrice2 && this.__latestDayPrice2.length>0) {
			var priceObj = this.__latestDayPrice2[1];
			lastClose = priceObj.close;
			// var time = new Date(priceObj)
		}

		if(lastClose) {
			var upRate = (price - lastClose) / lastClose;
			let colorClass = '';
			if(upRate > 0) 
				colorClass = 'red';
			else if(upRate < 0) 
				colorClass = 'green';
			this._pricesDoms[1].updatePercentInfo(upRate).addClass(colorClass).animateCss('fadeIn');
			this._pricesDoms[0].addClass(colorClass).animateCss('fadeIn');
		}
	}
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
	this._fetchPredictionData();
}
//详细搜索结果
PredictionWatch.prototype._searchDetail = function() {
	var param ={
		symbol : this._symbolInfo.symbol,
		bars : this.__searchMetaData.kline.length,
		interval : this._resolution,
		type : this._symbolInfo.type,
		kline : this.__searchMetaData.kline,
		searchConfig : this._searchConfig
	}
	var actions = require('../../flux/actions');
	window.store.dispatch(actions.patternActions.getPatterns(param));
}
PredictionWatch.prototype.getRootDom = function() {
	return this._$root;
}
PredictionWatch.prototype._cancelSearch = function() {

}
PredictionWatch.prototype.resize = function() {
	this._predictionWidget.resize();
}
PredictionWatch.prototype.dispose = function() {
	this._pulseUpdatePredictionStop();
	this._cancelSearch();
	this._$root.remove();
}

module.exports = PredictionWatch;