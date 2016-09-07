import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import path from 'path';
import ComparatorPrediction from '../components/ComparatorPrediction';
import echarts from 'echarts';
import { generateHeatMapOption } from '../components/utils/heatmap-options';
import searchResultController from '../ksControllers/searchResultController';

let _yMax = 200;
let _yMin = 0;

var option = {
    backgroundColor: '#fff',
      animation: false,
        title: { show: false },
        tooltip: {
          show: false,
          showContent: false,
        },
        toolbox: {
          show: false,
        },
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
        xAxis: {
            type: 'category',
            data: [],
            scale: true,
            boundaryGap : false,
            axisLine: {show: false},
            splitLine: {show: false},
            minInterval: 1,
            axisTick: {
              show: false
            },
            axisLabel:{
              show: false
            },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        },
        yAxis: [{
            scale: true,
            axisLine: {
              show: false
            },
            splitLine:{
              show: false
            },
            axisLabel:{
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
                show: false
            },
        },{
            scale: true,
            axisLine: {
              show: false
            },
            splitLine:{
              show: false
            },
            axisLabel:{
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
                show: false
            },
        }],
        series: [
            {
                name: '上证指数',
                type: 'candlestick',
                data: [],
                z: 1,
                itemStyle: {
                  normal: {
                    borderWidth: true ? '1' : '0',
                    color: true ? '#AC1822' : '#aE0000',
                    color0: true ? 'rgba(0, 0, 0, 0)' : '#5A5A5A',
                    borderColor: '#8D151B',
                    borderColor0: '#050505',
                  },
                  emphasis: {
                    borderWidth: '1'
                  }
                },
            },
        ]
    };

function splitData(rawData, predictionBars) {
  predictionBars += 1;
    var categoryData = [];
    var values = [];

    var lowArr = [], highArr = [];

    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
        lowArr.push(isNaN(+rawData[i][3]) ? Infinity : +rawData[i][3]);
        highArr.push(isNaN(+rawData[i][4]) ? -Infinity : +rawData[i][4]);
    }
    for (var i=0; i<predictionBars; i++) {
      categoryData.push(i+'');
      // values.push([undefined,undefined,undefined,undefined]);
    }
    //console.log(highArr);
    var min = Math.floor(Math.min.apply(null, lowArr));
    var max = Math.ceil(Math.max.apply(null, highArr));

    // var arange10 = [];
    // for (var i=0; i < 15; i++) {
    //  arange10.push([categoryData[baseBars], min + (max - min) / 15 * i]);
    // }

    // var areaData = categoryData.slice(baseBars).map((e) => {
    //  return [e, max];
    // });

    return {
        categoryData: categoryData,
        values: values,
        // lineData: arange10,
        // areaData: areaData,
        yMin: min,
        yMax: max,
    };
}


var generateSeries = function(closePricesArr, startPrice) {
  var lineSeries = [],
      maxPrice = -Infinity,
      minPrice = Infinity;

  lineSeries = closePricesArr.map(function(e,i) {
    var rate = startPrice / e[0];
    return {
      data: e.map(function(price, i){return [i+'', price * rate]}),
        type: 'line',
        yAxisIndex: 1,
        name: i,
        showSymbol: false,
        smooth: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: (i==0) ? '#862020' : 'rgba(200, 200, 200, 0.5)',
            width: 1
          }
        },
        z: (i==0) ? 1 : -1
    };
  });
  lineSeries.forEach((series) => {
    series.data.forEach((data) => {
      var price = data[1];
      minPrice = minPrice < price ? minPrice : price;
      maxPrice = maxPrice > price ? maxPrice : price;
    });
  });
  return {
    lineSeries,
    max: maxPrice,
    min: minPrice,
  };
};


const propTypes = {
	stretchView: PropTypes.bool
};

const defaultProps = {

};

const _drawEchart = true;

