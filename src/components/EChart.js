import React, { PropTypes } from 'react';
import echarts from 'echarts';
import classNames from 'classnames';
import { setFunc, setCanvasVisibleFunc } from './helper/updateEchartImage';
import {factorCandleOption , factorLineOption} from './utils/echart-options';
import store from '../store';
import painter from '../ksControllers/painter';
let { drawKline } = painter;
import _ from 'underscore';

const renderDataLen = Infinity;
let candleChart = true;
let _showPrediction = false;
let _metaBased = false;

let createKlineImg = (canvas, width, height, kline, options) => {
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	canvas.width = width;
	canvas.height = height;
	drawKline(canvas, kline, options);
	return canvas.toDataURL();
};

let _getSearchKlineRates = () => {
	let state = store.getState();
	let { searchMetaData } = state.patterns;
	if(searchMetaData && searchMetaData.kline) {
		let kline = searchMetaData.kline;
		let close0 = kline[0][2];

		var lowArr = [], highArr = [];

    for (var i = 0; i < kline.length; i++) {
        lowArr.push(isNaN(+kline[i][3]) ? Infinity : +kline[i][3]);
        highArr.push(isNaN(+kline[i][4]) ? -Infinity : +kline[i][4]);
    }
    //console.log(highArr);
    var min = Math.min.apply(null, lowArr);
    var max = Math.max.apply(null, highArr);
    var offset = 1.05;
    return	{rateMax: max/close0, rateMin: min/close0 /offset};
	}

};

let createEmptyKline = (len) => {
	let data = [];
	for (let i=0; i<len; i++) {
		data.push([undefined, undefined, undefined, undefined]);
	}
	return data;
};

function splitData(rawData, baseBars, predictionBars, showPrediction) {
	//console.log('baseBars', baseBars);
    var categoryData = [];
    var values = [];
    rawData = showPrediction ? rawData : rawData.slice(0, baseBars);

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
    if(showPrediction) {
	    for (var i=0; i < 20; i++) {
	    	arange10.push([categoryData[baseBars-1], min + (max - min) / 20 * i]);
	    }
    }

    var areaData = !showPrediction ? [] : categoryData.slice(baseBars-1).map((e) => {
    	return [e, max];
    });
    if(showPrediction && (values.length < baseBars + predictionBars)) {
    	values = values.concat(createEmptyKline(baseBars + predictionBars - values.length));
    }
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
};

const defaultProps = {

};

