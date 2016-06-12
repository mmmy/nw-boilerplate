import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import echarts from 'echarts';

const propTypes = {
  patterns: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  // heatmapYAxis: PropTypes.array.isRequired,
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
    let { heatmapYAxis, scaleMaxValue, scaleMinValue } = nextProps;

    let range = 15;
    let partCount = heatmapYAxis / range;
    let eachBlockHeight = heatmapYAxis / partCount;
    let yAxisData = [];
    // let min = heatmapYAxis / 2 * -1;
    let min = scaleMinValue;

    for (let i = 0; i < partCount; i++) {
      // yAxisData.push(min = min + eachBlockHeight);
      yAxisData.push(Math.ceil(min) + ':' + Math.ceil(Math.min((min + eachBlockHeight), scaleMaxValue)));
      min += eachBlockHeight;
    }

    let rawData = window.parent.eChart.getOption().series.map((serie, idx) => {
      return serie.data[serie.data.length - 1];
    });

    rawData.sort((a, b) => {return a - b}); // sort numerically
    let bunch = rawData;

    let eChartSeriesData = [];

    yAxisData.forEach((value, idx) => {
      let count = 0;
      range = value.split(':');
      for (let i = 0; i < bunch.length; i++) {
        // if (i > 0) {
        //   if (bunch[i] < value && bunch[i] > yAxisData[idx - 1]) {
        //     count = i + 1;
        //   }
        //   else {
        //     break;
        //   }
        // } else {
        //   if (bunch[i] < value) {
        //     count = i + 1;
        //   } else {
        //     break
        //   }
        // }
        if (bunch[i] >= range[0] && bunch[i] <= range[1]) count = i + 1;
      }
      eChartSeriesData.push([0, idx, count])
      bunch = bunch.slice(count);
      count = 0;
    });

    // let option = window.heatmap.getOption();
    // option.yAxis[0].data = yAxisData;
    // option.series[0].data = eChartSeriesData;
    // window.parent.heatmapOption = option;
    // window.parent.heatmap.setOption(window.parent.heatmapOption, true);


    window.heatmap.setOption({
      yAxis: {
        data: yAxisData
      },
      series: [{
        data: eChartSeriesData
      }]
    });
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
      this.symbolDim = crossFilter.dimension((d) => { return d.symbol });
      this.oldCrossFilter = crossFilter;
    }
  }

  generateSeriesData(newYAxis) {
    this.initDimensions();
    let eChartSeriesData = [];
    let yAxis = newYAxis;

    yAxis.unshift(yAxis[0] + yAxis[0] - yAxis[1]);

    yAxis.forEach((e, i) => {
      eChartSeriesData.push([0, i, 0]);
    });

    let lastPrices = [];
    let percentage = 0;

    window.eChart.getOption().series.forEach((serie) => {
      lastPrices.push(serie.data[serie.data.length - 1]);
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
        y: 0,
        borderColor: '#000',
        borderWidth: 0
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
        min: 0,
        max: 80,
        calculable: false,
        orient: 'vertical',
        left: 'center',
        bottom: '15%',
        // color: ['#982C2F', '#C23433', '#E42329', '#F63A3B'] // 从大到小排列
        color: ['#831211', '#A40A07', '#B70A05', '#D90A03', '#FC0900', '#C6C7C8'] // 从大到小排列

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
          normal: {
            borderColor: '#C6C7C8',
            borderWidth: 1
          }
        }
      }],
      // backgroundColor: '#C6C7C8',
    };

    if (option && typeof option === "object") {
      let startTime = +new Date();
      window.heatmap.setOption(option, true);
      let endTime = +new Date();
      let updateTime = endTime - startTime;
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
