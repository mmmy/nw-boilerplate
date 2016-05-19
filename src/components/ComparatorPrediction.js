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
    let option = window.eChart.getOption();
    option.series = this.generateSeriesData();
    window.eChart.setOption(option, true);
  }

  shouldComponentUpdate(){
    return true;
  }
  componentDidUpdate() {
    console.info('ComparatorPrediction did update in millsec: ', new Date() - this.d1);
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  getLastValueData() {
  // TODO
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
    this.xAxisData = [];

    if (this.symbolDim.top(Infinity).length !== 0)
      for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { this.xAxisData.push(i); }
	}

  splitData(kLine, baseBars) {
    let data = [];

    if (kLine && kLine.length !== 0) {
      // let line = kLine.length > baseBars ? kLine.slice(baseBars) : [0];
      let line = kLine;
      if (line.length > 1) {
        let percentage = this.props.lastClosePrice / line[0][2];

        line.forEach((e, i) => {
          data.push(e[2] * percentage);
        });
      }
    }
    return data;
  }

  generateSeriesData() {
    this.initDimensions();
    let eChartSeriesData = [];
    let rawData = this.symbolDim.top(Infinity);
    let activeId = this.props.activeId;

    let maxValue = 0;
    let minValue = 1000;
    if (rawData.length !== 0) {
      this.symbolDim.top(Infinity).forEach((e, i) => {
        // if (e.kLine - e.baseBars >= 30) {

          eChartSeriesData.push({
            data: this.splitData(e.kLine, e.baseBars),
            name: '模拟数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            lineStyle: {
              normal: {
                color: e.id === 5 ? '#c23531' : '#ccc', // TODO
                width: 0.8
              }
            },
            z: e.id === 5 ? 9999 : 2
          });
        // }
      });

      let dataMaxLength = 0;
      eChartSeriesData.forEach((serie) => {
        if (serie.data.length > dataMaxLength) dataMaxLength = serie.data.length;
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
        // max: 'maxData',
        // min: 5.5
      },
      series: this.generateSeriesData()
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
