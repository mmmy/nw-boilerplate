//搜索结果底部展示controller
import { getKlineImgSrc } from './publicHelper';
// import { generateHeatMapOption } from '../components/utils/heatmap-options';
import statisticKline from '../components/utils/statisticKline';
// import echarts from 'echarts';
import painter from './painter';
import store from '../store';
import { getDecimalForStatistic } from '../shared/storeHelper';
// import PredictionWidget from './PredictionWidget';
// import BlockHeatMap from './BlockHeatMap';
import KlineChart from './KlineChart';
import DC from 'dc';
import d3 from 'd3';
import crossfilter from 'crossfilter';
// import AfterAnalysis from '../../vendor/AfterAnalysis';

let widerNumber = (num) => {
	let expNum = num.toExponential(); //'1.3e-2';
	let numSplit = expNum.split('e');
	let base = parseFloat(numSplit[0]);
	let plus = base > 0 ? 1 : -1;
	let ex = parseInt(numSplit[1]);

	let baseAbs = Math.abs(base);
	if(baseAbs >= 7.5) {
		return parseFloat(`1e${ex+1}`) * plus;
	}else if(baseAbs >=5){
		return parseFloat(`7.5e${ex}`) * plus;
	}else if(baseAbs >= 2.5){
		return parseFloat(`5e${ex}`) * plus;
	}else{
		return parseFloat(`2.5e${ex}`) * plus;
	}
};

const barChartBars = 20;

let _$root = null;

let _$reportContainer = null;
let _$reportWrapper = null;

let _searchResultInfo = {
	total:null, 							//xxx条相似结果
	timespent:null 						//耗时
};
let _comparatorDoms = {
	upRate:null,
	downRate:null,
	median:null,
	mean:null
};
let _statisticDoms = {
	days: null,
	upRate: null,
	median: null,
	mean: null,
};
let _patternDoms = {
	symbol:null,
	name:null,
	canvas:null,
	similarity:null,
	earn:null
};
// let _earnchartDom = null;

let _yMin = 0;
let _yMax = 200;
let _decimal = 2;

let _klineCharts = [];
// let _earnChart = null;

let toggleHtml = `<div class="container-toggle float transition-all"><div class="btn-container transition-position transition-duration2"><div class="item title"><span class='title-jieguo'>搜索结果</span><span class='title-zhong'>搜索中</span></div><div class="item btn-toggle"><span class='arrow-icon'></div></div></div>`;
let _$toggle = null;

let patternHtml = `<div class='pattern-inner'>
										<span class='info-item symbol ks-abbr'><div class='item-value font-number size10'>--</div><abbr class='item-title font-simsun'>--</abbr></span>
										<span class='kline'><canvas></canvas></span>
										<span class='info-item similarity'><div class='item-title font-simsun'>相似度</div><div class='item-value font-number small red'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
										<span class='info-item earn'><div class='item-title font-simsun'>涨跌</div><div class='item-value font-number small'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
									</div>`;
let comparatorInner = `<div class='container-ks-sr container-ks-st meta'>
												<h3 class='title font-msyh'>关键指标数据统计<span class="search-result-info"><span class="value total"></span>条相似结果, 耗时<span class="value timespent red"></span>秒</span></h3>
												<span class='split-line l1'></span>
												<span class='split-line l2'></span>
												<span class='split-line l3'></span>
												<span class='split-line l4'></span>
												<span class='info-item uprate'><div class='item-title font-simsun'>上涨比例</div><div class='item-value font-number'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
												<span class='info-item downrate'><div class='item-title font-simsun'>下跌比例</div><div class='item-value font-number'><span class='value'>0</span><span class='unit'>%</span></div></span>
												<span class='info-item median'><div class='item-title font-simsun'>涨跌中位数</div><div class='item-value font-number red'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
												<span class='info-item mean'><div class='item-title font-simsun'>涨跌平均数</div><div class='item-value font-number red'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
												<span class='patterns-container'>
													<span class='pattern-wrapper'>${patternHtml}</span>
													<span class='pattern-wrapper'>${patternHtml}</span>
													<span class='pattern-wrapper'>${patternHtml}</span>
												</span>
											</div>`;

