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
    option.series[0].data = this.generateSeriesData(nextProps.heatmapYAxis);
    option.yAxis[0].data = nextProps.heatmapYAxis;

    let maxData = 5;

    option.series[0].data.forEach(d => {
      if (d[2] > maxData) maxData = d[2];
    });

    // option.visualMap[0].max = maxData - 1;

    window.heatmap.setOption(option);
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

  generateSeriesData(newYAxis) {
    this.initDimensions();
    let eChartSeriesData = [[0, -1, 0]];
    // let yAxis = newYAxis.map((y) => {
    //   return y + (newYAxis[1] - newYAxis[0]);
    // });
    let yAxis = newYAxis;
    yAxis.unshift(yAxis[0] + yAxis[0] - yAxis[1]);
    // yAxis.push(yAxis[yAxis.length - 1] * 2 - yAxis[yAxis.length - 2])

    yAxis.forEach((e, i) => {
      // eChartSeriesData.push([0,i - yAxis.length/2 + 1, 0]);
      eChartSeriesData.push([0, i, 1]);
    });

    let lastPrices = [];
    let percentage = 0;
    this.symbolDim.top(Infinity).forEach((e, i) => {
      if (i === 0) percentage = this.props.lastClosePrice / e.kLine[0][2];
      let price = Math.round(e.kLine[e.kLine.length - 1][2] * percentage * 1E2) / 1E2;
      lastPrices.push(price);
    });

    let maxPrice = Math.max(...lastPrices);
    let minPrice = Math.min(...lastPrices);

    lastPrices.forEach((price) => {
      eChartSeriesData.forEach((item, index) => {
        if (index + 1 < yAxis.length) {
          if (price >= yAxis[index] && price < yAxis[index + 1]) {
            eChartSeriesData[index][2] = eChartSeriesData[index][2] + 1;
          }
        } else {

        }
      });
    });

    return eChartSeriesData;
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionHeatmap']);
    window.heatmap = echarts.init(dom);

    // const priceScale = [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
    const priceScale = this.props.heatmapYAxis;
    const data = [];
    let option = {
      tooltip: {
        show: true,
        showContent: true
      },
      animation: false,
      grid: {
        height: '100%',
        y: 0,
        borderColor: '#000',
        borderWidth: 5
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
        max: 15,
        calculable: false,
        orient: 'vertical',
        left: 'center',
        bottom: '15%',
        // color: ['#982C2F', '#C23433', '#E42329', '#F63A3B'] // 从大到小排列
        color: ['#982C2F', '#C23433', '#E42329', '#F63A3B', '#C6C7C8'] // 从大到小排列

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
      // backgroundColor: '#C6C7C8',
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
