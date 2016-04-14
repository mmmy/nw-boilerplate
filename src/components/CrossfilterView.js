import Crossfilter from 'crossfilter';
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
	}

	componentWillReceiveProps(){
		// console.log("CrossfilterView componentWillReceiveProps");
		// //this.drawDc();
	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	componentDidUpdate() {
		this.drawDc();
	}

	render() {
		const className = classnames('crossfilter-container', {
		  'crossfilter-container-stretch': this.props.stretchView,
		  'crossfilter-container-shrink': !this.props.stretchView
		});

		return (
		  <div className={ className }>
		    <div ref='position_bubble_chart'></div>
		    <div ref='industry_quarter_chart'></div>
		    <div ref='yield_count_chart'></div>
		  </div>
		);
	}

	initDimensions() {

		let { crossFilter } = this.props;

		//crossFilter 如果改变或者不存在 那么重新生成dimentsions !!
		if(this.oldCrossFilter != crossFilter) {

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
						}
					},
					(p, v)=>{
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

		} else { //没有变化, 则不需要生成dimesions

		}

	}

	drawDc(){

		window.d3 = d3;
		window.dc = DC;

		this.initDimensions();

		this.drawPositionBubbleChart();
		this.drawYieldDimCountChart();
		this.drawIndustryPieChart();

		DC.renderAll();

	}

	drawPositionBubbleChart(){

		let {position_bubble_chart} = this.refs;

		let positionBubbleChart = DC.bubbleChart(position_bubble_chart)
			.width(500)
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
			.title((p)=>{return '历史时间分布';})
			.yAxis().tickFormat((v) => { return v+'%';});
		window.positionBubbleChart = positionBubbleChart;
		//positionBubbleChart.on('filtered', this.onChartFiltered.bind(this));
	}

	drawIndustryPieChart() {

		let {industry_quarter_chart} = this.refs;

		let industryPieChart = this.industryPieChart || DC.pieChart(industry_quarter_chart);

			industryPieChart
			.width(170)
			.height(170)
			.radius(80)
			.innerRadius(50)
			.dimension(this.industryDim)
			.group(this.industryGroup);

		industryPieChart.on('filtered', this.onChartFiltered.bind(this));
		this.industryPieChart = industryPieChart;
	}

	drawYieldDimCountChart() {

		let {yield_count_chart} = this.refs;

		//收益率统计
		let yieldDimCountChart = DC.barChart(yield_count_chart);
		yieldDimCountChart
			//.width(420)
			//.height(200)
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