let searchStatisticHtml = `<div class='container-ks-sr statistic'>
														<h3 class='title font-msyh'>历史指标统计</h3>
														<span class='split-line l1'></span>
														<span class='split-line l2'></span>
														<span class='split-line l3'></span>
														<span class='info-item bars'><div class='item-title font-simsun'>后向统计范围</div><div class='item-value font-number'><span class='value'>0</span></div></span>
														<span class='info-item uprate'><div class='item-title font-simsun'>上涨比例</div><div class='item-value font-number'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
														<span class='info-item median'><div class='item-title font-simsun'>涨跌中位数</div><div class='item-value font-number'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
														<span class='info-item mean'><div class='item-title font-simsun'>涨跌平均值</div><div class='item-value font-number'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
													</div>`;

let searchChartHtml = `<div class='container-ks-sr chart'>
												<h3 class='title font-msyh'>涨跌幅度统计</h3>
												<span class='earnchart-wrapper'><div class='earnchart'></div></span>
											</div>`;

let wrappersDomStr = `<div class='transition-size container-searchreport static'>
												<div class='inner-searchreport gray transition-all'>
													<div class='search-report-wrapper white ${true ? 'slide-down' : ''} transition-top transition-duration2'>
														${comparatorInner}
													</div>
												</div>
											</div>`;

let cacheDom = ($wrapper) => {
	_$reportContainer = $wrapper;
	_$reportWrapper = $wrapper.find('.search-report-wrapper');

	_searchResultInfo.total = $wrapper.find('.search-result-info .value.total');
	_searchResultInfo.timespent = $wrapper.find('.search-result-info .value.timespent');

	_comparatorDoms.upRate = $wrapper.find('.info-item.uprate .value');
	_comparatorDoms.downRate = $wrapper.find('.info-item.downrate .value');
	_comparatorDoms.median = $wrapper.find('.info-item.median .value');
	_comparatorDoms.mean = $wrapper.find('.info-item.mean .value');

	/*
	_statisticDoms.days = $wrapper.find('.info-item.bars .value');
	_statisticDoms.upRate = $wrapper.find('.info-item.uprate .value');
	_statisticDoms.median = $wrapper.find('.info-item.median .value');
	_statisticDoms.mean = $wrapper.find('.info-item.mean .value');
	*/

	_patternDoms.symbol = $wrapper.find('.info-item.symbol .item-value');
	_patternDoms.name = $wrapper.find('.info-item.symbol .item-title');
	_patternDoms.canvas = $wrapper.find('.pattern-inner canvas');
	_patternDoms.similarity = $wrapper.find('.info-item.similarity .value');
	_patternDoms.earn = $wrapper.find('.info-item.earn .value');

	// _earnchartDom = $wrapper.find('.earnchart');
};

let _updateKline = (kline, index) => {
	_klineCharts[index] = _klineCharts[index] || new KlineChart(_patternDoms.canvas[index]);
	_klineCharts[index].setData(kline);
}

let _resizeAllKline = () => {
	for(var i=0, len=_klineCharts.length; i<len; i++) {
		_klineCharts[i] && _klineCharts[i].resize();
	}
};

let _updatePatternUI = (index, {symbol, name, similarity, earn, kline, decimal}) => {
	symbol = symbol || '',
	name = name || '',
	similarity = similarity || 0,
	earn = earn || 0,
	kline = kline || [];

	decimal = decimal || 2;

	similarity = parseFloat(similarity * 100).toFixed(1);
	earn = parseFloat(earn * 100).toFixed(decimal);

	$(_patternDoms.symbol[index]).text(symbol);
	$(_patternDoms.name[index]).text(name).attr('title', name);
	$(_patternDoms.similarity[index]).text(similarity);
	$(_patternDoms.earn[index]).text(earn);

	_updateKline(kline, index);
	//if kline length is 0, 隐藏整个
	$(_patternDoms.symbol[index]).closest('.pattern-wrapper').toggleClass('blank', kline.length==0);
};

