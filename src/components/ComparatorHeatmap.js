import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import echarts from 'echarts';

const propTypes = {
  patterns: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  heatmapYAxis: PropTypes.array.isRequired,
  lastClosePrice: PropTypes.number.isRequired
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

  componentWillReceiveProps(nextProps) {
    let option = window.heatmap.getOption();
    option.series[0].data = this.generateSeriesData();
    option.yAxis[0].data = nextProps.heatmapYAxis;
    window.heatmap.setOption(option, true);
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

  initDimensions() {
    let { crossFilter } = this.props.patterns;
    if(this.oldCrossFilter !== crossFilter) {
      this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
      this.oldCrossFilter = crossFilter;
    }
  }

  generateSeriesData() {
    this.initDimensions();
    let eChartSeriesData = [];
    let yAxis = this.props.heatmapYAxis;

    yAxis.forEach((e, i) => {
      eChartSeriesData.push([0,i - yAxis.length/2 + 1, 0]);
    });

    let lastPrices = [];
    let percentage = 0;
    this.symbolDim.top(Infinity).forEach((e, i) => {
      if (i === 0) percentage = this.props.lastClosePrice / e.kLine[0][2];
      lastPrices.push(e.kLine[e.kLine.length - 1][2] * percentage);
    });

    lastPrices.forEach((price, priceIndex) => {
      yAxis.forEach((y, yIndex) => {
        if (price >= y && price < yAxis[yIndex + 1]) {
          eChartSeriesData[yIndex][2] = eChartSeriesData[yIndex][2] + 1;
        }
      });
    });

    return eChartSeriesData;
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionHeatmap']);
    window.heatmap = echarts.init(dom);

    // const priceScale = [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
    const priceScale = [];
    const data = [];
    let option = {
      tooltip: {
        show: false,
        showContent: false
      },
      animation: false,
      grid: {
        height: '100%',
        y: '-10px'
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
        max: 30,
        calculable: false,
        orient: 'vertical',
        left: 'center',
        bottom: '15%',
        color: ['#982C2F', '#C23433', '#E42329', '#F63A3B'] // 从大到小排列
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
      backgroundColor: '#C6C7C8',

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
