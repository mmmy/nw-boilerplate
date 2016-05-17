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
    for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { this.xAxisData.push(i); }
	}

  splitData(kLine, baseBars) {
    let data = [];
    let percentage = this.props.lastClosePrice / kLine[0][2];
    data.push(kLine[0][2] * percentage);

    if (kLine.length > baseBars) {
      kLine.slice(baseBars).forEach((e, i) => {
        data.push(e[2] * percentage);
      });
    } else {
      kLine.forEach((e, i) => {
        data.push(e[2] * percentage);
      });
    }
    return data;
  }

  generateSeriesData() {
    this.initDimensions();
    let eChartSeriesData = [];
    // demo
    this.symbolDim.top(Infinity).forEach((e, i) => {
      eChartSeriesData.push({
        data: this.splitData(e.kLine, e.baseBars),
        name: '模拟数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: i === 5 ? '#c23531' : '#ccc', // 暂时写死第五条线是红色
            width: 0.8
          }
        },
        z: i === 5 ? 9999 : 2
      });
    });

    let dataMaxLength = 0;
    eChartSeriesData.forEach((serie) => {
      if (serie.data.length > dataMaxLength) dataMaxLength = serie.data.length;
    });

    eChartSeriesData.forEach((serie) => {
      let data = serie.data
      while (data.length < dataMaxLength) {
        data.push(data[data.length - 1]);
      }
    });

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
