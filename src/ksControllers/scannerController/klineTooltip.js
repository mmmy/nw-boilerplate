
import PredictionWidget from '../PredictionWidget';
var _dataFeed = null;
var _chart = null;

module.exports = function($nodes){

	_dataFeed = _dataFeed || new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);
	// _dataFeed.searchSymbolsByName('','','',function(list){
	// 	console.log('list inited');
	// });
	var mouseenter = function(e){
		var $target = $(e.currentTarget);
		if($target.find('.kline-tooltip-container').length > 0) return;

		var tooltip = $('<div class="kline-tooltip-container"><div><span class="symbol"></span><span class="close-price">当日收盘:<span class="value"></span></span></div><div class="chart prediction-chart"></div></div>');
		var $item = $target.closest('.item'),
				$listWrapepr = $item.parent();
		var data = $item.data().data || {};
		var { kline, pricePast } = data;

		if($listWrapepr.height() - $item.position().top < 200) {
			tooltip.addClass('bottom');
		}
		tooltip.find('.symbol').text(`${data.name}(${data.symbol})`);
		tooltip.find('.close-price .value').text(pricePast && pricePast.toFixed(2) || '--');
		tooltip.appendTo($target);

		var initChart = (kline)=>{
			_chart = new PredictionWidget(tooltip.find('.chart')[0], {yMarks:[{value:pricePast}], showRange: false, slient: true, axis: true, padding:{right:0}, yWidth: 40});
			_chart.setData(kline, [], null, 0);
		};
		if(!kline) {
			tooltip.find('.chart').append('<div class="waiting-overlay flex-center"><i class="fa fa-spin fa-circle-o-notch"></i></div>');
			//fetch kline data
			var symbolInfo = {
				ticker: data.name,  //important
				symbol: data.symbol,
			};
			var handleData = (kline) => {
				data.kline = kline;
				tooltip.find('.waiting-overlay').remove();
				initChart(kline);
			};
			var handleError = (err) => {
				console.error(err);
			};
			var now = Math.round(new Date() / 1000);
			_dataFeed.getBars(symbolInfo, 'D', now, now, handleData, handleError, {arrayType:true, number: 30});
		} else { //render
			initChart(kline);
		}
	};
	var mouseleave = function(e){
		var $target = $(e.currentTarget);
		$target.find('.kline-tooltip-container').remove();
	};
	$nodes.on('mouseenter.kline',mouseenter).on('mouseleave.kline',mouseleave);
	// setTimeout(()=>{ $($nodes[5]).trigger('mouseenter'); }, 5000 )
}