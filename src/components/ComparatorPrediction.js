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
};

const defaultProps = {

};

class ComparatorPrediction extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initEchart()
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps);
  }

  shouldComponentUpdate(){
    return true;
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
			// this.similarityDim = crossFilter.dimension(function(d) {return Math.round(d.similarity*100); });
			this.oldCrossFilter = crossFilter;
		}
	}

  splitData(kLine) {
    let data = [];
    kLine.forEach((e) => {
      data.push(e[2]);
    });
    return data;
  }

  initEchart() {
    this.initDimensions();
    this.eChartSeriesData = [];
    let xAxisData = [];
    for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { xAxisData.push(i); }

    // demo
    this.symbolDim.top(Infinity).forEach((e, i) => {
      this.eChartSeriesData.push({
        data: this.splitData(e.kLine),
        name: '模拟数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: i === 5 ? '#c23531' : '#ccc',
            width: 0.8
          }
        },
        z: i === 5 ? 9999 : 2
      });
    });

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
        y: 14,
        y2: 15
      },
      tooltip: {
        show: false,
        trigger: 'axis',
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
        data: xAxisData
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
        max: 'maxData',
        min: 5.5
      },
      series: this.eChartSeriesData
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
    let className = classNames('comparator-prediction-chart');

    return (
      <div ref='eChartPredictionLine' className={ className }></div>
    );
  }
}

ComparatorPrediction.propTypes = propTypes;
ComparatorPrediction.defaultProps = defaultProps;

var stateToProps = function(state){
  const { layout } = state;
  const { stockView, isPredictionShow } = layout;
  return {
    fullView: !stockView,
    isPredictionShow: isPredictionShow
  }
};

export default connect(stateToProps)(ComparatorPrediction);
