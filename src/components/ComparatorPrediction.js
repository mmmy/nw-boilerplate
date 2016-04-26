import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { layoutActions } from '../flux/actions';
import echarts from 'echarts';
import { predictionRandomData } from './utils/comparatorPredictionEchart';

const propTypes = {
  // series: PropTypes.array.isRequired,

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
  }

  componentWillReceiveProps(){

  }

  shouldComponentUpdate(){
    return true;
  }

  componentWillUnmount(){

  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionLine']);
    window.eChart = echarts.init(dom);
    window.onresize = window.eChart.resize;
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
        formatter: function (params) {
          params = params[0];
          var date = new Date(params.name);
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        show: false,
        splitLine: {
          show: false
        },
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
      series: predictionRandomData()
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
    let className = classNames('comparator-prediction-chart',
    // {
    //   'comparator-prediction-hide': !this.props.isPredictionShow
    // }
  );

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
