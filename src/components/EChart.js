import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import {factorCandleOption, factorLineOption} from './utils/echart-options';

function splitData(rawData) {
    var categoryData = [];
    var values = []
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
    }
    return {
        categoryData: categoryData,
        values: values
    };
}

const propTypes = {
	kLine: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
};

const defaultProps = {
  
};

class Template extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		let node = this.refs['echart'+this.props.index];
		let chart = echarts.init(node);
		const data = this.props.kLine.kLine;
		var data0 = splitData(data);
		let candleOption = factorCandleOption();
		candleOption.xAxis.data = data0.categoryData;
		candleOption.series[0].data = data0.values;
		//console.log(data0.values[0]);
		setTimeout(function(){
        	chart.setOption(candleOption);	
		},0);
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

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

export default Template;