//搜索结果底部展示controller
// import { splitData, generateSeries, generateKlineOption, getKlineImgSrc } from './publicHelper';
// import { generateHeatMapOption } from '../components/utils/heatmap-options';
import statisticKline from '../components/utils/statisticKline';
// import echarts from 'echarts';
import painter from './painter';
// import store from '../store';
import { getDecimalForStatistic } from '../shared/storeHelper';
// import PredictionWidget from './PredictionWidget';
// import BlockHeatMap from './BlockHeatMap';
import KlineChart from './KlineChart';

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
}

let _yMin = 0;
let _yMax = 200;
let _decimal = 2;

let _klineChart = null;

let toggleHtml = `<div class="container-toggle float transition-all"><div class="btn-container transition-position transition-duration2"><div class="item title">搜索<span class='title-jieguo'>结果</span></div><div class="item btn-toggle"><i class="fa fa-angle-up"></i></div></div></div>`;
let _$toggle = null;

let patternHtml = `<div class='pattern-inner'>
										<span class='info-item symbol'><div class='item-value font-number small'>00001.SZ</div><div class='item-title font-simsun'>平安英行</div></span>
										<span class='kline'><canvas></canvas></span>
										<span class='info-item similarity'><div class='item-title font-simsun'>相似度</div><div class='item-value font-number small'><span class='value'>99.5</span><span class='unit'>%</span></div></span>
										<span class='info-item earn'><div class='item-title font-simsun'>回报</div><div class='item-value font-number small red'><span class='value'>0.23</span><span class='unit'>%</span></div></span>
									</div>`;
let comparatorInner = `<div class='container-ks-sr container-ks-st meta'>
												<h3 class='title font-msyh'>匹配相似结果</h3>
												<span class='split-line l1'></span>
												<span class='split-line l2'></span>
												<span class='info-item timespent'><div class='item-title font-simsun'>搜索用时</div><div class='item-value font-number'><span class='value'>0.023</span><span class='unit'>秒</span></div></span>
												<span class='info-item total'><div class='item-title font-simsun'>搜索结果总数</div><div class='item-value font-number'><span class='value'>200</span><span class='unit'>个</span></div></span>
												<span class='info-item similarity-top'><div class='item-title font-simsun'>相似度最高</div><div class='item-value font-number'><span class='value'>99.5</span><span class='unit'>%</span></div></span>
												<span class='pattern-wrapper'>${patternHtml}</span>
											</div>`;

let searchStatisticHtml = `<div class='container-ks-sr statistic'>
														<h3 class='title font-msyh'>数据统计</h3>
														<span class='split-line l1'></span>
														<span class='split-line l2'></span>
														<span class='split-line l3'></span>
														<span class='info-item bars'><div class='item-title font-simsun'>统计K线数</div><div class='item-value font-number'><span class='value'>30</span></div></span>
														<span class='info-item uprate'><div class='item-title font-simsun'>上涨比例</div><div class='item-value font-number'><span class='value'>66.3</span><span class='unit'>%</span></div></span>
														<span class='info-item median'><div class='item-title font-simsun'>收益中位数</div><div class='item-value font-number'><span class='value'>30.3</span><span class='unit'>%</span></div></span>
														<span class='info-item mean'><div class='item-title font-simsun'>收益平均值</div><div class='item-value font-number'><span class='value'>30</span><span class='unit'>%</span></div></span>
													</div>`;

let searchChartHtml = `<div class='container-ks-sr chart'>
												<h3 class='title font-msyh'>收益率统计</h3>
											</div>`;

