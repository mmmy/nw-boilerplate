//搜索结果底部展示controller
import { splitData, generateSeries, generateKlineOption, getKlineImgSrc } from './publicHelper';
import { generateHeatMapOption } from '../components/utils/heatmap-options';
import statisticKline from '../components/utils/statisticKline';
import echarts from 'echarts';
import painter from './painter';
import store from '../store';
import { getDecimalForStatistic } from '../shared/storeHelper';

let _$root = null;

let _$reportContainer = null;
let _$reportWrapper = null;
let _$echartContainer = null;
let _$heatmapContainer = null;

let _statisticDoms = {
	days: null,
	upRate: null,
	median: null,
	mean: null,
};

let _$patternViews = null;

let _echart = null;
let _heatMapChart = null;

let _yMin = 0;
let _yMax = 200;
let _decimal = 2;

let toggleHtml = `<div class="container-toggle float transition-all"><div class="btn-container transition-position transition-duration2"><div class="item title">搜索<span class='title-jieguo'>结果</span></div><div class="item btn-toggle"><i class="fa fa-angle-up"></i></div></div></div>`;
let _$toggle = null;

let comparatorInner = `<div class='comparator-inner'>
												<h3 class='title'>匹配图形&走势分布</h3>
												<div class='searching-info font-simsun'>
													<span class='searching-info-content'></span>
													<span class='searching-info--prediction-lable'>走势分布</span>
												</div>
												<div class='echart-container'></div>
												<div class='heatmap-container'></div>
											</div>`;

let searchDetail = `<div class='statistics-container'>
											<div class='statistics-container-inner'>
												<div class='transition-all transition-delay2 report-container-wrap font-simsun stretch'>
													<div class='reportdetail-container'>
														<h3 class='title font-msyh'>数据统计</h3>
														<span class='split-line l1'></span>
														<span class='split-line l2'></span>
														<span class='split-line l3'></span>
														<div class="position-ab text-center transition-all days mama">统计K线数</div>
														<div class="position-ab text-center transition-all days-value font-number mama">0</div>
														<div class="position-ab text-center transition-all up-rate mama">上涨比例</div>
														<div class="__fadeIn position-ab text-center transition-all up-rate-value font-number mama"><span class='value'>0.0</span><span>%</span></div>
														<div class="position-ab text-center transition-all median mama"><span>收益中位数</span></div>
														<div class="__fadeIn position-ab text-center transition-all median-value font-number mama"><span class='value'>0.0</span><span>%</span></div>
														<div class="position-ab text-center transition-all mean mama"><span>收益平均值</span></div>
														<div class="__fadeIn position-ab text-center transition-all mean-value font-number mama"><span class='value'>0.0</span><span>%</span></div>
													</div>
												</div>
											</div>
										</div>
										<div class='pattern-container transition-all'>
											<div class='transition-all pattern-collection-container stretch'>
												<div class='pattern-collection scroll-hidden'>
												</div>
												<h3 class="title">匹配结果</h3>
											</div>
										</div>`;

let wrappersDomStr = `<div class='transition-all container-searchreport static'>
												<div class='inner-searchreport transition-all'>
													<div class='search-report-wrapper slide-down transition-top transition-duration2'>
														<div class='container-comparator'>${comparatorInner}</div>
														<div class='container-searchdetail small'>${searchDetail}</div>
													</div>
												</div>
											</div>`;

let generatePatternsDom = (patternsArr) => {
	let generatorPattern = (isLarger, index) => {
		let addtionClass = isLarger ? 'larger' : 'smaller';
		let smallPattern = 's' + (index);
		return `<div class='pattern-view active column ${addtionClass} ${smallPattern}'>
							<div class="symbol-container font-arial"><span class='symbol'></span><p class="describe font-simsun"></p></div>
							<div class="echart-row-wrapper ${addtionClass}">
								<div class="echart transition-all ${addtionClass}">
									<h3 style="color:#d0d0d0;width:100px;">加载中...</h3>
									<div class='kline-canvas-wrapper'>
										<canvas class='kline-canvas' />
									</div>
								</div>
								<div class="pattern-info-container column ${addtionClass}">
									<div class="flex-container column">
										<div><h5 class="font-simsun">相似度</h5><p class="font-number similarity"><span class='value'>0.0</span><span>%</span></p></div>
										${ isLarger ? '<div><h5 class="font-simsun">回报</h5><p class="font-number return" style="color:#ae0006;"><span class="value">0.0</span>%</p></div>' : ''}
									</div>
								</div>
							</div>
						</div>`;
	};
	return [generatorPattern(true), generatorPattern(false, 1), generatorPattern(false, 2), generatorPattern(false, 3), generatorPattern(false, 4)];
};

