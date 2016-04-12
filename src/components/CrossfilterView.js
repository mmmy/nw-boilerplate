import { connect } from 'react-redux';
import Crossfilter from 'crossfilter';
import React, { PropTypes } from 'react';
import d3 from 'd3';
import DC from 'dc';
import classnames from 'classnames';

import { filterActions } from '../flux/actions';

const propTypes = {
	crossFilter: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

const defaultProps = {

};

class CrossfilterView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
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

<<<<<<< HEAD
	componentDidUpdate() {
		this.drawDc();
	}

	render(){
		return <div className="crossfilter-container">
			<div ref='position_bubble_chart'></div>
			<div ref='industry_quarter_chart'></div>
			<div ref='yield_count_chart'></div>
		</div>;
	}
=======
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
>>>>>>> f45ac10521ce853fac8b107c82fd3ae27865d7d2

	drawDc(){
		window.d3 = d3;
		window.dc = DC;
		this.drawPositionBubbleChart();
		this.drawYieldDimCountChart();
		this.drawIndustryPieChart();

		DC.renderAll();

	}

	drawPositionBubbleChart(){

		let {position_bubble_chart} = this.refs;

		let { crossFilter } = this.props;

		let idDim = crossFilter.dimension((data) => { return data.id; });

		let idGroup = idDim.group().reduce(
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

		window.idGroup = idGroup;
		let positionBubbleChart = DC.bubbleChart(position_bubble_chart)
			.width(500)
			.dimension(idDim)
			.group(idGroup)
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

		let { crossFilter } = this.props;

		let industryDim = crossFilter.dimension((data) => { return data.industry; });

		let industryGroup = industryDim.group();

		let industryPieChart = this.industryPieChart || DC.pieChart(industry_quarter_chart);

			industryPieChart
			.width(170)
			.height(170)
			.radius(80)
			.innerRadius(50)
			.dimension(industryDim)
			.group(industryGroup);

		industryPieChart.on('filtered', this.onChartFiltered.bind(this));
		this.industryPieChart = industryPieChart;
	}

	drawYieldDimCountChart() {

		let {yield_count_chart} = this.refs;

		let { crossFilter } = this.props;

		let yieldDim = crossFilter.dimension((data) => { return Math.round(data.yield*10/1.5); });

		window.yieldDim = yieldDim;

		let yieldGroup = yieldDim.group();

		//收益率统计
		let yieldDimCountChart = DC.barChart(yield_count_chart);
		yieldDimCountChart
			//.width(420)
			//.height(200)
			.dimension(yieldDim)
			.group(yieldGroup)
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

function stateToPorps(state) {
  const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
}

export default connect(stateToPorps)(CrossfilterView);
