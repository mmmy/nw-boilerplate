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
  filter: PropTypes.object.isRequired,
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
      console.debug('updatePaneViews');
      let dom = window.widget_comparator && window.widget_comparator._innerWindow && window.widget_comparator._innerWindow();
      if (dom) {
        let m = dom.Q5 && dom.Q5.getAll()[0];
        let model = m.model();
        let series = model.mainSeries()
        let ps = series.priceScale()

        ps.updatePaneViews(true);
      }
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
    for (var i = 0; i < line.length; i++) {
      let e = line[i];
      let percentage = (e - line[0]) / line[0] * 100;
      data.push(percentage);
    }

    return data;
  }

  generateSeriesDataFromClosePrice() {
    this.initDimensions();
    let rawData = this.symbolDim.top(Infinity);
    let { closePrice } = this.props.patterns;
    let activeId = this.props.activeId;
    let series = [];
    // let maxValue = 0 * -1;
    let maxValue = this.maxValue;
    let minValue = this.minValue;
    if (rawData.length > 0) {
      maxValue =  minValue = 0;
      for (var i = 0; i < rawData.length; i++) {
        let e = rawData[i]
        series.push({
          data: this.splitDataFromClosePrice(closePrice[e.id]),
          name: e.symbol,
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            normal: {
              color: e.id === activeId ? '#c23531' : '#ccc',
              width: 0.5
            }
          },
          z: e.id === activeId ? 1 : -1
        });
      }

      // find max min values for scale
      for (let i = 0; i < series.length; i++) {
        let serie = series[i]
        let data = serie.data;
        for (let j = 0; j < data.length; j++) {
          let d = data[j]
          maxValue = Math.max(d, maxValue);
          minValue = Math.min(d, minValue);
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
        x: 0,
        x2: 0,
        y: 0,
        y2: 0,
        top: 0,
        bottom: 0
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
          margin: -40
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
