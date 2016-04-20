import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import {factorCandleOption , factorLineOption} from './utils/echart-options';

const renderDataLen = 40;

function splitData(rawData) {

	let pluckInterval = Math.floor(rawData.length / renderDataLen) || 1;
    
    let categoryData = [];
    let values = [];
    
    for (let i = 0; i < rawData.length; i += pluckInterval) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
    }
    
    return {
        categoryData: categoryData,
        values: values
    };
}

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
};

const defaultProps = {
  
};

class EChart extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	drawChart() {
		let node = this.refs['echart'+this.props.index];
		let chart = echarts.init(node);
		//let crossFilter = this.props.
		const kLine = this.props.pattern.kLine;

		//candleChart
		// let data0 = splitData(kLine);
		// let candleOption = factorCandleOption();
		// candleOption.xAxis.data = data0.categoryData;
		// candleOption.series[0].data = data0.values;
		// //console.log(data0.values[0]);
		// setTimeout(function(){
  //       	chart.setOption(candleOption);	
		// },0);

		let lineOption = factorLineOption();
		lineOption.series[0].data = kLine.map((e,i) => {
			return {
				name: e[0],
				value:[i,e[2]]
			};
		});

		setTimeout(() => {
			chart.setOption(lineOption);
		});

	}

	componentDidMount() {
		this.drawChart();
	}

	componentDidUpdate() {
		//this.drawChart();
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	render(){
		//console.log('index', this.props.index);
		const className = classNames('echart');
		return <div ref={'echart'+this.props.index} className={className} ></div>;
	}
}

EChart.propTypes = propTypes;
EChart.defaultProps = defaultProps;

export default EChart;