let _updatePredictionUI = ({timespent, total, model}) => {
	timespent = timespent || 0;
	total = total || 0;
	const decimal = getDecimalForStatistic();

	try {
		let uprateStr = (model.upPercent*100).toFixed(1);
		let downRateStr = (model.downPercent * 100).toFixed(1);
		let medianStr = (model.median*100).toFixed(decimal);
		let meanStr = (model.mean*100).toFixed(decimal);
		timespent = parseFloat(timespent/1000).toFixed(2);
		//update doms
		_searchResultInfo.total.text(total);
		_searchResultInfo.timespent.text(timespent);
		//
		_comparatorDoms.upRate.text(uprateStr);
		_comparatorDoms.downRate.text(downRateStr);
		_comparatorDoms.median.text(medianStr);
		_comparatorDoms.mean.text(meanStr);
	} catch(e) {
		console.error(e);
	}

	// _comparatorDoms.time.text(timespent);
	// _comparatorDoms.total.text(total);
};
/*
let _createEarnDimension = (rawDataArr) => {
	rawDataArr = rawDataArr || [];
	let scalize = (arr) => { //arr = [num, num]    =>  1:1 or 1:4 or 2:3
		let left = arr[0],
				right = arr[1];
		if(left >= 0) return arr;
		let max = Math.max(-left, right);
		return [-max, max];
	};
	let crossFilter = crossfilter(rawDataArr.concat([]));
	let yield100Arr = rawDataArr.map((pattern) => {
		return pattern.yield * 100;
	});
	let yield100Range = [Math.min.apply(null, yield100Arr), Math.max.apply(null, yield100Arr)];
	yield100Range[0] = widerNumber(yield100Range[0]);
	yield100Range[1] = widerNumber(yield100Range[1]);
	yield100Range = scalize(yield100Range);
	//fix 搜索结果只有一个的时候的bug
	if(yield100Range[0] == yield100Range[1]) {
		yield100Range[0] < 0 ? (yield100Range[1] = -yield100Range[0]) : (yield100Range[0] = -yield100Range[0]);
	}
	
	let rangeInterval = (yield100Range[1] - yield100Range[0] ) / barChartBars;
	let earnDimension = crossFilter.dimension((data) => {
		return Math.floor((data.yield*100 - yield100Range[0]) / rangeInterval);
	});
	return {
		earnDimension,
		rangeInterval,
		yield100Range,
	};
};
*/
/*
let _updateEarnChart = (rawDataArr) => {
	let {earnDimension, rangeInterval, yield100Range} = _createEarnDimension(rawDataArr);
	let minYield100 = yield100Range[0];
	let width = _earnchartDom.width(),
			height = _earnchartDom.height();
	let group = earnDimension && earnDimension.group();
	_earnChart = _earnChart || DC.barChart(_earnchartDom[0]);
	_earnChart.width(width)
						.height(height)
						.margins({top: 0, right: 10, bottom: 15, left: 20})
						.dimension(earnDimension)
						.group(group)
						.renderHorizontalGridLines(false)
						.colors('#4F4F4F')
						.gap(1)
						.transitionDuration(0)
						.elasticY(true)
						.elasticX(false)
						.brushOn(false)
						.renderTitle(false)
						.x(d3.scale.linear().domain([0, barChartBars+1]));
	
	_earnChart.xAxis().tickFormat((v) => {
		var yieldRate = v * rangeInterval + minYield100;
		return (yieldRate + '').slice(0, yieldRate>=0 ? 4 : 5) + '%'; 
	}).ticks(6).innerTickSize(5);
	_earnChart.yAxis().tickFormat(d3.format('d')).ticks(5).innerTickSize(5);
	_earnChart.render();
	_earnChart.redraw();
};
*/

// let _resizeEarnChart = () => {
// 	if(!_earnChart) return;
// 	let width = _earnchartDom.width(),
// 			height = _earnchartDom.height();
// 	setTimeout(() => {
// 		_earnChart.width(width).height(height).redraw(); 
// 	});
// 	setTimeout(()=> {_earnChart.renderYAxis(_earnChart) });
// 	setTimeout(() => {_earnChart.renderXAxis(_earnChart) });
// };

