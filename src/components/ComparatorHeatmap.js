import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import echarts from 'echarts';

let _yMax = 100;
let _yMin = -100;

const propTypes = {
  stretchView: PropTypes.bool,
  heatmapYAxis: PropTypes.number,
  scaleMinValue: PropTypes.number,
  scaleMaxValue: PropTypes.number,
  patterns: PropTypes.object.isRequired,
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
    window._updateHeatMap = this.updateHeatMap.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
  }

  shouldComponentUpdate(nextProps){
    return nextProps.stretchView === this.props.stretchView;
  }

  updateHeatMap(heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale=1){
    // console.debug('heatmap did update', heatmapYAxis, scaleMinValue, scaleMaxValue, manulScale);
    _yMin = scaleMinValue;
    _yMax = scaleMaxValue;

    let eachBlockValue = Math.round(Math.sqrt(heatmapYAxis)); // 根据振幅幅度划分每一个小格的容量
    let eachValueInPercentage = eachBlockValue / heatmapYAxis;
    let blocksNumber = Math.round(1 / eachValueInPercentage);
    let yAxisData = [];

    let height = window.heatmap.getHeight();
    let eachBlockHeight = height / blocksNumber;

    let min = 0;
    for (let i = 0; i < blocksNumber; i++) {
      yAxisData.push(Math.round(min) - 0.5 + ':' + (Math.round(min += eachBlockHeight)-0.5));
    }

    let linesOption = window.parent.eChart.getOption();
    let lastPrices = linesOption.series.slice(0, linesOption.series.length - 1).map((serie, idx) => {
      return serie.data[serie.data.length - 1][1];
    });
    lastPrices.sort((a, b) => {return a - b}); // sort numerically
    let bunch = lastPrices;

    let eChartSeriesData = [];

    for (let idx = 0; idx < yAxisData.length; idx++) {
      let range = yAxisData[idx].split(':');
      let count = 0;
      for (let i = 0; i < bunch.length; i++) {
        let value = bunch[i];
        let position = (value + Math.abs(scaleMinValue * manulScale)) / heatmapYAxis * height;

        if (position > range[0] && position <= range[1]) count = i + 1;
      }
      eChartSeriesData.push([0, idx, count])
      bunch = bunch.slice(count);
      count = 0;
    }
    let option = window.heatmap.getOption();
    option.yAxis[0].data = yAxisData;
    option.series[0].data = eChartSeriesData;

    setTimeout(() => { window.heatmap.setOption(option, true); });
  }

  componentDidUpdate() {
    let { heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale } = this.props;
    
    // this.updateHeatMap(heatmapYAxis, scaleMaxValue, scaleMinValue, manulScale);

    console.info('ComparatorHeatmap did update1', new Date() - this.d1);

    console.info('ComparatorHeatmap did update2', new Date() - this.d1);
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

    for (let i = 0; i < yAxis.length; i++) {
      eChartSeriesData.push([0, i, 0]);
    }

    let lastPrices = [];
    let percentage = 0;

    let series = window.eChart.getOption().series;
    for (let i = 0; i < series.length - 1; i++) {
      let serie = series[i];
      lastPrices.push(serie.data[serie.data.length - 1][1]);
    }

    let maxPrice = Math.max(...lastPrices);
    let minPrice = Math.min(...lastPrices);

    for (let i = 0; i < lastPrices.length; i++) {
      let price = lastPrices[i];
      for (var index = 0; index < eChartSeriesData.length; index++) {
        let item = eChartSeriesData[index];
        if (index + 1 < yAxis.length) {
          if (price >= yAxis[index] && price < yAxis[index + 1]) {
            eChartSeriesData[index][2] = eChartSeriesData[index][2] + 1;
          }
        }
      }
    }

    return eChartSeriesData;
  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionHeatmap']);
    window.heatmap = echarts.init(dom);
    let that = this;
    let $chartDom = $(this.refs.eChartPredictionHeatmap);
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
        borderWidth: 0,
        right: 57.5,
        left: 0.5
      },
      xAxis: {
        show: false,
        type: 'category',
        data: ['0']
      },
      yAxis: {
        show: true,
        type: 'category',
        data: priceScale,
        axisLine: {
          show: false,
        },
        splitNumber: 5,
        axisLabel: {
          formatter: function(params){
            // console.debug(arguments);
            if(!params) return;
            var points = params.split(':');
            var center = (parseFloat(points[0]) + parseFloat(points[1])) / 2;
            var percentage = (_yMax - _yMin) / $chartDom.height() * center + _yMin;
            return  percentage.toFixed(0) + '%';
          },
          textStyle: {
            color: '#656565',
            fontStyle: 'italic',
            fontWeight: 'lighter',
            fontSize: 10
          },
          margin: 16
        },
        axisTick: {
          show: false
        },
        position: 'right',
        // type: 'value',
        boundaryGap: [0, '100%'],
        // splitLine: {
        //   show: false
        // },
        // minInterval: 1,
      },
      visualMap: {
        show: false,
        min: 0,
        max: 100,
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
    this.d1 = new Date();
    let className = classNames('comparator-heatmap');

    return (
      <div className={ className } ref='eChartPredictionHeatmap'></div>
    );
  }
}

ComparatorHeatmap.propTypes = propTypes;
ComparatorHeatmap.defaultProps = defaultProps;

export default ComparatorHeatmap;
