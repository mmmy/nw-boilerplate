import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import echarts from 'echarts';

const propTypes = {

};

const defaultProps = {

};

class ComparatorHeatmap extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.initEchart()

    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(){

  }

  shouldComponentUpdate(){
    return true;
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    window.onresize = setTimeout(window.heatmap.resize, 0);
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionHeatmap']);
    window.heatmap = echarts.init(dom);

    const priceScale = [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];

    const data = [
      //
      // [0, price_position(last data), number_of_lines_hits]
      //
      [0,3.5,4],
      [0,5,6],
      [0,7,3],
      [0,11,30],
      [0,9,12],
      [0,6.4,5],
      [0,8.2,10],
      [0,16,4]
    ];

    let option = {
      tooltip: {
        show: false,
        showContent: false
      },
      animation: false,
      grid: {
        height: '100%',
        // width: '10'
      },
      xAxis: {
        show: false,
        type: 'category',
        data: ['0']
      },
      yAxis: {
        show: false,
        type: 'category',
        data: priceScale
      },
      visualMap: {
        show: false,
        min: 1,
        max: 8,
        calculable: false,
        orient: 'vertical',
        left: 'center',
        bottom: '15%',
        // color: ['#CB0020', '#D72B44', '#E1586B', '#E9828E', '#F0AEB6'] // 从大到小排列
      },
      series: [{
        name: 'Punch Card',
        type: 'heatmap',
        data: data,
        label: {
          normal: {
            show: false
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 20,
            shadowColor: 'rgba(100, 110, 110, 1)'
          }
        }
      }],
      backgroundColor: '#F6DADD',

    };

    if (option && typeof option === "object") {
      var startTime = +new Date();
      window.heatmap.setOption(option, true);
      var endTime = +new Date();
      var updateTime = endTime - startTime;
      console.log("Time used:", updateTime);
    }
  }

  render(){
    let className = classNames('comparator-heatmap');

    return (
      <div className={ className } ref='eChartPredictionHeatmap'></div>
    );
  }
}

ComparatorHeatmap.propTypes = propTypes;
ComparatorHeatmap.defaultProps = defaultProps;

export default ComparatorHeatmap;