let cacheDom = ($wrapper) => {
	_$reportContainer = $wrapper;
	_$reportWrapper = $wrapper.find('.search-report-wrapper');
	_$echartContainer = $wrapper.find('.echart-container');
	_$heatmapContainer = $wrapper.find('.heatmap-container');
	_statisticDoms.days = $wrapper.find('.days-value');
	_statisticDoms.upRate = $wrapper.find('.up-rate-value .value');
	_statisticDoms.median = $wrapper.find('.median-value .value');
	_statisticDoms.mean = $wrapper.find('.mean-value .value');

	_$patternViews = $wrapper.find('.pattern-view');
};

let _updateKlineChart = (patterns) => {
  let { searchMetaData, closePrice, searchConfig } = patterns;
  let { kline } = searchMetaData;
  let data0 = splitData(kline, (searchConfig && searchConfig.additionDate.value) || (closePrice[0] && closePrice[0].length));
  let lastClosePrice = data0.values[data0.values.length-1][1];
  let { lineSeries, min, max } = generateSeries(closePrice, lastClosePrice);
  var offset = Math.max(data0.yMax - lastClosePrice, lastClosePrice - data0.yMin);
  var offset1 = Math.max(max - lastClosePrice, lastClosePrice - min);

  //option
  let option = generateKlineOption();
  option.series = option.series.slice(0,1).concat(lineSeries);
  option.series[0].data = data0.values;
  option.xAxis.data = data0.categoryData;
  option.yAxis[0].min = lastClosePrice - offset;
  option.yAxis[0].max = lastClosePrice + offset;      
  option.yAxis[1].min = lastClosePrice - offset1;
  option.yAxis[1].max = lastClosePrice + offset1;

  _echart && _echart.dispose();
  _echart =  echarts.init(_$echartContainer[0]);
  _echart.setOption(option, true);

  let y2diff = lastClosePrice + offset1;
  try { 
    _updateHeatMap(offset1 * 2, lastClosePrice + offset1, lastClosePrice - offset1);
  } catch(e) {
    console.error(e);
  }  
};

let _initHeatMap = () => {
	let option = generateHeatMapOption();
  let $chartDom = _$heatmapContainer;
  let fillSpaceLeft = (text, len) => {
	  len = len || 0;
	  while(text.length < len) {
	    text = ' ' + text;
	  }
	  return text;
	};
	option.grid.left = 0.5;
  option.grid.right = 35.5;
  option.grid.top = -0.5;
  option.grid.bottom = -0.5;
  option.yAxis.axisLabel.margin = 0;
  option.yAxis.axisLabel.fontSize = 3;
  option.yAxis.axisLabel.color = 'red';
  option.yAxis.axisLabel.formatter = function(params){
          // console.debug(arguments);
          if(!params) return;
          var points = params.split(':');
          // var center = (parseFloat(points[0]) + parseFloat(points[1])) / 2;
          var domH = $chartDom.height();
          var top = (parseFloat(points[1]));
          if(Math.abs(top - domH) < 5) {
          	return '';
          }
          var closePrice = (_yMax + _yMin)/2;
          var centerPrice = (top / $chartDom.height()) * (_yMax - _yMin) + _yMin;
          var percentage = (centerPrice - closePrice) / closePrice * 100;//(_yMax - _yMin) / $chartDom.height() * center + _yMin;
          return  fillSpaceLeft(percentage.toFixed(_decimal) + '%', 7);
        };

  _heatMapChart = echarts.init(_$heatmapContainer[0]);
  _heatMapChart.setOption(option);
  window._heatMapChart = _heatMapChart;
}

