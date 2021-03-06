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
import lodash from 'lodash';
import { setScatters, setPieCollection, setCountBars, getPieSlice } from '../cache/crossfilterDom';

import { filterActions } from '../flux/actions';
import store from '../store';
import moment from 'moment';

const propTypes = {
  stretchView: PropTypes.bool.isRequired,
	crossFilter: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {

};

//let ToString = Object.propotype.toString;

const barChartBars = 20;
const transitionDuration = 400;   //过滤动画毫秒数
const debounceTime = 100;
//node 重要: 一个crossfilter不能 生成超过128个dimentsion, 所以注意缓存dimentsion !

let _lastFilterDate = new Date();
let _dimensionFilter = (dimension, filters) => {

	// console.info(dimension);
	// console.info('filters hahaha-----',filters);
	// let dimension = this._dimension,
	// 		filters = this._filters;

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
  setTimeout(DC.redrawAll);
  return filters;

};

// let debounceFilter = (dimension, filters) => {
// 	// let curDate = new Date();
// 	// if (curDate - _lastFilterDate > debounceTime) {
// 	// 	_dimensionFilter(dimension, filters);
// 	// 	_lastFilterDate = curDate;
// 	// }
	
// 	return filters;
// };
let debounceFilter = lodash.debounce(_dimensionFilter, debounceTime);

class CrossfilterView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {chart3larger: false};
		this._isLight = $ && $.keyStone && ($.keyStone == 'light');
		//this.oldCrossFilter = props.crossFilter;
	}

	componentDidMount() {

		this.drawDc();
		let that = this;
		this.bindResizeFunc = lodash.debounce((e)=>{
			that.handleResize.call(that, e, true);
			setTimeout(()=>{
				that.industryPieChart.redraw();
			},100);
			// this.handleResize.bind(this);
		}, 500, {trailing: true});

		window.addEventListener('resize', this.bindResizeFunc);
	}

	componentWillReceiveProps(){
		// console.log("CrossfilterView componentWillReceiveProps");
		// //this.drawDc();
	}

	shouldComponentUpdate(newProps, newState){
		return true;
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.bindResizeFunc);
	}

	//响应resize事件
	handleResize(e, disableTrasitionOnce=false){

		//console.log(e);
		if(!this.props.stretchView) { return }

		let {position_bubble_chart, industry_quarter_chart, yield_count_chart} = this.refs;
		//resize pie chart
		// let pieParent = industry_quarter_chart.parentNode;
		// let pieH = 0;
		// if(industry_quarter_chart.clientHeight + 50 > pieParent.clientHeight) {
		// 	pieH = pieParent.clientHeight - 50;
		// 	industry_quarter_chart.style.width = pieH + 'px';
		// 	industry_quarter_chart.style.height = pieH + 'px';
		// } else {
		// 	industry_quarter_chart.style.width = '';
		// 	industry_quarter_chart.style.height = '';
		// }

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
		if (disableTrasitionOnce) {
			this.yieldDateScatterChart.transitionDuration(0);
			this.industryPieChart.transitionDuration(0);
			this.yieldDimCountChart.transitionDuration(0);
		}

		let that = this;
		if (bubbleChartW != this.scatterChartW || bubbleChartH != this.scatterChartH) {
			//this.yieldDateScatterChart 
			// let size = bubbleChartW / 50;
			let xTicks = 3, yTicks = 5;
			if(bubbleChartW > 400) xTicks = 6;
			if(bubbleChartH > 200) yTicks = 9;
			// setTimeout(() => { 
				that.yieldDateScatterChart.width(bubbleChartW).height(bubbleChartH)/*.symbolSize(size).excludedSize(size)*/.redraw(); 
				that.yieldDateScatterChart.xAxis().ticks(xTicks);
				that.yieldDateScatterChart.yAxis().ticks(yTicks);
				that.yieldDateScatterChart.renderYAxis(that.yieldDateScatterChart);
				that.yieldDateScatterChart.renderXAxis(that.yieldDateScatterChart);
				disableTrasitionOnce && that.yieldDateScatterChart.transitionDuration(transitionDuration);
			// });
			// setTimeout(()=> {that.yieldDateScatterChart.renderYAxis(that.yieldDateScatterChart) })
			// setTimeout(() => {that.yieldDateScatterChart.renderXAxis(that.yieldDateScatterChart) });
			this.scatterChartW = bubbleChartW;
			this.scatterChartH = bubbleChartH;
		}

		if (pieChartR != this.pieChartR) {
			// setTimeout(() => {
				// console.debug('pie chart resize !!!!'); 
				that.industryPieChart.width(pieChartW).height(pieChartH).radius(pieChartR).innerRadius(pieChartR/1.8).redraw(); 
				disableTrasitionOnce && that.industryPieChart.transitionDuration(transitionDuration);
			// });
			//setTimeout(()=> { that.industryPieChart.renderYAxis(that.industryPieChart) });
			//setTimeout(() => { that.industryPieChart.renderXAxis(that.industryPieChart) });
			this.pieChartR = pieChartR;
			this.pieChartW = pieChartW;
			this.pieChartH = pieChartH;
		}

		if (yieldChartW != this.yieldChartW || yieldChartH != this.yieldChartH) {
			// setTimeout(() => {
				that.yieldDimCountChart.width(yieldChartW).height(yieldChartH).redraw(); 
				disableTrasitionOnce && that.yieldDimCountChart.transitionDuration(transitionDuration);
			// });
			//setTimeout(()=> {
				that.yieldDimCountChart.renderYAxis(that.yieldDimCountChart) 
			//});
			// setTimeout(() => {
				that.yieldDimCountChart.renderXAxis(that.yieldDimCountChart) 
			// });
			this.yieldChartW = yieldChartW;
			this.yieldChartH = yieldChartH;
		}

	}

	componentDidUpdate() {
		this.drawDc();

		//解决第一transition 动画的之后布局	 bug
		let that = this;
		let { stretchView } = this.props;
		$('.statistics-container').one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => { 
			if(stretchView) {
				that.handleResize.bind(that)(null, true);
			}
		});

		//setTimeout(this.handleResize.bind(this), 300);
		// console.info('^-^crossFilter view did update', new Date() - this.renderDate);
	}