let _handleResize = () => {
	_resizeAllKline();
	// _resizeEarnChart();
};

let _initResize = () => {
	window.addEventListener('resize', _handleResize);
};
//更新详情页
let updateDetailPane = () => {
	try {
		let actions = require('../flux/actions');
		store.dispatch(actions.patternActions.changePatternsAsync());
	} catch(e) {
		console.error(e);
	}
};

let _triggerToggle = () => { //作为外部接口
	if(_$toggle.hasClass('disabled') || _$toggle.find('.btn-container').hasClass('slide-center') || store.getState().patterns.error) {
		if ((process.env.NODE_ENV !== 'development') && (process.env.NODE_ENV !== 'beta')) {
			return;
		}
		// return;
	}
	let $detailReport = $('.container-searchreport:not(.static)');   //详情页
	let $comparatorContainer = $('#__comparator_prediction_container');
	$comparatorContainer.css('opacity', '0');
	$detailReport.css('opacity', '0');

	_$reportWrapper.css('display', 'none');

	_$reportContainer.one('transitionend', ()=>{
		let zIndex = $detailReport.css('z-index');
		if(zIndex == '0') {
			updateDetailPane();
			$detailReport.css({'z-index':'2', 'opacity':'1'});
			$comparatorContainer.css({'z-index':'3', 'opacity':'1'});
		}else {
			$detailReport.css('z-index', '0');
			$comparatorContainer.css('z-index', '0');
			_$reportWrapper.css('display', 'block');
			//resize charts
			_handleResize();
		}
	});
	_$reportContainer.toggleClass('searchreport-full');
	_$toggle.toggleClass('up');
	_$toggle.find('.btn-toggle').toggleClass('rotate');
};

let _initToggle = () => {

	_toggleSlideCenter(true, false);

	_$toggle.find('.btn-container').click(function() {
		/* Act on the event */
		_triggerToggle();
	});
};

//拱石搜索按钮 滑动到中间
let _toggleSlideCenter = (slideCenter, isSearching) => {
	_$toggle.find('.btn-container').toggleClass('slide-center', slideCenter);
	_$toggle.find('.btn-toggle')[slideCenter ? 'hide' : 'show']();
	_$toggle.find('.title-jieguo')[slideCenter ? 'hide' : 'show']();
	_$toggle.find('.title-zhong')[slideCenter&&isSearching ? 'show': 'hide']();
};
let _hideBtnToggle = (hide) => {
	_$toggle.find('.btn-toggle')[hide ? 'hide' : 'show']();
};

let searchResultController = {};

searchResultController.init = (root) => {
	if(_$root) {
		console.warn('searchResultController has been inited!!');
		return;
	}
	_$root = $(root);
	//toggler bar
	_$toggle = $(toggleHtml);
	_initToggle();
	_$root.append(_$toggle);
	//搜索结果展示
	let $resultWrapper = $(wrappersDomStr);
	cacheDom($resultWrapper);
	_$root.append($resultWrapper);
	_initResize();
};

