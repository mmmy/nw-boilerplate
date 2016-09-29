import { STOCK_VIEW } from '../flux/constants/Const';
const comparatorId = 'comparator-chart';

let _stockViewWindow = null;
let _comparatorWindow = null;

let _searchRangeCache = null;

let _onComsubscribes = [];

let _getStockViewWindow = () => {
	_stockViewWindow = _stockViewWindow || document.querySelector(`#${STOCK_VIEW} iframe`) && document.querySelector(`#${STOCK_VIEW} iframe`).contentWindow;
	return _stockViewWindow;
}

let _getComparatorWindow = () => {
	_comparatorWindow = _comparatorWindow || document.querySelector(`#${comparatorId} iframe`) && document.querySelector(`#${comparatorId} iframe`).contentWindow;
	return _comparatorWindow
};
//range = {from: , to:}, widgetIndex = '0', '1'
let setComparatorVisibleRange = (range, widgetIndex) => {
	_searchRangeCache = range || _searchRangeCache;
	let chartWindow = _getComparatorWindow();
	if(chartWindow && _searchRangeCache) {
		try {
			chartWindow.setVisibleRange(_searchRangeCache, widgetIndex + '');
		} catch (e) {

		}
	}
}

let setComparatorPosition = (unixTime, offsetIndex , y) => {
	let context = _getComparatorWindow();
	let Q5 = context && context.Q5;
	if(Q5) {
		try {
			let chart = Q5.getAll()[0];
			let model = chart.R99.m_model;
			let timeScale = model.m_timeScale;
			// let x = timeScale.timeToCoordinate(unixTime);
			let startIndex = timeScale.timePointToIndex(unixTime);
			let x = timeScale.indexToCoordinate(startIndex + offsetIndex);
			model.setCurrentPosition(x, y, model.paneForSource(model.m_mainSeries));
		} catch (e) {
			console.error(e);
		}
	}
};

let setStockViewSymbol = (symbol) => {
	let context = _getStockViewWindow();
	let Q5 = context && context.Q5;
	if(Q5) {
		try {
			let chart = Q5.getAll()[0];
			chart.setSymbol(symbol);
		} catch (e) {
			console.error(e);
		}
	}
};

let setStockViewVisibleRange = function(symbol, unixTimeRange) {
	let context = _getStockViewWindow();
	let Q5 = context && context.Q5;
	if(Q5) {
		try {

			let chart = Q5.getAll()[0];
			let mainSeries = chart.R99.mainSeries();
			_onComsubscribes.forEach(function(func){
				mainSeries._onCompleted.unsubscribe(null, func); //取消所有订阅
			});
			_onComsubscribes = [];

			if(mainSeries.symbol() == symbol || mainSeries.symbol().split(':').indexOf(symbol) > -1) {
				console.log('symbol not changed');
				context.setVisibleRange(unixTimeRange, '0');
			} else {
				let subscribeFunc = function() {
					console.log('call subscribeFunc');
					if(mainSeries.symbol() == symbol || mainSeries.symbol().split(':').indexOf(symbol) > -1) {
						context.setVisibleRange(unixTimeRange, '0');
						mainSeries._onCompleted.unsubscribe(null, subscribeFunc); //取消订阅
						console.log('unsubscribe subscribeFunc',unixTimeRange);
					}
				}
				_onComsubscribes.push(subscribeFunc);
				mainSeries._onCompleted.subscribe(null, subscribeFunc);
				chart.setSymbol(symbol);
			}
		} catch (e) {
			console.error(e);
		}
	}else{
		console.error('error');
	}
};

