import React, { PropTypes } from 'react';
import d3 from 'd3';
import DC from 'dc';
import classnames from 'classnames';

import { filterActions } from '../flux/actions';

const propTypes = {
  	stretchView: PropTypes.bool.isRequired,
	crossFilter: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {

};

//node 重要: 一个crossfilter不能 生成超过128个dimentsion, 所以注意缓存dimentsion !

class CrossfilterView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		//this.oldCrossFilter = props.crossFilter;
	}

	componentDidMount() {

		this.drawDc();

		this.bindResizeFunc = this.handleResize.bind(this);

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
		
		console.log(e);
		if(!this.props.stretchView) { return }

		let {position_bubble_chart, industry_quarter_chart, yield_count_chart} = this.refs;

		let bubbleChartW = position_bubble_chart.clientWidth,
			bubbleChartH = position_bubble_chart.clientHeight,

			pieChartW = industry_quarter_chart.clientWidth,
			pieChartH = industry_quarter_chart.clientHeight,
			pieChartR = Math.min(pieChartW,pieChartH)/2 - 10,

			yieldChartW = yield_count_chart.clientWidth,
			yieldChartH = yield_count_chart.clientHeight;

		if (bubbleChartW != this.bubbleChartW || bubbleChartH != this.bubbleChartH) { //区域发生了变化
			this.positionBubbleChart && this.positionBubbleChart.width(bubbleChartW).height(bubbleChartH).render();
			this.bubbleChartW = bubbleChartW;
			this.bubbleChartH = bubbleChartH;
		}

		if (pieChartR != this.pieChartR) {
			this.industryPieChart.width(pieChartW).height(pieChartH).radius(pieChartR).render();
			this.pieChartR = pieChartR;
			this.pieChartW = pieChartW;
			this.pieChartH = pieChartH;
		}

		if (yieldChartW != this.yieldChartW || yieldChartH != this.yieldChartH) {
			this.yieldDimCountChart.width(yieldChartW).height(yieldChartH).render();
			this.yieldChartW = yieldChartW;
			this.yieldChartH = yieldChartH;
		}

	}

	componentDidUpdate() {
		this.drawDc();
		console.log('crossFilter view did update', new Date() - this.renderDate);
	}

	render() {
		this.renderDate = new Date();
		const className = classnames('crossfilter-container', {
		  'crossfilter-container-stretch': this.props.stretchView,
		  'crossfilter-container-shrink': !this.props.stretchView
		});

		return (
		  <div className={ className }>
		  	<div className="dc-chart-row">
		    	<div ref='position_bubble_chart' className="position-bubble-chart" ></div>
		    </div>
		    <div className="dc-chart-row">
		    	<div ref='industry_quarter_chart' className="industry-quarter-chart"></div>
		    	<div ref='yield_count_chart' className="yield-count-chart"></div>
		    </div>
		  </div>
		);
	}

	initDimensions() {

		let { crossFilter } = this.props;

		//crossFilter 如果改变或者不存在 那么重新生成dimentsions !!
		if(this.oldCrossFilter !== crossFilter) {

			console.info('crossfilter changed !');
			
			this.oldCrossFilter = crossFilter;

			this.idDim = crossFilter.dimension((data) => { return data.id; });

			this.idGroup = this.idDim.group().reduce(
					(p, v)=>{
						try{
							let lastBar = v.kLine[v.kLine.length - 1];
							p.year = new Date(lastBar[0]).getFullYear();
							p.yield100 = Math.round(v.yield*100);
							p.show = true;
							return p;
						} catch (e) {
							console.error(e);
							return p;
						}
					},
					(p)=>{
						p.show = false;
						return p;
					},
					()=>{
						return {
							year: 1990,
							yield100: 0,
							show: true,
						};
					}
				);

			this.yieldDim = crossFilter.dimension((data) => { return Math.round(data.yield*10/1.5); });

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

			this.drawPositionBubbleChart();
			this.drawYieldDimCountChart();
			this.drawIndustryPieChart();

			DC.renderAll();
		}

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
			.elasticY(true)
			.elasticX(true)
			.renderTitle(true)
			.title(()=>{return '历史时间分布';});
		
		positionBubbleChart.yAxis().tickFormat((v) => { return v+'%';});
		window.positionBubbleChart = positionBubbleChart;
		//positionBubbleChart.on('filtered', this.onChartFiltered.bind(this));
		this.positionBubbleChart = positionBubbleChart;
	}

	drawIndustryPieChart() {

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
			.innerRadius(0)
			.dimension(this.industryDim)
			.group(this.industryGroup);

		industryPieChart.on('filtered', this.onChartFiltered.bind(this));
		this.industryPieChart = industryPieChart;
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
			.dimension(this.yieldDim)
			.group(this.yieldGroup)
			.elasticY(true)
			//.centerBar(true)
			.gap(1)
			.x(d3.scale.linear().domain([-10, 10]));
		yieldDimCountChart.xAxis().tickFormat((v) => {return v*15+'%'}).ticks(5);
		//yield.yAxis().tickFromat((v) => {return v+'%'});
		yieldDimCountChart.on('filtered', this.onChartFiltered.bind(this));
		window.yieldDimCountChart = yieldDimCountChart;
		this.yieldDimCountChart = yieldDimCountChart;
	}

	onChartFiltered(chart, filter) {

		console.log('chart filtered & filter:',filter);

		let { dispatch } = this.props;

		switch (typeof filter) {
			case 'string':
				dispatch(filterActions.setFilterIndustry(filter));
				break;
			case 'object':
				dispatch(filterActions.setFilterYieldRange(filter));
				break;
			default:
				break;
		}
	}
}

CrossfilterView.propTypes = propTypes;
CrossfilterView.defaultProps = defaultProps;

export default CrossfilterView;
