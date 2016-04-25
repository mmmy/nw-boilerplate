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

  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChart']);
    window.eChart = echarts.init(dom);

    let option = {
      title: {
        show: false,
      },
      animation: 'false',
      animationDuration: '0',
      color: ['#ccc', '#c23531', '#ccc'],
      backgroundColor: 'RGBA(250, 251, 252, 1.00)',
      grid: {
        show: false,
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
        splitLine: {
          show: false
        },
      },
      yAxis: {
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
    let className = classNames('comparator-prediction', {
      // 'comparator-prediction-hide': !this.props.isPredictionShow
    });
    let echartStyle = {
      height: '500px',
      width: '500px',
      position: 'absolute',
      top: 0,
      left: 0
    };
    return (
      <div ref='eChart' className={ className }>
        {/*<div className='comparator-prediction-header'>
          <span className='header'>走势预测</span>
          <i className="fa fa-chevron-right"
            aria-hidden="true"
            style={ { "top": "5px" } }
            onClick={ this.togglePredictionPanel.bind(this) }>
          </i>
        </div>
        <div className='comparator-prediction-panel'>
        </div>*/}
      </div>
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
