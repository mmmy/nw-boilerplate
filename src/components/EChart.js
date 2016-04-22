import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import {factorCandleOption , factorLineOption} from './utils/echart-options';

const renderDataLen = Infinity;
let candleChart = true;

function splitData(rawData) {

	let pluckInterval = Math.floor(rawData.length / renderDataLen) || 1;
    
    let categoryData = [];
    let values = [];
    
    var lowArr = [], highArr = [];

    for (let i = 0; i < rawData.length; i += pluckInterval) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
        lowArr.push(isNaN(+rawData[i][2]) ? Infinity : +rawData[i][2]);
        highArr.push(isNaN(+rawData[i][3]) ? -Infinity : +rawData[i][3]);
    }
    
    return {
        categoryData: categoryData,
        values: values,
        yMin: Math.min.apply(null, lowArr),
        yMax: Math.max.apply(null, highArr),
    };
}

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	fullView: PropTypes.bool.isRequired,
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
		const kLine = this.props.pattern.kLine;

		//candleChart
		if (candleChart) {

			let data0 = splitData(kLine);
			let candleOption = factorCandleOption();
			candleOption.xAxis.data = data0.categoryData;
			candleOption.series[0].data = data0.values;
			candleOption.yAxis.min = data0.yMin;
			candleOption.yAxis.max = data0.yMax;
			//console.log(data0.values[0]);
			setTimeout(function(){
	        	chart.setOption(candleOption);	
			},0);

		} else {

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

		let { fullView, index } = this.props;
		//console.log('index', this.props.index);
		const className = classNames('echart', 'transition-all', {
			'larger': !fullView && index === 0,
			'smaller': !fullView && index > 0 && index < 5,
		});

		return <div ref={'echart'+this.props.index} className={className} ></div>;

	}
}

EChart.propTypes = propTypes;
EChart.defaultProps = defaultProps;

export default EChart;