var __doWhenSeriesCompleted = function(callback, chartDom) {
    function run() {
        var R99 = chartDom.Q5.getAll()[0].model();
        // if(R99.m_model.m_timeScale.timePointToIndex(targetTime) > 0) {
            R99.mainSeries().onCompleted().unsubscribe(null, run);
            callback();
        // }
        
    }
    chartDom.Q5.getAll()[0].model().mainSeries().onCompleted().subscribe(null, run);
};
/*
let updateTradingviewAfterSearch = (dataObj) => {
	let chartDom = _getComparatorWindow();
	let chart = chartDom.Q5.getAll()[0];
	chart.Q1.scalesProperties.showRightScale.setValue(1);
	chart.model().removeAllDrawingTools();

	let { bars, dateRange } = dataObj;
	//显示信息
	let daysCount = (new Date(dateRange[1]) - new Date(dateRange[0]))/1000/24/3600 + 1;
	daysCount = Math.round(daysCount);
	$('.searching-info-content').text(bars + "根K线, " + daysCount + "日");

	//tradingview
	let firstPattern = window.parent.store.getState().patterns.rawData[0];
	if(firstPattern) {
		var baseBar = firstPattern.baseBars;
    var daysOffset = firstPattern.kLine.length * 0.6;
    var timeRange = {
        from: +new Date(firstPattern.begin) / 1000,// - 1 * oneDay,
        to: +new Date(firstPattern.lastDate.time) / 1000,// + 2 * oneDay
    };
    window.timeRange = timeRange;
    if (chart.model().mainSeries().symbol().split(':')[1] !== firstPattern.symbol)  {
      chart.setSymbol(firstPattern.symbol);
      __doWhenSeriesCompleted(function() {

          var timeScale = chart.R99.timeScale();
          var indexPoints = [timeScale.timePointToIndex(timeRange.from)];
          indexPoints[1] = indexPoints[0] - 1 +  parseInt(baseBar);
          chartDom.KeyStone.drawKsDateRangeLineTool(indexPoints, 0);
          chartDom.KeyStone.centerPredictionPoint([indexPoints[0], indexPoints[1]+1], chart.model());
          
          window.timeRange = timeRange;
          chart.model().removeAllDrawingTools();
          chart.model().mainSeries().restart();

          __doWhenSeriesCompleted(function() {
              console.debug('__doWhenSeriesCompleted in tradingview');
              // chart.model().resetPriceScale(chart._paneWidgets[0].state(), chart.model().mainSeries().priceScale());
              window.parent.widget_comparator.setVisibleRange(timeRange, '0', function() {
                  console.debug('timeframe cb');
                  // var indexPoints = [timeScale.visibleBars().firstBar() + 1, timeScale.visibleBars().firstBar() + parseInt(baseBar)];
                  var timeScale = chart.R99.timeScale();
                  var indexPoints = [timeScale.timePointToIndex(timeRange.from)];
                  indexPoints[1] = indexPoints[0] - 1 +  parseInt(baseBar);
                  chartDom.KeyStone.drawKsDateRangeLineTool(indexPoints, 0);
                  chartDom.KeyStone.centerPredictionPoint([indexPoints[0], indexPoints[1]+1], chart.model());
              }, timeRange.from);
          }, chartDom);
      }, chartDom);
          // KeyStone.alignSerieToCenter();
      
  	} else {
      // chart.model().resetPriceScale(chart._paneWidgets[0].state(), chart.model().mainSeries().priceScale());
      chart.model().removeAllDrawingTools();

      chart.model().mainSeries().restart();
      __doWhenSeriesCompleted(function() {
          window.parent.widget_comparator.setVisibleRange(timeRange, '0', function(){
              // var indexPoints = [timeScale.visibleBars().firstBar() + 1, timeScale.visibleBars().firstBar() + parseInt(baseBar)];
              var timeScale = chart.R99.timeScale();
              var indexPoints = [timeScale.timePointToIndex(timeRange.from)];
              indexPoints[1] = indexPoints[0] - 1 +  parseInt(baseBar);
              chartDom.KeyStone.drawKsDateRangeLineTool(indexPoints, 0);
              chartDom.KeyStone.centerPredictionPoint([indexPoints[0], indexPoints[1]+1], chart.model());
          });
      }, chartDom);   
 	 }

	}

};
*/

module.exports = {
	setComparatorVisibleRange,
	setComparatorPosition,
	setStockViewSymbol,
	setStockViewVisibleRange
	// updateTradingviewAfterSearch,
}