class Comparator extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {
    };
    this.heatMapChart = null;
	}

	componentDidMount() {
    this._resizeChart = this.resizeChart.bind(this);
    window.addEventListener('resize', this._resizeChart);
    this.initHeatMap();
	}

	componentWillReceiveProps(){

	}

  initHeatMap() {
    let mapDom = this.refs.heatmap_container;
    let $chartDom = $(mapDom);
    let that = this;
    let option = generateHeatMapOption();
    let fillSpaceLeft = (text, len) => {
      len = len || 0;
      while(text.length < len) {
        text = ' ' + text;
      }
      return text;
    };
    option.grid.left = 0.5;
    option.grid.right = 35.5;
    option.grid.top = -0.5;
    option.grid.bottom = -0.5;
    option.yAxis.axisLabel.margin = 0;
    option.yAxis.nameLocation = 'start';
    option.yAxis.axisLabel.formatter = function(params){
            // console.debug(arguments);
            if(!params) return;
            var points = params.split(':');
            var center = (parseFloat(points[0]) + parseFloat(points[1])) / 2;
            var closePrice = (_yMax + _yMin)/2;
            var centerPrice = (center / $chartDom.height()) * (_yMax - _yMin) + _yMin;
            var percentage = (centerPrice - closePrice) / closePrice * 100;//(_yMax - _yMin) / $chartDom.height() * center + _yMin;
            return  fillSpaceLeft(percentage.toFixed(0) + '%', 7);
          };
    this.heatMapChart = echarts.init(mapDom);
    this.heatMapChart.setOption(option);
    window.heatMapChart = this.heatMapChart;
  }

  updateHeatMap(heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale=1) {

    _yMin = scaleMinValue;
    _yMax = scaleMaxValue;

    // let eachBlockValue = Math.round(Math.sqrt(heatmapYAxis)) / 2; // 根据振幅幅度划分每一个小格的容量
    // let eachValueInPercentage = eachBlockValue / heatmapYAxis;
    // let blocksNumber = Math.round(1 / eachValueInPercentage);
    let blocksNumber = 8;
    let yAxisData = [];

    let heatMapChart = this.heatMapChart;

    let height = heatMapChart.getHeight();
    let eachBlockHeight = height / blocksNumber;

    let min = 0;
    for (let i = 0; i < blocksNumber; i++) {
      yAxisData.push(Math.round(min) + 0.5 + ':' + (Math.round(min += eachBlockHeight)-0.5));
    }

    let linesOption = this.chart.getOption();
    let lastPrices = linesOption.series.slice(1, linesOption.series.length).map((serie, idx) => {
      return serie.data[serie.data.length - 1][1];
    });
    lastPrices.sort((a, b) => {return a - b}); // sort numerically
    let bunch = lastPrices;

    let eChartSeriesData = [];
    let countMax = 0;

    for (let idx = 0; idx < yAxisData.length; idx++) {
      let range = yAxisData[idx].split(':');
      let count = 0;
      for (let i = 0; i < bunch.length; i++) {
        let value = bunch[i];
        // let position = (value + Math.abs(scaleMinValue * manulScale)) / heatmapYAxis * height;
        let position = (value - scaleMinValue) / heatmapYAxis * ( height - 0 );

        if (position > (parseFloat(range[0]) - 0.5) && position <= (parseFloat(range[1]) + 0.5)) count += 1;
      }
      countMax = Math.max(countMax, count);
      eChartSeriesData.push([0, idx, count])
      bunch = bunch.slice(count);
    }
    //将eChartSeriesData 的 count 标准到[0 , 100]
    if(countMax > 0) {
      for(let i=0; i<eChartSeriesData.length; i++) {
        let count = eChartSeriesData[i][2];
        eChartSeriesData[i][2] = count / countMax * 100;
      }
    }

    let option = heatMapChart.getOption();
    option.yAxis[0].data = yAxisData;
    option.series[0].data = eChartSeriesData;

    heatMapChart.setOption(option, true);

  }

  componentDidUpdate() {
  	let { stretchView } = this.props;
  	if(!stretchView) {
  		//$(this.refs.img1).animateCss('slideInLeft');
  		//$(this.refs.img2).animateCss('slideInLeft');
      $('.inner-searchreport').one('transitionend', () => {
        this.resizeChart();
      });
  	}
    let patterns = this.props.patterns;
    if(_drawEchart && (this._oldPatterns !== patterns)) {
      if(!patterns.rawData || !patterns.searchMetaData) 
        return;
      this._oldPatterns = patterns;
      searchResultController.updatePrediction(patterns);
      searchResultController.updateStatistics(patterns);
      searchResultController.updatePatterns(patterns.rawData);
      let { searchMetaData, closePrice, searchConfig } = patterns;
      
      let { kline } = searchMetaData;
      let data0 = splitData(kline, (searchConfig && searchConfig.additionDate.value) || (closePrice[0] && closePrice[0].length));
      var lastClosePrice = data0.values[data0.values.length-1][1];
      var { lineSeries, min, max } = generateSeries(closePrice, lastClosePrice);
      // var minPrice = Math.min(min, data0.yMin);
      // var maxPrice = Math.max(max, data0.yMax);
      //lastClosePrice 居中
      // var offset = Math.max(maxPrice - lastClosePrice, lastClosePrice - minPrice);
      var offset = Math.max(data0.yMax - lastClosePrice, lastClosePrice - data0.yMin);
      var offset1 = Math.max(max - lastClosePrice, lastClosePrice - min);
      this.chart && this.chart.dispose();
      option.series = option.series.slice(0,1).concat(lineSeries);
      option.series[0].data = data0.values;
      option.xAxis.data = data0.categoryData;
      option.yAxis[0].min = lastClosePrice - offset;
      option.yAxis[0].max = lastClosePrice + offset;      
      option.yAxis[1].min = lastClosePrice - offset1;
      option.yAxis[1].max = lastClosePrice + offset1;
      // option.grid.right = 100;//-100 / data0.categoryData.length / 2 * 1.05 + '%';

      let node = this.refs.echart_container;
      this.chart = echarts.init(node);
      this.chart.setOption(option);
      window.comChart = this.chart;

      let y2diff = lastClosePrice + offset1;
      try { 
        this.updateHeatMap(offset1 * 2, lastClosePrice + offset1, lastClosePrice - offset1);
      } catch(e) {
        console.error(e);
      }
    }
  }

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
    window.removeEventListener('resize', this._resizeChart);
	}

  resizeChart() {
    this.chart && this.chart.resize();
  }

  renderImages() {
    let { stretchView, screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL, searchingError } = this.props;
    const screenshotTvClassName = classNames('comparator-tv-screenshot transition-all', {
    	'stretch': stretchView
    });
    const screenshotEchartClassName = classNames('comparator-echart-screenshot transition-all', {
    	'stretch':stretchView
    });
    const screenshotHeatmapClassName = classNames('comparator-heatmap-screenshot transition-all', {
    	'stretch':stretchView
    });
    return [
            (screenshotTvURL ? <img ref='img1' key={ screenshotTvURL } src={ screenshotTvURL } className={ screenshotTvClassName }/> : '' ),
            (screenshotEChartURL ? <img ref='img2' key={ screenshotEChartURL } src={ screenshotEChartURL } className={ screenshotEchartClassName }/> : '' ),
            (screenshotHeatmapURL ? <img ref='img3' key={ screenshotHeatmapURL } src={ screenshotHeatmapURL } className={ screenshotHeatmapClassName }/> : '')
        ];
  }

  renderEchart() {
    return [
            <div className='echart-container' ref='echart_container'></div>,
            <div className='heatmap-container' ref='heatmap_container'></div>
            ];
  }

  renderHeatMap() {
    return <div className='heatmap-container' ref='heatmap_container'></div>;
  }

  render() {
    let { stretchView, screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL, searchingError } = this.props;
    const containerClassName = classNames('transition-all', 'container-comparator', {
      'container-comparator-stretch': this.props.stretchView,
    });

      const searchingInfoClassNames = classNames('searching-info font-simsun', {
        'ks-hidden': searchingError
      })

    return (
      <div className={ containerClassName } >
        <div className='comparator-inner'>
          {/*setting searching info from TradingView*/}
          <h3 className='title'>匹配图形&走势分布</h3>
          <div className={ searchingInfoClassNames }><span className={'searching-info-content'}></span><span className={'searching-info--prediction-lable'}>走势分布</span></div>
          { _drawEchart ? this.renderEchart() : this.renderImages() }
        </div>
      </div>
    );
	}
}

Comparator.propTypes = propTypes;
Comparator.defaultProps = defaultProps;

let stateToProps = function(state) {
	const { layout, patterns } = state;
	const { stockView, hasNewScreenshot, screenshotTvURL, screenshotEChartURL, screenshotHeatmapURL } = layout;
  const { error } = patterns;
	return {
    patterns,
		stretchView: !stockView,
    hasNewScreenshot: hasNewScreenshot,
    screenshotTvURL: screenshotTvURL,
    screenshotEChartURL: screenshotEChartURL,
    screenshotHeatmapURL: screenshotHeatmapURL,
    searchingError: error
	};
};
export default connect(stateToProps)(Comparator);
