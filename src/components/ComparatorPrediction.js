import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { layoutActions } from '../flux/actions';
import echarts from 'echarts';
import { predictionRandomData } from './utils/comparatorPredictionEchart';
import _ from 'underscore';

const propTypes = {
  patterns: PropTypes.object.isRequired,
  stretchView: PropTypes.object.bool,
  filter: PropTypes.object.object
};

const defaultProps = {

};

class ComparatorPrediction extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initEchart();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps){
  }

  shouldComponentUpdate(nextProps){
    return nextProps.stretchView === this.props.stretchView;
  }
  componentDidUpdate() {
    let option = window.eChart.getOption();
    option.series = this.generateSeriesDataFromClosePrice();
    window.eChart.setOption(option, true);
    console.info('ComparatorPrediction did update in millsec: ', new Date() - this.d1);

    const updatePaneViews = this._updatePaneViews ||  _.throttle(() => {
      window.actionsForIframe.updatePaneViews();
    }, 1000);

    this._updatePaneViews = updatePaneViews;

    updatePaneViews();
  }


  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    window.onresize = setTimeout(window.eChart.resize, 0);
  }

  initDimensions() {
		let { crossFilter } = this.props.patterns;
		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.oldCrossFilter = crossFilter;
		}
    // this.xAxisData = [];
    //
    // if (this.symbolDim.top(Infinity).length !== 0)
    //   for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { this.xAxisData.push(i); }
	}

  splitDataFromClosePrice(line) {
    let data = [];
    const firstPrice = line[0];
    const unShiftData = (num) => {
      data.unshift((num - firstPrice) / firstPrice * 100);
    };

    for (let i = line.length; i--;) {
      unShiftData(line[i]);
    }

    return data;
  }

  generateSeriesDataFromClosePrice() {
    this.initDimensions();
    let rawData = this.symbolDim.top(Infinity);
    let { closePrice } = this.props.patterns;
    let series = [];
    let maxValue = this.maxValue;
    let minValue = this.minValue;

    if (rawData.length > 0) {
      const unshiftData = (data) => {
        series.unshift({
          data: this.splitDataFromClosePrice(closePrice[data.id]),
          name: data.id,
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            normal: {
              color: '#ccc',
              width: 0.5
            }
          },
          z: -1
        });
      };

      maxValue = minValue = 0;
      for (let i = rawData.length; i--;) {
        unshiftData(rawData[i]);
      }

      // find max min values for scale
      const maxMinValue = (num) => {
        maxValue = Math.max(num, maxValue);
        minValue = Math.min(num, minValue);
      };
      for (let i = series.length; i--;) {
        for (let j = series[i].data.length; j--;) {
           maxMinValue(series[i].data[j]);
        }
      }

      this.maxValue = maxValue;
      this.minValue = minValue;
    }

    window.eChartMaxValue = this.maxValue;
    window.eChartMinValue = this.minValue;
    let scaleMax = Math.max(Math.abs(this.maxValue), Math.abs(this.minValue));
    window.eChartScale = scaleMax; // scale top/bottom margin

    return series;
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionLine']);
    window.eChart = echarts.init(dom);
    let option = {
      title: {
        show: false,
      },
      animation: 'false',
      animationDuration: '0',
      // color: ['#ccc', '#c23531', '#ccc'],
      color: ['#ccc'],
      // backgroundColor: 'RGBA(250, 251, 252, 1.00)',
      backgroundColor: '#FFFFFF',
      grid: {
        top: 0,
        bottom: 0,
        left: -5,
        right: 50
      },
      tooltip: {
        show: false,
        // trigger: 'axis',
        // formatter: function (params) {
        //   params = params[0];
        //   var date = new Date(params.name);
        //   return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        // },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'category',
        show: false,
        splitLine: {
          show: false
        },
        // data: this.xAxisData
      },
      yAxis: {
        show: true,
        axisLine: {
          show: false,
        },
        axisLabel: {
          formatter: '{value} %',
          textStyle: {
            color: '#656565',
            fontStyle: 'italic',
            fontWeight: 'lighter',
            fontSize: 10
          },
          margin: 10
        },
        axisTick: {
          show: false
        },
        position: 'right',
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        },
        minInterval: 1,
        // splitNumber: 6,
      },
      series: []
      // series: predictionRandomData()
    };

    if (option && typeof option === "object") {
      var startTime = +new Date();
      window.eChart.setOption(option, true);
      var endTime = +new Date();
      var updateTime = endTime - startTime;
      console.log("Time used:", updateTime);
    }
  }

  render(){
    this.d1 = new Date();
    let className = classNames('comparator-prediction-chart');

    return (
      <div ref='eChartPredictionLine' className={ className }></div>
    );
  }
}

ComparatorPrediction.propTypes = propTypes;
ComparatorPrediction.defaultProps = defaultProps;

export default ComparatorPrediction;
