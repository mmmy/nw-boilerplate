import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import path from 'path';
import ComparatorPrediction from '../components/ComparatorPrediction';
import echarts from 'echarts';

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
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
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
                    color: true ? 'transparent' : '#aE0000',
                    color0: true ? 'transparent' : '#5A5A5A',
                    borderColor: '#aE0000',
                    borderColor0: '#5A5A5A',
                  },
                  emphasis: {
                    borderWidth: '1'
                  }
                },
            },
        ]
    };

function splitData(rawData, predictionBars) {
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
        showSymbol: false,
        smooth: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: '#aaa',//'rgba(0, 0, 0, 0.2)',
            width: 1
          }
        }
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
	}

	componentDidMount() {
	}

	componentWillReceiveProps(){

	}

  componentDidUpdate() {
  	let { stretchView } = this.props;
  	if(!stretchView) {
  		//$(this.refs.img1).animateCss('slideInLeft');
  		//$(this.refs.img2).animateCss('slideInLeft');
  	}
    let patterns = this.props.patterns;
    if(_drawEchart && this._oldPatterns !== patterns) {
      if(!patterns.rawData || !patterns.searchMetaData) 
        return;
      this._oldPatterns = patterns;

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

      let node = this.refs.echart_container;
      this.chart = echarts.init(node);
      this.chart.setOption(option);
      window.comChart = this.chart;
    }
  }

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

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
    return <div className='echart-container' ref='echart_container'></div>;
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
        {/*setting searching info from TradingView*/}
        <div className={ searchingInfoClassNames }><span id={'searching-info-content'}></span><span className={'searching-info--prediction-lable'}>走势预测</span></div>
        { _drawEchart ? this.renderEchart() : this.renderImages() }
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
