import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import {factorCandleOption , factorLineOption} from './utils/echart-options';

const renderDataLen = Infinity;
let candleChart = true;

function splitData(rawData, baseBars) {
	//console.log('baseBars', baseBars);
    var categoryData = [];
    var values = [];

    var lowArr = [], highArr = [];

    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
        lowArr.push(isNaN(+rawData[i][2]) ? Infinity : +rawData[i][2]);
        highArr.push(isNaN(+rawData[i][3]) ? -Infinity : +rawData[i][3]);
    }
    //console.log(highArr);
    var min = Math.min.apply(null, lowArr);
    var max = Math.max.apply(null, lowArr);

    var arange10 = [];
    for (var i=0; i < 40; i++) {
    	arange10.push([categoryData[baseBars], min + (max - min) / 23 * i]);
    }

    var areaData = categoryData.slice(baseBars).map((e) => {
    	return [e, max * 2];
    });

    return {
        categoryData: categoryData,
        values: values,
        lineData: arange10,
        areaData: areaData,
        yMin: min,
        yMax: max,
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
		this.canvasNode = window.document.createElement('canvas');
		this.canvasNode.height = 200;
		this.canvasNode.width = 200;
	}

	drawChart() {
		// let node = this.refs['echart'+this.props.index];
		const { kLine, baseBars } = this.props.pattern;
		if (this.oldKline === kLine) {
			return;
		}
		this.oldKline = kLine;
		let node = this.canvasNode;

		let chart = echarts.init(node);
		let index = this.props.index;
		this.chart = chart;
		if(index===0){
			window.chart = chart;
		}
		//candleChart
		if (candleChart) {

			let data0 = splitData(kLine, baseBars);
			let candleOption = factorCandleOption(kLine.length < 50);
			candleOption.xAxis.data = data0.categoryData;
			candleOption.series[0].data = data0.values;
			candleOption.series[1].data = data0.lineData;
			candleOption.series[2].data = data0.areaData;
			candleOption.yAxis.min = data0.yMin;
			candleOption.yAxis.max = data0.yMax;
			//console.log(data0.values[0]);
			//setTimeout(function(){
	        	chart.setOption(candleOption);
	        	let imgUrl = chart.getDataURL();
	        	this.refs['echart'+this.props.index].firstChild.src = imgUrl;
			//debugger;
			//},0);

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

			setTimeout(this.drawChart.bind(this));
			//this.drawChart()	
		//console.log('echart componentDidUpdate');
		/*******************************************
		let { fullView, index }  = this.props;
		let oldFullView = this.oldfullView;

		if(fullView !== oldFullView && index >= 0 && index <= 5){
			const transitionDuration = 2000;
			let that = this;
			console.log('hahah -----------------------');
			for (let i=0; i<transitionDuration; i+=250){

				setTimeout(() => {
					try {
						that.chart.resize();
					}catch(e){
						console.log(e);
					}

				}, i);
			}
		}

		this.oldfullView = fullView;
		*********************************/
	}

	componentWillReceiveProps(newProps){
		
	}

	shouldComponentUpdate(newProps){
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

		return <div ref={'echart'+this.props.index} className={className} ><img src='' /></div>;

	}
}

EChart.propTypes = propTypes;
EChart.defaultProps = defaultProps;

export default EChart;