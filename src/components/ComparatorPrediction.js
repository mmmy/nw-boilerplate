import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { layoutActions } from '../flux/actions';
import echarts from 'echarts';
import { predictionRandomData } from './utils/comparatorPredictionEchart';

const propTypes = {
  patterns: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  lastClosePrice: PropTypes.number.isRequired,
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

  shouldComponentUpdate(){
    return true;
  }
  componentDidUpdate() {
    let option = window.eChart.getOption();
    option.series = this.generateSeriesDataFromDimension();
    window.eChart.setOption(option, true);
    console.info('ComparatorPrediction did update in millsec: ', new Date() - this.d1);
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    window.onresize = _.throttle(() => {
      window.eChart.resize}, 100);
  }

  initDimensions() {
		let { crossFilter } = this.props.patterns;
		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.oldCrossFilter = crossFilter;
		}
    this.xAxisData = [];

    if (this.symbolDim.top(Infinity).length !== 0)
      for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { this.xAxisData.push(i); }
	}

  splitData(kLine, baseBars) {
    let data = [];
    if (window.tv0_height) {
      if (kLine && kLine.length > baseBars) {
        let line =  kLine.slice(baseBars);

        line.forEach((e, i) => {
          let percentage = ((e[2] - line[0][2]) / line[0][2] * 100);
          data.push(percentage);
        });
      }
    }
    return data;
  }

  generateSeriesDataFromDimension() {
    this.initDimensions();
    let eChartSeriesData = [];
    let rawData = this.symbolDim.top(Infinity);
    let activeId = this.props.activeId;

    let maxValue = -9999;
    let minValue = 9999;
    if (rawData.length !== 0) {
      this.symbolDim.top(Infinity).forEach((e, i) => {
        if (e.kLine.length > e.baseBars) {
          let data = this.splitData(e.kLine, e.baseBars);
          if (data.length > 0) {
            eChartSeriesData.push({
              data: data,
              name: e.symbol,
              type: 'line',
              showSymbol: false,
              hoverAnimation: false,
              lineStyle: {
                normal: {
                  color: e.id === 5 ? '#c23531' : '#ccc', // TODO
                  width: 0.5
                }
              },
              z: e.id === 5 ? 9999 : 2
            });
          }
        }
      });

      let dataMaxLength = 0;
      eChartSeriesData.forEach((serie) => {
        if (serie.data.length > dataMaxLength && serie.data.length !== 1) dataMaxLength = serie.data.length;
      });


      eChartSeriesData.forEach((serie) => {
        let data = serie.data
        if (data.length !== 1) {
          while (data.length < dataMaxLength) {
            data.push(data[data.length - 1]);
          }
        }

        data.forEach((d) => {
          maxValue = d >= maxValue ? d : maxValue;
          minValue = d < minValue ? d : minValue;
        })
      });
    }

    window.eChartMaxValue = maxValue;
    window.eChartMinValue = minValue;
    let scaleMax = Math.max(Math.abs(maxValue), Math.abs(minValue));
    window.eChartScale = scaleMax * 1.3;

    return eChartSeriesData;
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
      backgroundColor: 'RGBA(250, 251, 252, 1.00)',
      grid: {
        x: 0,
        x2: 0,
        y: 9,
        y2: 10
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
        show: false,
        position: 'right',
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        },
        // scale: true,
        // interval: 0.5,
        // max: 100,
        // min: -100
      },
      series: this.generateSeriesDataFromDimension()
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