searchResultController.updatePrediction = (patterns) => {
	if(!_$root) return;

	patterns = patterns || {};
	let searchMetaData = patterns.searchMetaData || {}
	let pattern0 = patterns.rawData && patterns.rawData[0] || {};
	let pattern1 = patterns.rawData && patterns.rawData[1] || {};
	let pattern2 = patterns.rawData && patterns.rawData[2] || {};

	let timespent = searchMetaData.searchTimeSpent,
			decimal = getDecimalForStatistic(),
			total = patterns.rawData && patterns.rawData.length;
			// similarityTop = pattern0.similarity,

	let baseBars = pattern0.baseBars || Infinity;
	// //泽贤模块
	// let model = new AfterAnalysis(patterns.closePrice || []);
	// model.summary();
	let model = statisticKline(patterns.rawData);

	_updatePredictionUI({timespent, total, model});

	[pattern0, pattern1, pattern2].forEach(function(pattern, i) {
		let kline = pattern.kLine || [],
		symbol = pattern.symbol,
		name = pattern.metaData && pattern.metaData.name,
		earn = pattern.yield,
		similarity = pattern.similarity;

		_updatePatternUI(i, {symbol, name, similarity, earn, kline:kline.slice(0, baseBars), decimal});
		// _updatePatternUI(1, {symbol:symbol1, name:name1, similarity:similarity1, earn:earn1, kline:kline1.slice(0, baseBars), decimal});
	});
};
/*
searchResultController.updateStatistics = (patterns) => {
	if(!_$root) return;

	_decimal = getDecimalForStatistic();
	const decimal = _decimal;
	let { searchConfig, crossFilter } = patterns;
	let daysStr = searchConfig && searchConfig.additionDate && searchConfig.additionDate.value || '0';

	let symbolDim = crossFilter.dimension((d) => { return d.symbol;});
	let klines = symbolDim.top(Infinity);
	let statisticsData = statisticKline(klines);
	symbolDim.dispose();

	let uprateStr = (statisticsData.upPercent*100).toFixed(1);
	let medianStr = (statisticsData.median*100).toFixed(decimal);
	let meanStr = (statisticsData.mean*100).toFixed(decimal);

	_statisticDoms.days.text(daysStr);
	_statisticDoms.upRate.text(uprateStr);
	_statisticDoms.median.text(medianStr);
	_statisticDoms.mean.text(meanStr);
};
*/

searchResultController.updatePatterns = (patternsArr, firstFiveIds) => {
	// if(!_$root) return;
	// firstFiveIds = firstFiveIds || [0,1,2,3,4];
	// let firstFivePatterns = firstFiveIds.map(function(id) {
	// 	return patternsArr[id];
	// })
	// _decimal = getDecimalForStatistic();
	// _updatePatternViews(firstFivePatterns, {decimal:_decimal});
};
/*
弃用
--------------------------- */
/*
searchResultController.updateCharts = (patterns) => {
	let rawData = patterns && patterns.rawData || [];
	_updateEarnChart(rawData);
};
*/
searchResultController.reportSlideDown = (slideDown, cb) => {
	_$toggle.removeClass('disabled'); 
	let $target = _$reportContainer.find('.search-report-wrapper');
	$target.off('transitionend', '**');
	$target.one('transitionend', () => {
		cb && cb();
	});
	$target.toggleClass('slide-down', slideDown);
	_toggleSlideCenter(slideDown, true);
	if(!slideDown) {
		_hideBtnToggle(store.getState().patterns.error);
	}
};

searchResultController.showErrorPanel = (searchKline, error) => {
	searchKline = searchKline || [];
	let lastHasData = store.getState().patterns.rawData.length > 0;
	let onLine = window.navigator.onLine;
	let title = `本次搜索失败了 ${onLine ? "" : "<span class='subtitle'>请检查你的网络连接</span>"}`,
			errorBody = `<span>请您尝试</span><button class='research'>重新搜索</button>${lastHasData ? "<span>或返回</span><button class='back'>上一次搜索</button>" : "" }`;

	if(error && (error.type == 'no_data')) {
		title = `本次搜索结果数为 "0"`;
		errorBody= "请您尝试修改搜索条件, 然后重试";
	}

	let $errorPanel = $(`<div class='error-panel flex-center'>
												<img/>
												<div>
													<h2>${title}</h2>
													<p>${errorBody}</p>
												</div>
											</div>`);
	
	_$reportWrapper.append($errorPanel);

	_$toggle.find('.btn-toggle').hide();

	$errorPanel.find('img').attr('src', getKlineImgSrc(searchKline));

	//直接全部隐藏
	_$toggle.addClass('disabled');
	//重新搜索
	$errorPanel.find('.research').click(function(event) {
		/* Act on the event */
		let actions = require('../flux/actions');
		store.dispatch(actions.patternActions.getPatterns({}));
	});
	//返回
	$errorPanel.find('.back').click(() => {
		searchResultController.removeErrorPanel();
		_$toggle.find('.btn-toggle').show();
	});
};

searchResultController.removeErrorPanel = () => {
	_$reportWrapper.find('.error-panel').remove();
	_$toggle.removeClass('disabled'); 
};

searchResultController.triggerToggle = () => {
	_triggerToggle();
};

module.exports = searchResultController;

