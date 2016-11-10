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

let _comparatorDoms = {
	time:null,
	total:null,
	similarity:null
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
let _earnchartDom = null;

let _yMin = 0;
let _yMax = 200;
let _decimal = 2;

let _klineChart = null;
let _earnChart = null;

let toggleHtml = `<div class="container-toggle float transition-all"><div class="btn-container transition-position transition-duration2"><div class="item title">搜索<span class='title-jieguo'>结果</span><span class='title-zhong'>中</span></div><div class="item btn-toggle"><span class='arrow-icon'></div></div></div>`;
let _$toggle = null;

let patternHtml = `<div class='pattern-inner'>
										<span class='info-item symbol ks-abbr'><div class='item-value font-number size10'>--</div><abbr class='item-title font-simsun'>--</abbr></span>
										<span class='kline'><canvas></canvas></span>
										<span class='info-item similarity'><div class='item-title font-simsun'>相似度</div><div class='item-value font-number small red'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
										<span class='info-item earn'><div class='item-title font-simsun'>涨跌</div><div class='item-value font-number small'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
									</div>`;
let comparatorInner = `<div class='container-ks-sr container-ks-st meta'>
												<h3 class='title font-msyh'>匹配相似结果</h3>
												<span class='split-line l1'></span>
												<span class='split-line l2'></span>
												<span class='info-item timespent'><div class='item-title font-simsun'>搜索用时</div><div class='item-value font-number'><span class='value'>0.000</span><span class='unit'>秒</span></div></span>
												<span class='info-item total'><div class='item-title font-simsun'>搜索结果总数</div><div class='item-value font-number'><span class='value'>0</span><span class='unit'>个</span></div></span>
												<span class='info-item similarity-top'><div class='item-title font-simsun'>相似度最高</div><div class='item-value font-number red'><span class='value'>0.0</span><span class='unit'>%</span></div></span>
												<span class='pattern-wrapper'>${patternHtml}</span>
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

let wrappersDomStr = `<div class='transition-all container-searchreport static'>
												<div class='inner-searchreport white transition-all'>
													<div class='search-report-wrapper white ${true ? 'slide-down' : ''} transition-top transition-duration2'>
														${comparatorInner}
														${searchStatisticHtml}
														${searchChartHtml}
													</div>
												</div>
											</div>`;

let cacheDom = ($wrapper) => {
	_$reportContainer = $wrapper;
	_$reportWrapper = $wrapper.find('.search-report-wrapper');

	_comparatorDoms.time = $wrapper.find('.info-item.timespent .value');
	_comparatorDoms.total = $wrapper.find('.info-item.total .value');
	_comparatorDoms.similarity = $wrapper.find('.info-item.similarity-top .value');

	_statisticDoms.days = $wrapper.find('.info-item.bars .value');
	_statisticDoms.upRate = $wrapper.find('.info-item.uprate .value');
	_statisticDoms.median = $wrapper.find('.info-item.median .value');
	_statisticDoms.mean = $wrapper.find('.info-item.mean .value');

	_patternDoms.symbol = $wrapper.find('.info-item.symbol .item-value');
	_patternDoms.name = $wrapper.find('.info-item.symbol .item-title');
	_patternDoms.canvas = $wrapper.find('.pattern-inner canvas');
	_patternDoms.similarity = $wrapper.find('.info-item.similarity .value');
	_patternDoms.earn = $wrapper.find('.info-item.earn .value');

	_earnchartDom = $wrapper.find('.earnchart');
};

let _updateKline = (kline) => {
	_klineChart = _klineChart || new KlineChart(_patternDoms.canvas[0]);
	_klineChart.setData(kline);
}

let _resizeKline = () => {
	_klineChart && _klineChart.resize();
};

let _updatePatternUI = (symbol, name, similarity, earn, kline, decimal) => {
	symbol = symbol || '',
	name = name || '',
	similarity = similarity || 0,
	earn = earn || 0,
	kline = kline || [];

	decimal = decimal || 2;

	similarity = parseFloat(similarity * 100).toFixed(1);
	earn = parseFloat(earn * 100).toFixed(decimal);

	_patternDoms.symbol.text(symbol);
	_patternDoms.name.text(name).attr('title', name);
	_patternDoms.similarity.text(similarity);
	_patternDoms.earn.text(earn);

	_updateKline(kline);
};

let _updatePredictionUI = (timespent, total, similarityTop) => {
	timespent = timespent || 0,
	total = total || 0,
	similarityTop = similarityTop || 0;
	
	timespent = parseFloat(timespent/1000).toFixed(2);
	similarityTop = parseFloat(similarityTop * 100).toFixed(1)

	_comparatorDoms.time.text(timespent);
	_comparatorDoms.similarity.text(similarityTop);
	_comparatorDoms.total.text(total);
};

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

let _resizeEarnChart = () => {
	if(!_earnChart) return;
	let width = _earnchartDom.width(),
			height = _earnchartDom.height();
	setTimeout(() => {
		_earnChart.width(width).height(height).redraw(); 
	});
	setTimeout(()=> {_earnChart.renderYAxis(_earnChart) });
	setTimeout(() => {_earnChart.renderXAxis(_earnChart) });
};

let _handleResize = () => {
	_resizeKline();
	_resizeEarnChart();
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
	if(_$toggle.find('.btn-container').hasClass('slide-center') || store.getState().patterns.error) {
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

	let searchTimeSpent = searchMetaData.searchTimeSpent,
			kline = pattern0.kLine || [],
			total = patterns.rawData && patterns.rawData.length,
			similarityTop = pattern0.similarity,
			symbol = pattern0.symbol,
			name = pattern0.metaData && pattern0.metaData.name,
			earn = pattern0.yield,
			similarity = pattern0.similarity,
			decimal = getDecimalForStatistic();

	let baseBars = pattern0.baseBars || Infinity;

	_updatePredictionUI(searchTimeSpent, total, similarityTop);
	_updatePatternUI(symbol, name, similarity, earn, kline.slice(0, baseBars), decimal);
};

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

searchResultController.updatePatterns = (patternsArr, firstFiveIds) => {
	// if(!_$root) return;
	// firstFiveIds = firstFiveIds || [0,1,2,3,4];
	// let firstFivePatterns = firstFiveIds.map(function(id) {
	// 	return patternsArr[id];
	// })
	// _decimal = getDecimalForStatistic();
	// _updatePatternViews(firstFivePatterns, {decimal:_decimal});
};

searchResultController.updateCharts = (patterns) => {
	let rawData = patterns && patterns.rawData || [];
	_updateEarnChart(rawData);
};

searchResultController.reportSlideDown = (slideDown, cb) => { 
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

	let title = '本次搜索失败了',
			errorBody = `<span>请您尝试</span><button class='research'>重新搜索</button><span>或返回</span><button class='back'>上一次搜索</button>`;

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
};

searchResultController.triggerToggle = () => {
	_triggerToggle();
};

module.exports = searchResultController;