resizeChart1() {
		
		let wrapper = $(this.refs.position_bubble_chart_wrapper);

		let	targetH = 0;

		if(wrapper.hasClass('full')) {
			// targetW = curW * 2;
			targetH = this.refs.root.clientHeight - 33.609 - 67.234 - 30;
		} else {
			// targetW = curW / 2;
			targetH = this.refs.dc_chart_row_2.clientHeight - 18.484 - 30;
		}
		// console.debug(targetH);
		let that = this;
		this.yieldDateScatterChart.transitionDuration(transitionDuration);
		setTimeout(() => {that.yieldDateScatterChart.height(targetH).redraw(); });
		setTimeout(()=> {that.yieldDateScatterChart.renderYAxis(that.yieldDateScatterChart) });
		setTimeout(() => {that.yieldDateScatterChart.renderXAxis(that.yieldDateScatterChart) });
	}

	resizeChart2() {
		
		// let a = 2.03, b = - 143.59;
		// let curW = this.refs.industry_quarter_chart.clientWidth,
		// 		curH = this.refs.industry_quarter_chart.clientHeight;
		// let wrapper = $(this.refs.industry_quarter_chart_wrapper);

		// let targetW = 0,
		// 		targetH = 0;

		// if(wrapper.hasClass('full')) {
		// 	targetW = curW * 2;
		// 	targetH = curH * a + b;
		// } else {
		// 	targetW = curW / 2;
		// 	targetH = this.refs.yield_count_chart.clientHeight;
		// }
		// let that = this;
		// this.industryPieChart.transitionDuration(transitionDuration);
		// let pieChartR = Math.min(targetW,targetH)/2 - 10;
		// setTimeout(() => {that.industryPieChart.width(targetW).height(targetH).radius(pieChartR).innerRadius(pieChartR/1.8).redraw(); });
		// setTimeout(()=> {that.industryPieChart.renderYAxis(that.industryPieChart) });
		// setTimeout(() => {that.industryPieChart.renderXAxis(that.industryPieChart) });
	}

	resizeChart3() {
		
		let a = 2.03, b = - 143.59;
		let curW = this.refs.yield_count_chart.clientWidth,
				curH = this.refs.yield_count_chart.clientHeight;
		let wrapper = $(this.refs.yield_count_chart_wrapper);

		let targetW = 0,
				targetH = 0;

		if(wrapper.hasClass('full')) {
			targetW = curW * 2;
			targetH = curH * a + b;
		} else {
			targetW = curW / 2;
			targetH = this.refs.industry_quarter_chart.clientHeight;
		}
		let that = this;
		this.yieldDimCountChart.transitionDuration(transitionDuration);
		setTimeout(() => {that.yieldDimCountChart.width(targetW).height(targetH).redraw(); });
		setTimeout(()=> {that.yieldDimCountChart.renderYAxis(that.yieldDimCountChart) });
		setTimeout(() => {that.yieldDimCountChart.renderXAxis(that.yieldDimCountChart) });
	}

	toggleChart1() {
		//let chart3larger = this.state;
		//this.setState({chart3larger: !chart3larger});
		// let interVal = setInterval(this.handleResize.bind(this),50);
		let wrapper = $(this.refs.position_bubble_chart_wrapper);
		//this.yieldDimCountChart.transitionDuration(1);
		//let padding = wrapper.has('.full') ? '0' : ''
		$('.chart-body').removeAttr('clip-path');
		wrapper.toggleClass('full');
		let that = this;
		wrapper.one("webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => {
			//clearInterval(interVal);
			// that.handleResize();
		});
		//wrapper.css('padding', '');
		$(this.refs.toggle_btn1).toggleClass('larger');
		this.resizeChart1();
		// setTimeout(this.handleResize.bind(this), 500);
	}	

	toggleChart2() {
		//let chart3larger = this.state;
		//this.setState({chart3larger: !chart3larger});
		// let interVal = setInterval(this.handleResize.bind(this),50);
		let wrapper = $(this.refs.industry_quarter_chart_wrapper);
		//this.yieldDimCountChart.transitionDuration(1);
		//let padding = wrapper.has('.full') ? '0' : ''
		$('.chart-body').removeAttr('clip-path');
		wrapper.toggleClass('full');
		let that = this;
		wrapper.one("webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => {
			//clearInterval(interVal);
			// that.handleResize();
		});
		//wrapper.css('padding', '');
		$(this.refs.toggle_btn2).toggleClass('larger');
		$(this.refs.industry_quarter_chart).toggleClass('larger');
		//this.resizeChart2();
		// setTimeout(this.handleResize.bind(this), 500);
	}

	toggleChart3() {
		//let chart3larger = this.state;
		//this.setState({chart3larger: !chart3larger});
		// let interVal = setInterval(this.handleResize.bind(this),50);
		let wrapper = $(this.refs.yield_count_chart_wrapper);
		//this.yieldDimCountChart.transitionDuration(1);
		//let padding = wrapper.has('.full') ? '0' : ''
		$('.chart-body').removeAttr('clip-path');
		wrapper.toggleClass('full');
		let that = this;
		wrapper.one("webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => {
			//clearInterval(interVal);
			// that.handleResize();
		});
		//wrapper.css('padding', '');
		$(this.refs.toggle_btn3).toggleClass('larger');
		this.resizeChart3();
		// setTimeout(this.handleResize.bind(this), 500);
	}

	selectGainedYield(gained = true) {
		let chart = this.yieldDimCountChart;
		let dim = this.yieldDimCountChart.dimension();
		let range = gained ? [barChartBars/2 , barChartBars + 1] : [0, barChartBars/2];
		chart.filter(range);
		dim.filter(range);
		DC.redrawAll();
	}

	resetIndustyChart() {
		let chart = this.industryPieChart;
		let dim = chart.dimension();
		chart.filterAll();
		dim.filterAll();
		DC.redrawAll();
	}

	//show reset btn ? 
	setResetBtnVisibility(chart) {
		if(chart.filters().length === 0) {
			$(this.refs.reset_btn_container).hide();
		} else {
			$(this.refs.reset_btn_container).show();
		}
	}

	render() {
		// this.renderDate = new Date();
		const className = classnames('crossfilter-container', {
		  'crossfilter-container-stretch': this.props.stretchView,
		  'crossfilter-container-shrink': !this.props.stretchView
		});
		//console.log('crossFilter view render');
		let { chart3larger } = this.state;
		let toggleBtnClass = classnames('toggle-btn');
		//let toggleBtn1 = <button ref='toggle_btn1' className={toggleBtnClass} onClick={this.toggleChart1.bind(this)}></button>;
		// let toggleBtn2 = <button ref='toggle_btn2' className={toggleBtnClass} onClick={this.toggleChart2.bind(this)}></button>;
		// let toggleBtn3 = <button ref='toggle_btn3' className={toggleBtnClass} onClick={this.toggleChart3.bind(this)}></button>;
		
		let yiledBtns = '';// <span className='yield-btns-container font-simsun'><button onClick={this.selectGainedYield.bind(this, true)}>盈</button><button onClick={this.selectGainedYield.bind(this, false)}>亏</button></span>;
		
		let whiteCircle = <div className='madan-white-circle'></div>;
		let resetBtn = <div className='reset-btn-container flex-center font-simsun' ref='reset_btn_container'><button onClick={this.resetIndustyChart.bind(this)}>重置</button></div>;
		return (
		  <div ref='root' className={ className }>
		  	<div className="dc-chart-row transition-all transition-ease-in-out transition-duration3" ref='position_bubble_chart_wrapper'>
		  		<strong>{/*toggleBtn1*/}历史时间分布</strong>
		    	<div ref='position_bubble_chart' className="position-bubble-chart" ></div>
		    </div>
		    <div className="dc-chart-row transition-all transition-ease-in-out transition-duration3" ref='industry_quarter_chart_wrapper'>
	    		<strong>{/*toggleBtn2*/}标的类型</strong>
	    		<div ref='industry_quarter_chart' className="industry-quarter-chart transition-all transition-ease-in-out transition-duration3">
	    			{whiteCircle}
	    			{resetBtn}
	    			<div className='industry-info-container'>
	    				<h4 ref='industry_percent'></h4><p ref='industry_name'></p>
	    			</div>
	    		</div>
		    </div>
		    <div className="dc-chart-row transition-all transition-ease-in-out transition-duration3" ref='yield_count_chart_wrapper'>
		    		<strong>{/*toggleBtn3*/}涨跌幅度统计{yiledBtns}</strong>
		    		<div ref='yield_count_chart' className="yield-count-chart"></div>
		    </div>
		    {/*<div className="dc-chart-row" ref='dc_chart_row_2'>
		    	<div className='inline-chart-wrapper transition-all transition-ease-in-out transition-duration3' ref='industry_quarter_chart_wrapper'>
		    		<strong>{/*toggleBtn2*//*}标的类型</strong>
		    		<div ref='industry_quarter_chart' className="industry-quarter-chart transition-all transition-ease-in-out transition-duration3">
		    			{whiteCircle}
		    			{resetBtn}
		    			<div className='industry-info-container'>
		    				<h4 ref='industry_percent'></h4><p ref='industry_name'></p>
		    			</div>
		    		</div>
		    	</div>
		    	<div className='inline-chart-wrapper transition-all transition-ease-in-out transition-duration3' ref='yield_count_chart_wrapper'>
		    		<strong>{/*toggleBtn3*//*}收益率统计{yiledBtns}</strong>
		    		<div ref='yield_count_chart' className="yield-count-chart"></div>
		    	</div>
		    </div>*/}
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
			let timeArr = [], yield100Arr=[], that=this ;

			this.yieldDateDim = crossFilter.dimension((data) => {

				// let lastBar = data.kLine[data.kLine.length - 1];
				// let year = lastBar ? new Date(lastBar[0]).getFullYear() : 0;
				let unixTime = new Date(data.end) / 1000;
				let yield100 = (data.yield*100);
				let id = data.id;
				//缓存所有数据的年份范围 和 收益率范围
				timeArr.push(unixTime);
				yield100Arr.push(yield100);
				let item = [unixTime, yield100];
				item['id'] = id;
				return item;
			});
			//console.log(timeArr);
			this.timeRange = [Math.min.apply(null, timeArr) || new Date('1990/1/1')/1000, Math.max.apply(null, timeArr) || new Date()/1000];     //年份的最大最小值
   		//fix 只有一个搜索结果的时候x轴显示不合理的bug
   		if(this.timeRange[0] == this.timeRange[1]) {
   			let oneYear = 365 * 24 * 3600;
   			this.timeRange[0] -= oneYear;
   			this.timeRange[1] += oneYear;
   		}

			this.yield100Range = [Math.min.apply(null, yield100Arr), Math.max.apply(null, yield100Arr)]; //收益率的最大最小值
			//this.yield100Range[0] = Math.floor(this.yield100Range[0] / 20) * 20; // -23 => -4, 34 => 20
			//this.yield100Range[1] = Math.ceil(this.yield100Range[1] / 20) * 20; // 88 => 100, 129 => 140
			// let inter = 1;
			// this.yield100Range[0] = Math.floor(this.yield100Range[0] / inter) * inter; // -2 => -5, 3 => 5
			// this.yield100Range[1] = Math.ceil(this.yield100Range[1] / inter) * inter; // 88 => 100, 129 => 130
			this.yield100Range[0] = widerNumber(this.yield100Range[0]);
			this.yield100Range[1] = widerNumber(this.yield100Range[1]);
			this.yield100Range = scalize(this.yield100Range);
			//fix 搜索结果只有一个的时候的bug
			if(this.yield100Range[0] == this.yield100Range[1]) {
				this.yield100Range[0] < 0 ? (this.yield100Range[1] = -this.yield100Range[0]) : (this.yield100Range[0] = -this.yield100Range[0]);
			}

			let rangeInterval = ( this.yield100Range[1] -  this.yield100Range[0] ) / barChartBars;
			// console.info(this.yield100Range);
			// console.info(rangeInterval);
			// console.assert(this.timeRange[1] > this.timeRange[0], this.timeRange);
			// console.assert(this.yield100Range[1] > this.yield100Range[0]);
			this.yieldDateGroup = this.yieldDateDim.group((d) => { 
				return d;
			});
			window.yieldDateDim = this.yieldDateDim;
			window.yieldDateGroup = this.yieldDateGroup;

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

			this.industryPieChart.filterAll(); //好大一个坑
			// this.industryPieChart.redraw();
			var that = this;
			setTimeout(() => { 
				DC.renderAll();
				//行业分类hover 效果
				// var pieSlices = that.industryPieChart.selectAll('g g');
				// pieSlices.on('mouseenter', that.setIndustryInfo.bind(that, true), true);
				// pieSlices.on('mouseleave', that.setIndustryInfo.bind(that, false));

				let pattern0 = store.getState().patterns.rawData[0];
				//缓存dom
				let selectedScatter = that.yieldDateScatterChart.select('g.chart-body').append('path').attr('class', 'selected')[0];
				let scatters = that.yieldDateScatterChart.selectAll('g.chart-body>path.symbol')[0];
				setScatters(scatters, selectedScatter, 0);

				let pieNodes = that.industryPieChart.selectAll('g.pie-slice')[0];
				setPieCollection(pieNodes, pattern0 && pattern0.industry);

				let xMin = that.yield100Range[0] / 100;

				let bars = that.yieldDimCountChart.selectAll('rect.bar')[0];
				let outLines = that.yieldDimCountChart.selectAll('rect.outline')[0];
				setCountBars(bars, outLines, xMin, barChartBars, pattern0 && pattern0.yield);

			});
		}

	}

	drawYieldDateScatterChart(){
		let {position_bubble_chart} = this.refs;
		let width = position_bubble_chart.clientWidth,
			height = position_bubble_chart.clientHeight;

		this.scatterChartW = width;
		this.scatterChartH = height;

		let yieldDateScatterChart = /*this.yieldDateScatterChart ||*/ DC.scatterPlot(position_bubble_chart);
		let timeOffset = parseInt(this.timeRange[1] - this.timeRange[0]) * 0.05;

		yieldDateScatterChart
			.width(width)
			.height(height)
			.margins({top:5, right:5, bottom:25, left:40})
		    .x(d3.scale.linear().domain([this.timeRange[0]-timeOffset, this.timeRange[1]+timeOffset]))
		    .y(d3.scale.linear().domain(this.yield100Range))  //设置为50的整数倍,上下延长50
		    //.yAxisLabel("y")
		    // .xAxisLabel("x")
		    //.clipPadding(16)
				.transitionDuration(transitionDuration)
		    .colors(this._isLight ? '#555' : '#aaa')
		    //.colors('rgba(117, 117, 117, 1)')
		    .symbolSize(8) //width / 50
		    .excludedSize(8)
		    .excludedColor(this._isLight ? '#aFaFaF' : '#555')
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
		let xTicks = 3, yTicks = 5;
		if(width > 400) xTicks = 6;
		if(height > 200) yTicks = 9;
		yieldDateScatterChart.xAxis().tickFormat((v) => { 
			var momentTime = moment.unix(parseInt(v)); 
			return momentTime.format('YY.MM.DD'); 
		}).innerTickSize(5).ticks(xTicks);

		yieldDateScatterChart.yAxis().tickFormat((v) => {
			var yieldRate = (v + '').slice(0, v>0 ? 4 : 5);
		 	return yieldRate+'%'; 
		}).innerTickSize(5).ticks(yTicks);

		window.yieldDateScatterChart= yieldDateScatterChart;

		yieldDateScatterChart.on('filtered', this.onChartFiltered.bind(this));
		yieldDateScatterChart.on('renderlet', (chart) => {
			// var selectedScatter = chart.selectAll('path.selected');
			let state = store.getState();
			setScatters(null, null, state.active.id);
		});
		 //yieldDateScatterChart.filterHandler(()=>{});
		this.yieldDateScatterChart = yieldDateScatterChart;
	}
	//弃用, 使用上面的函数
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

		positionBubbleChart.on('filtered', this.onChartFiltered.bind(this));
		window.positionBubbleChart = positionBubbleChart;

		this.positionBubbleChart = positionBubbleChart;
	}

	triggerActiveHover() {
		let active = store.getState().active;
		let industry = active.industry;
		let matchPie = getPieSlice(industry);
		let piePath = matchPie && matchPie.firstChild;// && matchPie.lastChild;
		console.assert(piePath, 'piePath do not exist!', industry);
		if(piePath) {
			// console.log('fuck hover',matchPie);
			let color = $.keyStone.configDefault.brownRed || '#b61c15';
			piePath.style.fill = '';
			matchPie.dispatchEvent(new window.MouseEvent('mouseenter'));
		}
	}
	//显示行业百分比信息
	setIndustryInfo(showHover = true, event) {

		if(!showHover) {
			this.refs.industry_percent.innerHTML = '';
			this.refs.industry_name.innerHTML = '';
			$(this.refs.industry_percent.parentNode).hide();
			this.triggerActiveHover();
			return;
		}

		$(this.refs.industry_percent.parentNode).show();
		let { key, value } = event.data;

		//计算百分比
		let total = this.industryGroup.top(Infinity).reduce((pre, curObj) => {
			return pre + curObj.value;
		}, 0);
		let percent = (value * 100 / total).toFixed(1) + '%';

		this.refs.industry_percent.innerHTML = `<div class='animated fadeIn'>${percent}</div>`;
		this.refs.industry_name.innerHTML = `<abbr class='animated fadeIn ks-abbr' title='${key}'>${key}</abbr>`;

		let baseWidth = 50;
		let containerWidth = this.refs.industry_percent.clientWidth;

		let fontSize = (containerWidth / baseWidth) * 100;
		// this.refs.industry_percent.style.fontSize = fontSize + '%';
		// this.refs.industry_name.style.fontSize = fontSize * 0.7 + '%';
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
			.linearColors(['#313131','#dadada'])
			//.linearColors(['#ddd','#333'])
			.colorDomain([0, this.industryGroup.size() - 1])
			.minAngleForLabel(30)
			.colorAccessor(function(d, i){ return i })
			// .slicesCap(8)
			// .othersLabel('其他行业')
			//.gap(3)
			//.label(() => { return 'aaa'; })
			//.title((e) => { console.log('title', e); return e.key + e.value; })
			.renderTitle(false);

		industryPieChart.drawOutline && industryPieChart.drawOutline(true);
		industryPieChart.on('filtered', this.onChartFiltered.bind(this));
		industryPieChart.on('renderlet', (chart) => {
			// console.debug('chart', chart, '~~~~~~~~~~~~~~~~~~~');
			// var pieSliceDoms = document.querySelectorAll('.pie-slice');
			// pieSliceDoms && pieSliceDoms.forEach((pieSlice) => {
			// 	//pieSlice.addEventListener('mouseenter', function(){console.log('111')});
			// 	//pieSlice.addEventListener('mouseleave', that.drawIndustryPieChart.bind(that, false));
			// });
			var pieSlices = chart.selectAll('g g');
			pieSlices.on('mouseenter', that.setIndustryInfo.bind(that, true));
			pieSlices.on('mouseleave', that.setIndustryInfo.bind(that, false));
			let state = store.getState();
			let pattern = state.patterns.rawData[state.active.id];
			setPieCollection(pieSlices[0], pattern && pattern.industry);
			
			that.triggerActiveHover();

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
		let yieldDimCountChart = /*this.yieldDimCountChart ||*/ DC.barChart(yield_count_chart);
		// yieldDimCountChart.filterAll();

		yieldDimCountChart
			.width(width)
			.height(height)
			.transitionDuration(transitionDuration)
			.margins({top:10, right:20, bottom:30, left:30})
			.dimension(this.yieldDim)
			.group(this.yieldGroup)
			.renderHorizontalGridLines(true)
			.colors(this._isLight ? '#4F4F4F' : '#aaa')
			// .excludedColor(this._isLight ? '' : '#555')
			.elasticY(true)
			//.centerBar(true)
			.gap(1)
			.drawOutline(true)
			// .mouseZoomable(true)
			// .zoomOutRestrict(false)
			// .zoomScale([1,4])
			// .controlsUseVisibility(true)
			// .turnOnControls(true)
			.x(d3.scale.linear().domain([0, barChartBars+1]));
			//.x(d3.scale.ordinal())
			//.xUnits(DC.units.ordinal);
			//.x(d3.scale.linear().domain([this.yield100Range[0], barChartBars+1]));

		let rangeInterval = (this.yield100Range[1] - this.yield100Range[0]) / barChartBars ,
		    minYield100 = this.yield100Range[0];

		yieldDimCountChart.xAxis().tickFormat((v) => {
			var yieldRate = v * rangeInterval + minYield100;
			return (yieldRate + '').slice(0, yieldRate>=0 ? 4 : 5) + '%'; 
		}).ticks(6).innerTickSize(5);
		// yieldDimCountChart.yAxis().tickFormat((v) => {return +v }).ticks(5).innerTickSize(5);
		yieldDimCountChart.yAxis().tickFormat(d3.format('d')).ticks(5).innerTickSize(5);
		//yieldDimCountChart.on('filtered', _.debounce(this.onChartFiltered.bind(this)));
		yieldDimCountChart.on('filtered', this.onChartFiltered.bind(this));
		//yieldDimCountChart.filterHandler(debounceFilter);

		window.yieldDimCountChart = yieldDimCountChart;
		this.yieldDimCountChart = yieldDimCountChart;
	}

	onChartFiltered(chart, filter) {

		//_dimensionFilter(chart.dimension(), chart.filters());
		// return;
		let { dispatch } = this.props;
		// console.info('yieldDimCountChart onChartFiltered !!!',filter);
		switch (chart) {
			case this.industryPieChart: 			//行业过滤
				this.setResetBtnVisibility(chart);
				// console.info('@@@@@@@chart filter industry!!!!');
				dispatch(filterActions.setFilterIndustry(filter));
				break; 				
			case this.yieldDimCountChart: 			//收益率
				dispatch(filterActions.setFilterYieldRange(filter));
				break;
			case this.yieldDateScatterChart:
				dispatch(filterActions.setFilterYieldDateRange(filter));
				break;
			default:
				break;
		}
	}
}

CrossfilterView.propTypes = propTypes;
CrossfilterView.defaultProps = defaultProps;

export default CrossfilterView;
