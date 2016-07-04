import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import { setFunc, setImgSrcFunc } from './helper/updateEchartImage';
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
        lowArr.push(isNaN(+rawData[i][3]) ? Infinity : +rawData[i][3]);
        highArr.push(isNaN(+rawData[i][4]) ? -Infinity : +rawData[i][4]);
    }
    //console.log(highArr);
    var min = Math.min.apply(null, lowArr);
    var max = Math.max.apply(null, highArr);

    var arange10 = [];
    for (var i=0; i < 20; i++) {
    	arange10.push([categoryData[baseBars-1], min + (max - min) / 20 * i]);
    }

    var areaData = categoryData.slice(baseBars-1).map((e) => {
    	return [e, max];
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
	isTrashed: PropTypes.bool,
	id: PropTypes.number.isRequired,
	imgSize: PropTypes.bool
};

const defaultProps = {
	imgSize: 0
};

class EChart extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.chart = null;
		this.canvasNode = window.document.createElement('canvas');
		this.canvasNode.height = 140;
		this.canvasNode.width = 200;
	}

	setImgSrc(size) {  //0: normal, 1: median, 2: small
		switch(size) {
			case 0:
	    	this.refs['echart'+this.props.index].firstChild.src = this._imgNormal;
	    	break;
	    case 1:
	    	this.refs['echart'+this.props.index].firstChild.src = this._imgMedian;
	    	break;
	    case 2:
	    	this.refs['echart'+this.props.index].firstChild.src = this._imgSmall;
	    	break;
	    default:
	    	break;
		}
	}

	drawChart(callback) {
		// let node = this.refs['echart'+this.props.index];
		const { kLine, baseBars } = this.props.pattern;
		if ((this.oldKline === kLine) || (!kLine.length) || (kLine.length < 1)) {
			if(this.oldKline === kLine) {
				this.setImgSrc(this.props.imgSize);
			}
			return;
		}
		this.oldKline = kLine;
		let node = this.canvasNode;

		// let chart = this.chart || echarts.init(node);
		let index = this.props.index;
		// if(index===0){
		// 	window.chart = chart;
		// }
		//candleChart
		if (candleChart) {
			node.height = 140;
			node.width = 200;
			this.chart && this.chart.dispose();
			this.chart = echarts.init(node);//&& this.chart.dispose();
			let data0 = splitData(kLine, baseBars);
			let candleOption = factorCandleOption(true);
			candleOption.xAxis.data = data0.categoryData;
			candleOption.series[0].data = data0.values;
			candleOption.series[1].data = data0.lineData;
			candleOption.series[2].data = data0.areaData;
			// candleOption.yAxis.min = data0.yMin;
			candleOption.yAxis.max = data0.yMax;
			//console.log(data0.values[0]);
			//setTimeout(function(){
	        	this.chart.setOption(candleOption);
	        	let imgUrl = this.chart.getDataURL();

	    this._imgNormal = imgUrl;

	    node.height = 102;
	    node.width = 90;
	    // this.chart.resize();
	    this.chart.dispose();
	    this.chart = echarts.init(node);
	    this.chart.setOption(candleOption);
	    // this.chart.resize(100,100);
	    this._imgSmall = this.chart.getDataURL();

	    node.height = 110;
	    node.width = 120;
	    this.chart.dispose();
	    this.chart =echarts.init(node);
	    this.chart.setOption(candleOption);
	    this._imgMedian = this.chart.getDataURL();

	    if(index == 0) {
	    	window._imgSmall = this._imgSmall;
	    	window._imgMedian = this._imgMedian;
	    	window._imgNormal = this._imgNormal;
	    	window._chart = this.chart;
	    }
			//debugger;
			//},0);
			this.setImgSrc(this.props.imgSize);
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
		callback &&  setTimeout(callback, 5);
	}

	componentDidMount() {
		this.drawChart();
		setFunc(this.props.id, this.drawChart.bind(this));
		setImgSrcFunc(this.props.id, this.setImgSrc.bind(this));
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
		delete this.canvasNode;
		this.chart.dispose && this.chart.dispose();
		delete this.chart;
	}

	render(){

		let { fullView, index, isTrashed } = this.props;
		//console.log('index', this.props.index);
		const className = classNames('echart', 'transition-all', {
			'larger': !fullView && index === 0,
			'smaller': !fullView && index > 0 && index < 5,
		});

		let trashInfo = isTrashed ? <div className='trashed-info'>{/*<h1>不参与</h1><h1>走势计算</h1>*/}</div> : '';
		return <div ref={'echart'+this.props.index} className={className} ><img src='' />{trashInfo}</div>;

	}
}

EChart.propTypes = propTypes;
EChart.defaultProps = defaultProps;

export default EChart;