let wrappersDomStr = `<div class='transition-all container-searchreport static'>
												<div class='inner-searchreport transition-all'>
													<div class='search-report-wrapper ${false ? 'slide-down' : ''} transition-top transition-duration2'>
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
};

let _updateKline = (kline) => {
	_klineChart = _klineChart || new KlineChart(_patternDoms.canvas);
	_klineChart.setData(kline);
}

let _resizeKline = () => {
	_klineChart && _klineChart.resize();
};

let _updatePatternUI = (pattern, decimal) => {
	pattern = pattern || {};
	let symbol = pattern.symbol || '',
			name = pattern.name || '',
			similarity = pattern.similarity || 0,
			earn = pattern.yield || 0,
			kline = pattern.kline || [];

	similarity = parseFloat(similarity).toFixed(1);
	earn = parseFloat(earn).toFixed(decimal);

	_patternDoms.symbol.text(symbol);
	_patternDoms.name.text(name);
	_patternDoms.similarity.text(similarity);
	_patternDoms.earn.text(earn);

	_updateKline(kline);
};

let _updatePredictionUI = (patterns) => {
	patterns = patterns || {};
	let timespent = patterns.timespent || 0,
			total = patterns.rawData && patterns.rawData.length || 0,
			similarityTop = patterns.rawData && patterns.rawData[0] && patterns.rawData[0].similarity,
			firstPattern = patterns.rawData && patterns.rawData[0];
	
	similarityTop = parseFloat(similarityTop * 100).toFixed(1)

	_comparatorDoms.time.text(timespent);
	_comparatorDoms.similarity.text(similarityTop);
	_comparatorDoms.total.text(total);

	_updatePatternUI(firstPattern);
};

let _handleResize = () => {
	_resizeKline();
};

let _initResize = () => {
	window.addEventListener('resize', _handleResize);
};

let _initToggle = () => {
	return;
	_toggleSlideCenter(true);

	_$toggle.find('.btn-container').click(function(event) {
		/* Act on the event */
		if($(event.target).hasClass('slide-center')) {
			return;
		}

		let $detailReport = $('.container-searchreport:not(.static)');   //详情页
		let $comparatorContainer = $('#__comparator_prediction_container');
		$comparatorContainer.css('opacity', '0');
		$detailReport.css('opacity', '0');

		_$reportWrapper.css('display', 'none');

		_$reportContainer.one('transitionend', ()=>{
			let zIndex = $detailReport.css('z-index');
			if(zIndex == '0') {
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
	});
};

//拱石搜索按钮 滑动到中间
let _toggleSlideCenter = (slideCenter) => {
	_$toggle.find('.btn-container').toggleClass('slide-center', slideCenter);
	_$toggle.find('.btn-toggle')[slideCenter ? 'hide' : 'show']();
	_$toggle.find('.title-jieguo')[slideCenter ? 'hide' : 'show']();
}

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
	_updatePredictionUI(patterns);
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

searchResultController.reportSlideDown = (slideDown, cb) => {
	let $target = _$reportContainer.find('.search-report-wrapper');
	$target.one('transitionend', () => {
		cb && cb();
	});
	$target.toggleClass('slide-down', slideDown);
	_toggleSlideCenter(slideDown);
};

searchResultController.showErrorPanel = (searchKline) => {
	searchKline = searchKline || [];
	let $errorPanel = $(`<div class='error-panel flex-center'>
												<img/>
												<div>
													<h2>本次搜索失败了</h2>
													<p><span>请您尝试</span><button class='research'>重新搜索</button><span>或返回</span><button class='back'>上一次搜索</button></p>
												</div>
											</div>`);
	
	_$reportWrapper.append($errorPanel);

	$errorPanel.find('img').attr('src', getKlineImgSrc(searchKline));
	//重新搜索
	$errorPanel.find('.research').click(function(event) {
		/* Act on the event */
		// let actions = require('../flux/actions');
		store.dispatch(actions.patternActions.getPatterns({}));
	});
	//返回
	$errorPanel.find('.back').click(() => {
		searchResultController.removeErrorPanel();
	});
};

searchResultController.removeErrorPanel = () => {
	_$reportWrapper.find('.error-panel').remove();
};

module.exports = searchResultController;