class EChart extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.chart = null;
		// this.canvasNode = window.document.createElement('canvas');
		// this.canvasNode.height = 140;
		// this.canvasNode.width = 200;
	}

	setImgSrc(size) {  //-1: hide, 0: normal, 1: median, 2: small
		// let imgNode = this.refs['img'];
		// if(!imgNode) {
		// 	console.error('no image node:',this.props.index);
		// 	return;
		// }
		// if (size === undefined) {
		// 	size = this.getImgSize();
		// }
		// if(size === -1) {
		// 	imgNode.style.opacity = 0;
		// 	return;
		// }
		// imgNode.style.opacity = '';
		// switch(size) {
		// 	case 0:
	 //    	imgNode.src = this._imgNormal;
	 //    	break;
	 //    case 1:
	 //    	imgNode.src = this._imgMedian;
	 //    	break;
	 //    case 2:
	 //    	imgNode.src = this._imgSmall;
	 //    	break;
	 //    default:
	 //    	break;
		// }
	}

  getImgSize() {
		let {index, fullView, id} = this.props;
  	let baseW = 1450;
  	let window_W = document.body.clientWidth;
  	let small = window_W < 1450;
  	if(index == 0 && !fullView) {
  		return 0;
  	}
  	if(!fullView && index > 0 && index < 5) {
  		return 2;
  	}
  	if(small) {
  		return 1;
  	} else {
  		return 0;
  	}
  }

	drawChart(callback, pattern) {
		// let node = this.refs['echart'+this.props.index];
		// let pattern = store.getState().patterns.rawData[this.props.id];
		// if(!pattern) return;
		// let { kLine, baseBars } = this.props.pattern;
		// const { searchConfig } = this.props;
		// if(!pattern) { //优先使用pattern
		// 	if ((this.oldKline === kLine) || (!kLine.length) || (kLine.length < 1)) {
		// 		if(this.oldKline === kLine) {
		// 			// this.setImgSrc();
		// 		}
		// 		return;
		// 	}
		// }else {
		// 	kLine = pattern.kLine;
		// 	baseBars = pattern.baseBars;
		// }
		// this.oldKline = kLine;
		// // let node = this.canvasNode || window.document.createElement('canvas');
		// // this.canvasNode = node;

		// // let chart = this.chart || echarts.init(node);
		// let index = this.props.index;
		// if(index===0){
		// 	window.chart = chart;
		// }
		//candleChart
		if (candleChart) {
			this.updateKlineCanvas();
			// node.height = 140;
			// node.width = 200;
			// this.chart && this.chart.dispose();
			// this.chart = echarts.init(node);//&& this.chart.dispose();
			// let data0 = splitData(kLine, baseBars, searchConfig && parseInt(searchConfig.additionDate.value), _showPrediction);
			// let candleOption = factorCandleOption(true);
			// candleOption.xAxis.data = data0.categoryData;
			// candleOption.series[0].data = data0.values;
			// candleOption.series[1].data = data0.lineData;
			// candleOption.series[2].data = data0.areaData;
			// let rates = _metaBased && _getSearchKlineRates();
			// candleOption.yAxis.min = rates ? rates.rateMin * data0.values[0][1] : data0.yMin;
			// candleOption.yAxis.max = rates ? rates.rateMax * data0.values[0][1] : data0.yMax;
			//console.log(data0.values[0]);
			//setTimeout(function(){
	        	// this.chart.setOption(candleOption);
	        	// let imgUrl = this.chart.getDataURL();

	    // this._imgNormal = imgUrl;
	    // let drawOptions = {
	    	// yMin: rates ? rates.rateMin * data0.values[0][1] : data0.yMin,
	    	// yMax: rates ? rates.rateMax * data0.values[0][1] : data0.yMax,
	    	// upColor: '#AC1822',
	    	// upBorderColor: '#8D151B',
	    	// downColor: 'rgba(0, 0, 0, 0)',
	    	// downBorderColor: '#000',
	    	// backgroundColor: '#fff',
	    // };
	    // let kline = kLine.slice(0, baseBars);//data0.values;
	    // this._imgNormal = createKlineImg(node, 200, 100, kline, drawOptions);

	    // node.height = 102;
	    // node.width = 90;
	    // this.chart.resize();
	    // this.chart && this.chart.dispose();
	    // this.chart = echarts.init(node);
	    // this.chart.setOption(candleOption);
	    // this.chart.resize(100,100);
	    // this._imgSmall = this.chart.getDataURL();
	    // this._imgSmall = createKlineImg(node, 90, 45, kline, drawOptions);

	    // node.height = 110;
	    // node.width = 120;
	    // this.chart && this.chart.dispose();
	    // this.chart =echarts.init(node);
	    // this.chart.setOption(candleOption);
	    // this._imgMedian = this.chart.getDataURL();
	    // this.chart && this.chart.dispose();
	    // this._imgMedian = createKlineImg(node, 120, 60, kline, drawOptions);
	    
	    // if(index == 0) {
	    // 	window._imgSmall = this._imgSmall;
	    // 	window._imgMedian = this._imgMedian;
	    // 	window._imgNormal = this._imgNormal;
	    // 	window._chart = this.chart;
	    // }
			//debugger;
			//},0);
			// this.setImgSrc();
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

	updateKlineCanvas() {
		let canvas = this.refs.kline_canvas;
		let pattern = this.props.pattern;
		let index = this.props.index;
		let kline = pattern && pattern.kLine || [];
		let baseBars = pattern && pattern.baseBars || Infinity;

		// if(!canvas || index > 5) return;

		// let $canvas = $(canvas);
		let parent = canvas.parentNode;
		let width = parent.clientWidth,
				height = parent.clientHeight;
		// canvas.style.width = width + 'px';
		// canvas.style.height = height + 'px';
		canvas.width = width;
		canvas.height = height;
		if(!kline.slice) {
			console.log(pattern, '!kline.slice',pattern.kLine, kline);
			console.log(pattern.kLine == kline);
		}
		drawKline(canvas, kline.slice(0, baseBars), {backgroundColor: '#fff'});
	}

	hideCanvas(hide) {
			this.refs.kline_canvas.style.opacity = hide ? '0' : '';
	}

	componentDidMount() {
		// this.drawChart();
		setFunc(this.props.id, this.drawChart.bind(this));
		setCanvasVisibleFunc(this.props.id, this.hideCanvas.bind(this));
		// setImgSrcFunc(this.props.id, this.setImgSrc.bind(this));
		// let index = this.props.index;
		// if(index>=0 && index<=4) {
			this.updateKlineCanvas();
			// this._updateKlineCanvasDebounce = _.debounce(this.updateKlineCanvas.bind(this), 1000);
			// window.addEventListener('resize', this._updateKlineCanvasDebounce);
		// }
	}

	componentDidUpdate() {

			// setTimeout(this.drawChart.bind(this));
			// this.drawChart();
			this.updateKlineCanvas();
			// let { fullView, index } = this.props;
			// if(!fullView && index>=0 && index<=4) {
			// 	// $('.inner-searchreport').one('transitionend', () => {
			// 		this.updateKlineCanvas();
			// 	// });
			// }
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
		if(newProps.pattern != this.props.pattern) {
			this.hideCanvas(false);
		}
	}

	shouldComponentUpdate(newProps){
		return true;
	}

	componentWillUnmount(){
		delete this.canvasNode;
		// this.chart && this.chart.dispose && this.chart.dispose();
		delete this.chart;
		// window.removeEventListener('resize', this._updateKlineCanvasDebounce);
	}

	render(){

		let { fullView, index, isTrashed } = this.props;
		//console.log('index', this.props.index);
		let isLarger = !fullView && index === 0,
				isSmaller = !fullView && index > 0 && index < 5;
		const className = classNames('echart', 'transition-all', {
			'larger': false,//isLarger,
			'smaller': false,//isSmaller,
		});
		let canvasWrapper = <div className='kline-canvas-wrapper' ref='canvas_wrapper'><canvas ref='kline_canvas' className='kline-canvas'/></div>;
		let trashInfo = isTrashed ? <div className='trashed-info'>{/*<h1>不参与</h1><h1>走势计算</h1>*/}</div> : '';
		return <div ref={'echart'+this.props.index} className={className} >
							<h3 style={{color: '#d0d0d0'}}>加载中...</h3>
							{/*<img ref='img' src='' />*/}
							{trashInfo}
							{canvasWrapper}
						</div>;

	}
}

EChart.propTypes = propTypes;
EChart.defaultProps = defaultProps;

export default EChart;