let _updateHeatMap = (heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale=1) => {

	if(!_heatMapChart) _initHeatMap();

  _yMin = scaleMinValue;
  _yMax = scaleMaxValue;
  let blocksNumber = 8;
  let yAxisData = [];

  let heatMapChart = _heatMapChart;
  let height = heatMapChart.getHeight();
  let eachBlockHeight = height / blocksNumber;

  let min = 0;
  for (let i = 0; i < blocksNumber; i++) {
    yAxisData.push(Math.round(min) + 0.5 + ':' + (Math.round(min += eachBlockHeight)-0.5));
  }
  let linesOption = _echart.getOption();
  let lastPrices = linesOption.series.slice(1, linesOption.series.length).map((serie, idx) => {
    return serie.data[serie.data.length - 1][1];
  });
  lastPrices.sort((a, b) => {return a - b}); // sort numerically
  let bunch = lastPrices;

  let eChartSeriesData = [];
  let countMax = 0;

  for (let idx = 0; idx < yAxisData.length; idx++) {
    let range = yAxisData[idx].split(':');
    let count = 0;
    for (let i = 0; i < bunch.length; i++) {
      let value = bunch[i];
      // let position = (value + Math.abs(scaleMinValue * manulScale)) / heatmapYAxis * height;
      let position = (value - scaleMinValue) / heatmapYAxis * ( height - 0 );

      if (position > (parseFloat(range[0]) - 0.5) && position <= (parseFloat(range[1]) + 0.5)) count += 1;
    }
    countMax = Math.max(countMax, count);
    eChartSeriesData.push([0, idx, count])
    bunch = bunch.slice(count);
  }
  //将eChartSeriesData 的 count 标准到[0 , 100]
  if(countMax > 0) {
    for(let i=0; i<eChartSeriesData.length; i++) {
      let count = eChartSeriesData[i][2];
      eChartSeriesData[i][2] = count / countMax * 100;
    }
  }

  let option = heatMapChart.getOption();
  option.yAxis[0].data = yAxisData;
  option.yAxis[0].axisLabel.textStyle.fontSize = 9;
  option.series[0].data = eChartSeriesData;

  heatMapChart.setOption(option, true);

};

let _updatePatternViews = (patternArr, {decimal}) => {
	decimal = decimal || 2;
	let patterns5 = patternArr.slice(0, 5) || [];
	_$patternViews.data('pattern',null);             //重置
	patterns5.forEach((pattern, i) => {
		let $patternView = $(_$patternViews[i]);
		$patternView.data({pattern});

		let similarityStr = (pattern.similarity * 100 + '').slice(0, 4),
				returnStr = (pattern.yield * 100).toFixed(decimal),
				symbol = pattern.symbol || '',
				describe = pattern.metaData && pattern.metaData.name || '';

		$patternView.find('.similarity .value').text(similarityStr);
		$patternView.find('.return .value').text(returnStr);
		$patternView.find('.symbol').text(symbol);
		$patternView.find('.describe').text(describe);

		_drawKlineCanvas($patternView);
	});
};

let _drawKlineCanvas = (patternViewNode) => {
	let $patternViewNode = $(patternViewNode);
	let pattern = $patternViewNode.data('pattern');
	let $canvas = $patternViewNode.find('canvas');
	let $canvasParent = $canvas.parent();
	let width = $canvasParent.width(),
			height = $canvasParent.height();
	$canvas.height(height).width(width).attr({width,height});

	let kline = pattern && pattern.kLine || [];
	let baseBars = pattern && pattern.baseBars || Infinity;
	painter.drawKline($canvas[0], kline.slice(0, baseBars));
};

let _updateAllPatternCanvas = () => {
	let len = _$patternViews.length;
	for(let i=0; i<len; i++) {
		let $patternView = $(_$patternViews[i]);
		_drawKlineCanvas($patternView);
	}
};

let _handleResize = () => {
	_echart && _echart.resize();
	_heatMapChart && _heatMapChart.resize();
	_updateAllPatternCanvas();
};

let _initResize = () => {
	window.addEventListener('resize', _handleResize);
};

let _initToggle = () => {

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
	$resultWrapper.find('.pattern-collection').append(generatePatternsDom());
	cacheDom($resultWrapper);
	_$root.append($resultWrapper);
	_initResize();
};

searchResultController.updatePrediction = (patterns) => {
	if(!_$root) return;
	_decimal = getDecimalForStatistic();
	_updateKlineChart(patterns);
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
	if(!_$root) return;
	firstFiveIds = firstFiveIds || [0,1,2,3,4];
	let firstFivePatterns = firstFiveIds.map(function(id) {
		return patternsArr[id];
	})
	_decimal = getDecimalForStatistic();
	_updatePatternViews(firstFivePatterns, {decimal:_decimal});
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
		let actions = require('../flux/actions');
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

