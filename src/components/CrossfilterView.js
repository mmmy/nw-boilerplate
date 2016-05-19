   //   ___ __ 
   //   _{___{__}\
   //  {_}      `\)            
   // {_}        `            _.-''''--.._
   // {_}                    //'.--.  \___`.
   //  { }__,_.--~~~-~~~-~~-::.---. `-.\  `.)
   //   `-.{_{_{_{_{_{_{_{_//  -- 8;=- `
   //      `-:,_.:,_:,_:,.`\\._ ..'=- , 
   //          // // // //`-.`\`   .-'/
   //   jgs   << << << <<    \ `--'  /----)
   //          ^  ^  ^  ^     `-.....--'''

import React, { PropTypes } from 'react';
import d3 from 'd3';
import DC from 'dc';
import classnames from 'classnames';
import _ from 'underscore';

import { filterActions } from '../flux/actions';

const propTypes = {
  stretchView: PropTypes.bool.isRequired,
	crossFilter: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {

};

const barChartBars = 20;
const transitionDuration = 400;   //过滤动画毫秒数
const debounceTime = 50;
//node 重要: 一个crossfilter不能 生成超过128个dimentsion, 所以注意缓存dimentsion !

class CrossfilterView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		//this.oldCrossFilter = props.crossFilter;
	}

	componentDidMount() {

		this.drawDc();

		this.bindResizeFunc = _.debounce(this.handleResize.bind(this), 200);

		window.addEventListener('resize', this.bindResizeFunc);
	}

	componentWillReceiveProps(){
		// console.log("CrossfilterView componentWillReceiveProps");
		// //this.drawDc();
	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.bindResizeFunc);
	}

	//响应resize事件
	handleResize(e){

		//console.log(e);
		if(!this.props.stretchView) { return }

		let {position_bubble_chart, industry_quarter_chart, yield_count_chart} = this.refs;

		let bubbleChartW = position_bubble_chart.clientWidth,
			bubbleChartH = position_bubble_chart.clientHeight,

			pieChartW = industry_quarter_chart.clientWidth,
			pieChartH = industry_quarter_chart.clientHeight,
			pieChartR = Math.min(pieChartW,pieChartH)/2 - 10,

			yieldChartW = yield_count_chart.clientWidth,
			yieldChartH = yield_count_chart.clientHeight;

		// if (bubbleChartW != this.bubbleChartW || bubbleChartH != this.bubbleChartH) { //区域发生了变化
		// 	this.positionBubbleChart && this.positionBubbleChart.width(bubbleChartW).height(bubbleChartH).render();
		// 	this.bubbleChartW = bubbleChartW;
		// 	this.bubbleChartH = bubbleChartH;
		// }
		let that = this;
		if (bubbleChartW != this.scatterChartW || bubbleChartH != this.scatterChartH) {
			//this.yieldDateScatterChart 
			let size = bubbleChartW / 40;
			let xTicks = 6, yTicks = 5;
			if(bubbleChartW > 400) xTicks = 12;
			if(bubbleChartH > 200) yTicks = 9;
			setTimeout(() => { 
				that.yieldDateScatterChart.width(bubbleChartW).height(bubbleChartH).symbolSize(size).excludedSize(size).redraw(); 
				that.yieldDateScatterChart.xAxis().ticks(xTicks);
				that.yieldDateScatterChart.yAxis().ticks(yTicks);
			});
			setTimeout(()=> {that.yieldDateScatterChart.renderYAxis(that.yieldDateScatterChart) })
			setTimeout(() => {that.yieldDateScatterChart.renderXAxis(that.yieldDateScatterChart) });
			this.scatterChartW = bubbleChartW;
			this.scatterChartH = bubbleChartH;
		}

		if (pieChartR != this.pieChartR) {
			setTimeout(() => { that.industryPieChart.width(pieChartW).height(pieChartH).radius(pieChartR).innerRadius(pieChartR/1.8).redraw(); });
			//setTimeout(()=> { that.industryPieChart.renderYAxis(that.industryPieChart) });
			//setTimeout(() => { that.industryPieChart.renderXAxis(that.industryPieChart) });
			this.pieChartR = pieChartR;
			this.pieChartW = pieChartW;
			this.pieChartH = pieChartH;
		}

		if (yieldChartW != this.yieldChartW || yieldChartH != this.yieldChartH) {
			setTimeout(() => {that.yieldDimCountChart.width(yieldChartW).height(yieldChartH).redraw(); });
			setTimeout(()=> {that.yieldDimCountChart.renderYAxis(that.yieldDimCountChart) });
			setTimeout(() => {that.yieldDimCountChart.renderXAxis(that.yieldDimCountChart) });
			this.yieldChartW = yieldChartW;
			this.yieldChartH = yieldChartH;
		}

	}

	componentDidUpdate() {
		this.drawDc();

		//解决第一transition 动画的之后布局	 bug
		let that = this;
		let { stretchView } = this.props;
		$('.container-searchreport').one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => { 
			if(stretchView) {
				that.handleResize.bind(that)();
			}
		});

		//setTimeout(this.handleResize.bind(this), 300);
		//console.log('^-^crossFilter view did update', new Date() - this.renderDate);
	}

	render() {
		this.renderDate = new Date();
		const className = classnames('crossfilter-container', {
		  'crossfilter-container-stretch': this.props.stretchView,
		  'crossfilter-container-shrink': !this.props.stretchView
		});
		//console.log('crossFilter view render');
		return (
		  <div ref='root' className={ className }>
		  	<div className="dc-chart-row">
		  		<strong>历史时间分布</strong>
		    	<div ref='position_bubble_chart' className="position-bubble-chart" ></div>
		    </div>
		    <div className="dc-chart-row">
		    	<div className='inline-chart-wrapper'><strong>饼状图</strong><div ref='industry_quarter_chart' className="industry-quarter-chart"><div className='industry-info-container'><h4 ref='industry_percent'></h4><p ref='industry_name'></p></div></div></div>
		    	<div className='inline-chart-wrapper'><strong>收益率统计</strong><div ref='yield_count_chart' className="yield-count-chart"></div></div>
		    </div>
		  </div>
		);
	}

	initDimensions() {

		let { crossFilter } = this.props;

		//crossFilter 如果改变或者不存在 那么重新生成dimentsions !!
		if(this.oldCrossFilter !== crossFilter) {

			//console.info('-_-CrossfilterView crossfilter changed !');
			
			this.oldCrossFilter = crossFilter;

			// this.idDim = crossFilter.dimension((data) => { return data.id; });
			let scalize = (arr) => { //arr = [num, num]    =>  1:1 or 1:4 or 2:3
				
				let left = arr[0],
						right = arr[1];

				if(left >= 0) return arr;
				let max = Math.max(-left, right);

				return [-max, max];

			};
			// this.idGroup = this.idDim.group().reduce(
			// 		(p, v)=>{
			// 			try{
			// 				let lastBar = v.kLine[v.kLine.length - 1];
			// 				p.year = new Date(lastBar[0]).getFullYear();
			// 				p.yield100 = Math.round(v.yield*100);
			// 				p.show = true;
			// 				return p;
			// 			} catch (e) {
			// 				console.error(e);
			// 				return p;
			// 			}
			// 		},
			// 		(p)=>{
			// 			p.show = false;
			// 			return p;
			// 		},
			// 		()=>{
			// 			return {
			// 				year: 1990,
			// 				yield100: 0,
			// 				show: true,
			// 			};
			// 		}
			// 	);
			let yearArr = [], yield100Arr=[], that=this ;

			this.yieldDateDim = crossFilter.dimension((data) => {

				let lastBar = data.kLine[data.kLine.length - 1];
				let year = lastBar ? new Date(lastBar[0]).getFullYear() : 0;
				let yield100 = Math.round(data.yield*100);
				//缓存所有数据的年份范围 和 收益率范围
				yearArr.push(year);
				yield100Arr.push(yield100);
				return [year, yield100]; 
			});
			//console.log(yearArr);
			this.yearRange = [Math.min.apply(null, yearArr) || 1990, Math.max.apply(null, yearArr) || new Date().getFullYear()];     //年份的最大最小值
			this.yield100Range = [Math.min.apply(null, yield100Arr), Math.max.apply(null, yield100Arr)]; //收益率的最大最小值
			//this.yield100Range[0] = Math.floor(this.yield100Range[0] / 20) * 20; // -23 => -4, 34 => 20
			//this.yield100Range[1] = Math.ceil(this.yield100Range[1] / 20) * 20; // 88 => 100, 129 => 140
			this.yield100Range[0] = Math.floor(this.yield100Range[0] / 100) * 100; // -23 => -50, 34 => 50
			this.yield100Range[1] = Math.ceil(this.yield100Range[1] / 100) * 100; // 88 => 100, 129 => 150
			this.yield100Range = scalize(this.yield100Range);
			let rangeInterval = ( this.yield100Range[1] -  this.yield100Range[0] ) / barChartBars;
			console.info(this.yield100Range);
			console.info(rangeInterval);
			console.assert(this.yearRange[1] > this.yearRange[0], this.yearRange);
			console.assert(this.yield100Range[1] > this.yield100Range[0]);
			this.yieldDateGroup = this.yieldDateDim.group();

			this.yieldDim = crossFilter.dimension((data) => { return Math.floor((data.yield*100 - that.yield100Range[0]) / rangeInterval); }); //转换到 0 - (barChartBars - 1)
			this.yieldGroup = this.yieldDim.group();

			this.industryDim = crossFilter.dimension((data) => { return data.industry; });
			this.industryGroup = this.industryDim.group();

			return true;

		} 
		//没有变化, 则不需要生成dimesions
		return false;

	}

	drawDc(){

		window.d3 = d3;
		window.dc = DC;

		// !! note: 如果crossFilter 没有变化那么不需要重新调用DC render 各个chart, it's expensive ! 
		if (this.initDimensions()) {

			//this.drawPositionBubbleChart();
			this.drawYieldDateScatterChart();
			this.drawIndustryPieChart();
			this.drawYieldDimCountChart();

			DC.renderAll();
		}

	}

	drawYieldDateScatterChart(){
		let {position_bubble_chart} = this.refs;
		let width = position_bubble_chart.clientWidth,
			height = position_bubble_chart.clientHeight;

		this.scatterChartW = width;
		this.scatterChartH = height;

		let yieldDateScatterChart = DC.scatterPlot(position_bubble_chart);
		this.yieldDateScatterChart = yieldDateScatterChart;

		yieldDateScatterChart
			.width(width)
			.height(height)
			.margins({top:5, right:20, bottom:20, left:40})
		    .x(d3.scale.linear().domain([this.yearRange[0]-1, this.yearRange[1]+1]))
		    .y(d3.scale.linear().domain(this.yield100Range))  //设置为50的整数倍,上下延长50
		    //.yAxisLabel("y")
		    // .xAxisLabel("x")
		    //.clipPadding(16)
				.transitionDuration(transitionDuration)
		    .colors('#757575')
		    //.colors('rgba(117, 117, 117, 1)')
		    .symbolSize(width/40)
		    .excludedSize(width/40)
		    .excludedColor('#aFaFaF')
		    .excludedOpacity(0.3)
		    .renderHorizontalGridLines(true)
		    .renderVerticalGridLines(true)
		    //.mouseZoomable(true)
		    //.xAxisPadding(10)
		    //.yAxisPadding(10)
		    //.elasticY(true)
		    //.elasticX(true)
		    .dimension(this.yieldDateDim)
		    //.brushOn(false)
		    //.excludedOpacity(0.5)
		    .group(this.yieldDateGroup);
		    //.yAxisMin(-400);
		    // .compose([
		    // 	DC.scatterPlot(yieldDateScatterChart)
      //           .group(this.yieldDateGroup, "Blue Group")
      //           .colors("blue"),
		    // ]);
		let xTicks = 6, yTicks = 5;
		if(width > 400) xTicks = 12;
		if(height > 200) yTicks = 9;
		 yieldDateScatterChart.xAxis().tickFormat((v) => { return ''+v; }).innerTickSize(5).ticks(xTicks);
		 yieldDateScatterChart.yAxis().tickFormat((v) => { return v+'%'; }).innerTickSize(5).ticks(yTicks);

		 window.yieldDateScatterChart= yieldDateScatterChart;
		 yieldDateScatterChart.on('filtered', _.debounce(this.onChartFiltered.bind(this), debounceTime));
	}

	drawPositionBubbleChart(){

		let {position_bubble_chart} = this.refs;
		let width = position_bubble_chart.clientWidth,
			height = position_bubble_chart.clientHeight;

		//缓存
		this.bubbleChartW = width;
		this.bubbleChartH = height;

		//
		let positionBubbleChart = DC.bubbleChart(position_bubble_chart)
			.width(width)
			.height(height)
			.dimension(this.idDim)
			.group(this.idGroup)
			.keyAccessor((p) => { return p.value.year; })
			.valueAccessor((p) => { return p.value.yield100; })
			.radiusValueAccessor((p) => { return (p.value.show ? 1 : 0); })
			.x(d3.scale.linear().domain([1990, 2016]))
			.y(d3.scale.linear().domain([-150, 150]))
			.r(d3.scale.linear().domain([0, 100]))
			//.elasticY(true)
			//.elasticX(true)
			.renderTitle(false)
			.brushOn(true)
			.title(()=>{return '历史时间分布';});
		
		positionBubbleChart.yAxis().tickFormat((v) => { return v+'%';});

		positionBubbleChart.on('filtered', _.debounce(this.onChartFiltered.bind(this), debounceTime));
		window.positionBubbleChart = positionBubbleChart;

		this.positionBubbleChart = positionBubbleChart;
	}


	//显示行业百分比信息
	setIndustryInfo(show = true, event) {
		//console.log(event);

		if(!show) {
			this.refs.industry_percent.innerHTML = '';
			this.refs.industry_name.innerHTML = '';
			return;
		}

		let { key, value } = event.data;

		//计算百分比
		let total = this.industryGroup.top(Infinity).reduce((pre, curObj) => {
			return pre + curObj.value;
		}, 0);
		let percent = (value * 100 / total).toFixed(1) + '%';

		this.refs.industry_percent.innerHTML = `<div class='animated fadeIn'>${percent}</div>`;
		this.refs.industry_name.innerHTML = `<div class='animated fadeIn'>${key}</div>`;

		let baseWidth = 50;
		let containerWidth = this.refs.industry_percent.clientWidth;

		let fontSize = (containerWidth / baseWidth) * 100;
		this.refs.industry_percent.style.fontSize = fontSize + '%';
		this.refs.industry_name.style.fontSize = fontSize * 0.7 + '%';
	}

	drawIndustryPieChart() {

		let that = this;
		let {industry_quarter_chart} = this.refs;
		let width = industry_quarter_chart.clientWidth,
			height = industry_quarter_chart.clientHeight,
			radius = Math.min(width, height)/2 - 10;

		//缓存
		this.pieChartW = width;
		this.pieChartH = height;
		this.pieChartR = radius;

		let industryPieChart = this.industryPieChart || DC.pieChart(industry_quarter_chart);

			industryPieChart
			.width(width)
			.height(height)
			.radius(radius)
			.transitionDuration(transitionDuration)
			.innerRadius(radius / 1.8)
			//.externalRadiusPadding(10)
			.renderLabel(false)
			.dimension(this.industryDim)
			.group(this.industryGroup)
			.drawPaths(false)
			//.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
			//.colors(['#0f0'])
			.linearColors(['#444','#ddd'])
			//.linearColors(['#ddd','#333'])
			.colorDomain([0, this.industryGroup.size() - 1])
			.minAngleForLabel(30)
			.colorAccessor(function(d, i){ return i })
			//.gap(3)
			//.label(() => { return 'aaa'; })
			//.title((e) => { console.log('title', e); return e.key + e.value; })
			.renderTitle(false);

		industryPieChart.on('filtered', this.onChartFiltered.bind(this));
		industryPieChart.on('renderlet', (chart) => {
			//console.log(chart, '~~~~~~~~~~~~~~~~~~~');
			// var pieSliceDoms = document.querySelectorAll('.pie-slice');
			// pieSliceDoms && pieSliceDoms.forEach((pieSlice) => {
			// 	//pieSlice.addEventListener('mouseenter', function(){console.log('111')});
			// 	//pieSlice.addEventListener('mouseleave', that.drawIndustryPieChart.bind(that, false));
			// });
			var pieSlices = chart.selectAll('g g');
			pieSlices.on('mouseenter', that.setIndustryInfo.bind(that, true));
			pieSlices.on('mouseleave', that.setIndustryInfo.bind(that, false));
		});
		//industryPieChart.on('hover', (e) => { console.log(e); })
		this.industryPieChart = industryPieChart;
		window.industryPieChart = industryPieChart;
		window.industryDim = this.industryDim;
	}

	drawYieldDimCountChart() {

		let {yield_count_chart} = this.refs;
		let width = yield_count_chart.clientWidth,
			height = yield_count_chart.clientHeight;

		this.yieldChartW = width;
		this.yieldChartH = height;

		//收益率统计
		let yieldDimCountChart = DC.barChart(yield_count_chart);
		yieldDimCountChart
			.width(width)
			.height(height)
			.transitionDuration(transitionDuration)
			.margins({top:10, right:20, bottom:30, left:20})
			.dimension(this.yieldDim)
			.group(this.yieldGroup)
			.renderHorizontalGridLines(true)
			.colors('#4F4F4F')
			//.excludedColor('#f00')
			//.elasticY(true)
			//.centerBar(true)
			.gap(1)
			.mouseZoomable(true)
			.zoomOutRestrict(false)
			.zoomScale([1,4])
			.controlsUseVisibility(true)
			.turnOnControls(true)
			.x(d3.scale.linear().domain([0, barChartBars+1]));
			//.x(d3.scale.ordinal())
			//.xUnits(DC.units.ordinal);
			//.x(d3.scale.linear().domain([this.yield100Range[0], barChartBars+1]));

		let rangeInterval = (this.yield100Range[1] - this.yield100Range[0]) / barChartBars ,
		    minYield100 = this.yield100Range[0];

		yieldDimCountChart.xAxis().tickFormat((v) => {return (v * rangeInterval + minYield100 ).toFixed(0) + '%'; }).ticks(6).innerTickSize(5);
		yieldDimCountChart.yAxis().tickFormat((v) => {return +v }).ticks(5).innerTickSize(5);
		//yield.yAxis().tickFromat((v) => {return v+'%'});
		yieldDimCountChart.on('filtered', this.onChartFiltered.bind(this));
		yieldDimCountChart.on('preRender', function(chart){ console.log(chart); });
		var filterhandler = function (dimension, filters) {
			console.info('actual filters:',filters);
			return ;
	    dimension.filter(null);
	    if (filters.length === 0) {
	        dimension.filter(null);
	    } else {
	        dimension.filterFunction(function (d) {
	            for (var i = 0; i < filters.length; i++) {
	                var filter = filters[i];
	                if (filter.isFiltered && filter.isFiltered(d)) {
	                    return true;
	                } else if (filter <= d && filter >= d) {
	                    return true;
	                }
	            }
	            return false;
	        });
	    }
	    return filters;
		};
		//filterhandler = yieldDimCountChart.filterHandler().bind(null);
		let handler = _.throttle(filterhandler, 2000, {leading: true, trailing: true});
		//yieldDimCountChart.filterHandler(this.handleFilterCb.bind(this));
		// yieldDimCountChart.filterHandler(filterhandler);

		window.yieldDimCountChart = yieldDimCountChart;
		this.yieldDimCountChart = yieldDimCountChart;
	}

	handleFilterCb(dimension, filters) {
		this._dimension = dimension;
		this._filters = filters;
		this._dimensionFilter = this._dimensionFilter || _.throttle(this.dimensionFilter.bind(this), 1000, {leading:true, trailing: false});
		this._dimensionFilter();
		return filters;
	}

	dimensionFilter() {

		console.info(this._dimension);
		console.info('filters hahaha-----',this._filters);
		let dimension = this._dimension,
				filters = this._filters;

		console.assert(dimension != null);

		dimension.filter(null);
    if (filters.length === 0) {
        dimension.filter(null);
    } else {
        dimension.filterFunction(function (d) {
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if (filter.isFiltered && filter.isFiltered(d)) {
                    return true;
                } else if (filter <= d && filter >= d) {
                    return true;
                }
            }
            return false;
        });
    }
    return filters;
	}

	onChartFiltered(chart, filter) {
		//console.info('onChartFiltered', chart, filter);
		//return;
		//console.log('chart filtered & filter:',filter);

		let { dispatch } = this.props;

		switch (typeof filter) {
			case 'string': 			//行业过滤
				dispatch(filterActions.setFilterIndustry(filter));
				break; 				
			case 'object': 			//收益率
				dispatch(filterActions.setFilterYieldRange(filter));
				break;
			case 'array':
				dispatch(filterActions.setFilterYieldDateRange([filter[0], filter[1]]));
				break;
			default:
				break;
		}
	}
}

CrossfilterView.propTypes = propTypes;
CrossfilterView.defaultProps = defaultProps;

export default CrossfilterView;
