import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { layoutActions } from '../flux/actions';
import echarts from 'echarts';
import { predictionRandomData } from './utils/comparatorPredictionEchart';
import _ from 'underscore';
import { setComparatorPosition } from '../shared/actionTradingview';
import store from '../store';
import { handleShouCangFocus, handleShouCangBlur } from '../ksControllers/publicHelper';
import historyManager from '../backend/historyManager';
import favoritesManager from '../backend/favoritesManager';
import { favoritesController } from '../ksControllers/stockviewController';
import PredictionWidget from '../ksControllers/PredictionWidget';

let createEmptyKline = (len) => {
  let data = [];
  for (let i=0; i<len; i++) {
    data.push([undefined, undefined, undefined, undefined]);
  }
  return data;
};

let createEmptyLine = (xArr) => {
  return xArr.map((x) => {
    return [x+'', undefined];
  });
};

let _getActivePatternStartUnixTime = () => {
  let state = store.getState();
  let id = state.active.id;
  let begin = state.patterns.rawData[id].begin;
  return new Date(begin) / 1000;
};

function splitData(rawData, predictionBars) {
    predictionBars += 1;
    var categoryData = [];
    var values = [];

    var lowArr = [], highArr = [];

    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
        lowArr.push(isNaN(+rawData[i][3]) ? Infinity : +rawData[i][3]);
        highArr.push(isNaN(+rawData[i][4]) ? -Infinity : +rawData[i][4]);
    }

    for (var i=0; i<predictionBars; i++) {
      categoryData.push(i+'');
      // values.push([undefined,undefined,undefined,undefined]);
    }
    //console.log(highArr);
    var min = Math.floor(Math.min.apply(null, lowArr));
    var max = Math.ceil(Math.max.apply(null, highArr));

    // var arange10 = [];
    // for (var i=0; i < 15; i++) {
    //  arange10.push([categoryData[baseBars], min + (max - min) / 15 * i]);
    // }

    // var areaData = categoryData.slice(baseBars).map((e) => {
    //  return [e, max];
    // });

    return {
        categoryData: categoryData,
        values: values,
        // lineData: arange10,
        // areaData: areaData,
        yMin: min,
        yMax: max,
    };
}

let _isMouseDowned = false;
let _cursorY = 0;
let _mouseoverDate = null;
let _scale = 1;
let _y2diff = 0;

let _echartMouseEvent = (echart, event) => {
  switch(event.type) {
    case 'mousedown':
      _isMouseDowned = true;
      echart.getDom().firstChild.style.cursor = 'ns-resize';
      _cursorY = event.y;
      _mouseoverDate = new Date();
      break;

    case 'mousemove':
      try{
        if(_isMouseDowned){
          // if((new Date() - _mouseoverDate) < 100) return;
          let predictionState = window.store.getState().prediction;
          let chartDom = echart.getDom();
          let domHeight = $(chartDom).height();
          // let option = echart.getOption();
          chartDom.firstChild.style.cursor = 'ns-resize';
          let cursorY = event.y;
          let offset = (cursorY - _cursorY);
          // offset *= 0.6;
          _cursorY = cursorY;
          // let rate = option.yAxis[1].min / option.yAxis[1].max;
          // option.yAxis[1].max += offset;
          // option.yAxis[1].min = option.yAxis[1].max * rate;
          // let manulScale = option.yAxis[1].max / predictionState.scaleMaxValue;
          // predictionState.manulScale = manulScale;

          let d1 = new Date();
          _scale /= (domHeight + offset * 2)/domHeight;
          if(_scale > 4) {
            _scale = 4;
            return;
          }
          if(_scale < 0.1) {
            _scale = 0.1;
            return;
          }
          // $(chartDom).css('transform',`scaleY(${_scale})`);
          echart.ksDorender(_scale);

          // echart.setOption(option,false,false);
          console.debug(new Date() - d1);
          let y2diff = _y2diff / _scale;
          // y2diff /= _scale;
          setTimeout(() => {
            window._updateHeatMap && window._updateHeatMap(y2diff * 2, y2diff, -y2diff);
          });
          // window.store.dispatch({type: 'SET_HEATMAP_YAXIS', heatmapYAxis: option.yAxis[1].max + Math.abs(option.yAxis[1].min)});
          _mouseoverDate = new Date();
        }
      }catch(e){
        console.error(e);
      }
      break;

    case 'mouseup':
      _isMouseDowned = false;
      echart.getDom().firstChild.style.cursor = 'default';
      break;
    default:
      break;
  }
};

const propTypes = {
  patterns: PropTypes.object.isRequired,
  stretchView: PropTypes.object.bool,
  filter: PropTypes.object.object
};

const defaultProps = {

};

class ComparatorPrediction extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this._predictionChart;
  }

  componentDidMount() {
    // this.initEchart(); //弃用
    this.initPredictionChart();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps){
    console.info(nextProps);
  }

  shouldComponentUpdate(nextProps){
    return nextProps.stretchView === this.props.stretchView;
  }

  initPredictionChart() {
    let drawOption = {
      showRange: true
    };
    this._predictionChart = new PredictionWidget(this.refs.eChartPredictionLine, drawOption);
    window._predictionChart = this._predictionChart;
    let that = this;
    this._predictionChart.onHoverKline((index, data) => { 
      that.setOHLC.call(that, data);
      var unixTime = _getActivePatternStartUnixTime();
      setComparatorPosition(unixTime, index, 0);
      console.log('hover kline index');
    });
    this._predictionChart.onScaleLines((yMin, yMax) => {
      window._updateHeatMap && window._updateHeatMap(yMax - yMin, yMax, yMin);
    });
  }
  predictionChartSetData() {
    var isInit = this.initDimensions();
    if(isInit || this.props.stretchView) {
      let { closePrice, searchMetaData, searchConfig } = this.props.patterns;
      let rawData = this.symbolDim.top(Infinity);
      let filteredIds = rawData.map((pattern) => {
        return pattern.id;
      });
      this._predictionChart.setData(searchMetaData && searchMetaData.kline, closePrice);
      this._predictionChart.filterLines(filteredIds);

      let { yMin, yMax } = this._predictionChart.getLineChartMinMax();
      window._updateHeatMap && window._updateHeatMap(yMax - yMin, yMax, yMin);
    }
  }
  //弃用
  udpateEcharts() {
    var isInit = this.initDimensions();
    if( isInit || this.props.stretchView) {
      var that = this;
      setTimeout(() => {
        let { searchMetaData, searchConfig } = that.props.patterns;
        let searchInfo = '';
        if(searchMetaData){
          let days = (new Date(searchMetaData.dateRange[1]) - new Date(searchMetaData.dateRange[0])) / 1000 / 3600 / 24;
          days = Math.round(days) + 1;
          searchInfo = `${searchMetaData.bars}根K线, ${days}日`;
        }
        let option = window.eChart.getOption();
        option.ksOverrides.rangeTitle = searchInfo;
        let { series, categoryData, min, max } = that.generateKlineSeries();
        option.series = that.generateSeriesDataFromClosePrice(categoryData, searchMetaData && searchMetaData.kline.length).concat(series);
        let y2diff = Math.max(that.maxValue, -that.minValue);
        _y2diff = y2diff;
        option.xAxis[0].data = categoryData;
        option.xAxis[1].data = categoryData.concat([]);
        option.yAxis[0].min = min;
        option.yAxis[0].max = max;
        option.yAxis[1].min = -y2diff;
        option.yAxis[1].max = y2diff;

        option.xAxis[1].boundaryGap = false;
        // let klineLen = option.series[0].data.length;
        // let predictionLen = option.series[1] && option.series[1].data.length || 0;
        // option.grid[0].right = -100 / (klineLen + predictionLen) / 2 * 1.05 + '%';
        // let d1 = new Date();
        //setTimeout(() => { 
        window.eChart.setOption(option, true); 
        //});
        // console.info('window.eChart.setOption in', new Date() - d1);
        // console.info('ComparatorPrediction did update in millsec: ', new Date() - that.d1);
        window._updateHeatMap && window._updateHeatMap(y2diff * 2, y2diff, -y2diff);
      }, isInit ? 3000 : 0);
    }
  }

  componentDidUpdate() {
    // this.udpateEcharts();
    this.predictionChartSetData();
  }


  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    // window.eChart.resize();
    this._predictionChart.resize();
  }

  initDimensions() {
		let { crossFilter } = this.props.patterns;
		if(this.oldCrossFilter !== crossFilter) {
			this.symbolDim = crossFilter.dimension(function(d){ return d.symbol });
			this.oldCrossFilter = crossFilter;
      return true;
		}
    return false;
    // this.xAxisData = [];
    //
    // if (this.symbolDim.top(Infinity).length !== 0)
    //   for(let i = 0; i < this.symbolDim.top(1)[0].kLine.length; i++) { this.xAxisData.push(i); }
	}

  splitDataFromClosePrice(line) {
    let data = [];
    const firstPrice = line[0];
    const pushData = (num, i) => {
      data.push([i+'', (num - firstPrice) / firstPrice * 100 ]);
    };

    for (let i=0; i < line.length; i++) {
      pushData(line[i], i);
    }

    return data;
  }

  generateSeriesDataFromClosePrice(categoryData, baseBars) {
    baseBars = baseBars || categoryData.indexOf('0');
    let blankLine = createEmptyLine(categoryData.slice(0, baseBars));
    let rawData = this.symbolDim.top(Infinity);
    let { closePrice } = this.props.patterns;
    let series = [];
    let maxValue = this.maxValue;
    let minValue = this.minValue;

    if (rawData.length > 0) {
      const pushData = (data) => {
        series.push({
          data: blankLine.concat(this.splitDataFromClosePrice(closePrice[data.id])),
          name: data.id,
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          z: 0,
          zLevel: 0,
          slient: true,
          showSymbol: false,
          symbolSize: 0,
          smooth: false,
          hoverAnimation: false,
          lineStyle: {
            normal: {
              color: (data.id==0) ? '#862020' : 'rgba(200, 200, 200, 0.5)',
              width: 1
            }
          },
          itemStyle: {
            normal: {
              color: 'green',
              borderColor: 'green'
            }
          },
          z: (data.id==0) ? 1 : -1
        });
      };

      maxValue = -Infinity;
      minValue = Infinity;
      for (let i=0; i < rawData.length; i++) {
        pushData(rawData[i]);
      }

      // find max min values for scale
      const maxMinValue = (num) => {
        maxValue = Math.max(num, maxValue);
        minValue = Math.min(num, minValue);
      };
      for (let i=0; i < series.length; i++) {
        for (let j=0; j < series[i].data.length; j++) {
          if(series[i].data[j][1] !== undefined) maxMinValue(series[i].data[j][1]);
        }
      }
      this.maxValue = maxValue;
      this.minValue = minValue;
    }

    window.eChartMaxValue = this.maxValue;
    window.eChartMinValue = this.minValue;
    let scaleMax = Math.max(Math.abs(this.maxValue), Math.abs(this.minValue));
    window.eChartScale = scaleMax; // scale top/bottom margin

    return series;
  }

  generateKlineSeries () {
    let { closePrice, searchMetaData, searchConfig } = this.props.patterns;
    let predictionLen = searchConfig && searchConfig.additionDate && searchConfig.additionDate.value || 0;
    predictionLen = parseInt(predictionLen);
    let blankKline = createEmptyKline(predictionLen);

    let series = [],
        categoryData = [],
        min,
        max;
    if(searchMetaData) {
      let data0 = splitData(searchMetaData.kline, (searchConfig && searchConfig.additionDate.value) || (closePrice[0] && closePrice[0].length));
      var lastClosePrice = data0.values[data0.values.length-1][1];
      var offset = Math.max(data0.yMax - lastClosePrice, lastClosePrice - data0.yMin);
      
      offset *= 1.2;
      categoryData = data0.categoryData;

      min = lastClosePrice - offset;
      max = lastClosePrice + offset;
      series = [{
          name: 'kline',
          type: 'candlestick',
          candleOverrides: {
            minWidth: 1,
            minNiceWidth: 7,
            minGap: 1,
          },
          z: 10,
          zLevel: 1,
          itemStyle: {
            normal: {
              borderWidth: true ? '1' : '0',
              color: true ? '#AC1822' : '#aE0000',
              color0: true ? 'rgba(0,0,0,0)' : '#5A5A5A',
              borderColor: '#8D151B',
              borderColor0: '#000',
            },
            emphasis: {
              borderWidth: '1'
            }
          },
          data: data0.values.concat(blankKline),
      }];
    }

    return {
      series,
      categoryData,
      min,
      max,
    };

  }

  initEchart() {
    const dom = ReactDOM.findDOMNode(this.refs['eChartPredictionLine']);
    let that = this;
    window.eChart = echarts.init(dom);
    let option = {
       ksOverrides: {
        drawKlineRange: true,
        rangeTitle: '',
        rangeBackground: '#AC1822',
        rangeFont: '12px sans-serif',
        rangeColor: '#fff',
        rangeLineColor: '#eee'
      },
      title: {
        show: false,
      },
      animation: false,
      animationDuration: 0,
      // color: ['#ccc', '#c23531', '#ccc'],
      color: ['#ccc'],
      // backgroundColor: 'RGBA(250, 251, 252, 1.00)',
      backgroundColor: '#FFFFFF',
      grid: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      tooltip: {
        show: false,
        showContent: true,
        trigger: 'axis',
        backgroundColor:'rgba(0,0,0,0)',
        textStyle:{
            color:'rgba(0,0,0,0)'
        },
        formatter: function (params) {
          params = params[params.length-1];
          console.log(params);
          that.setOHLC.bind(that)(params.data);
          var offset = params.dataIndex;
          var unixTime = _getActivePatternStartUnixTime();
          setComparatorPosition(unixTime, offset, 0);
          var date = new Date(params.name);
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        },
        axisPointer: {
          animation: false,
          lineStyle: {
            color: '#aaa',
            width: 1,
            type:'dashed',
            opacity: 1
          }
        }
      },
      xAxis: [{
        type: 'category',
        show: false,
        splitLine: {
          show: false
        },
        z: 1,
        zLevel: 1
        // data: this.xAxisData
      },{
        type: 'category',
        show: false,
        splitLine: {
          show: false
        },
        z: 0,
        slient: true
        // data: this.xAxisData
      }],
      yAxis: [{
            scale: true,
            axisLine: {
              show: false
            },
            splitLine:{
              show: false
            },
            axisLabel:{
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
                show: false
            },
        },{
        show: true,
        axisLine: {
          show: false,
        },
        // splitNumber: 5,
        axisLabel: {
          formatter: '',
          textStyle: {
            color: '#656565',
            fontStyle: 'italic',
            fontWeight: 'lighter',
            fontSize: 10
          },
          // margin: 10
        },
        axisTick: {
          show: false
        },
        position: 'right',
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        },
        minInterval: 1,
        // splitNumber: 6,
      }],
      series: []
      // series: predictionRandomData()
    };

    if (option && typeof option === "object") {
      var startTime = +new Date();
      window.eChart.setOption(option, true);
      var endTime = +new Date();
      var updateTime = endTime - startTime;
      console.log("Time used:", updateTime);
    }
    dom.addEventListener('mousedown', _echartMouseEvent.bind(null, window.eChart));
    dom.addEventListener('mousemove', _echartMouseEvent.bind(null, window.eChart));
    dom.addEventListener('mouseup', _echartMouseEvent.bind(null, window.eChart));
  }

  setOHLC(data){
    if(!data || data.length < 4 || data[0]===undefined || data[1] ===undefined || data[2]===undefined || data[3] ===undefined) return;
    data = data.slice(data.length-4, data.length);
    let O = data && data[0].toFixed(2) || 'N/A';
    let C = data && data[1].toFixed(2) || 'N/A';
    let L = data && data[2].toFixed(2) || 'N/A';
    let H = data && data[3].toFixed(2) || 'N/A';
    this.refs.info_O.innerHTML = `O ${O}`;
    this.refs.info_C.innerHTML = `C ${C}`;
    this.refs.info_L.innerHTML = `L ${L}`;
    this.refs.info_H.innerHTML = `H ${H}`;
    if(C > O) {
      this.refs.info_O.style.color = '#ae0006';
      this.refs.info_C.style.color = '#ae0006';
      this.refs.info_L.style.color = '#ae0006';
      this.refs.info_H.style.color = '#ae0006';
    } else {
      this.refs.info_O.style.color = '';
      this.refs.info_C.style.color = '';
      this.refs.info_L.style.color = '';
      this.refs.info_H.style.color = '';
    }
  }

  showFavoritesMenu(e) {
    if(e.target.children.length>0 || e.target.nodeName=='INPUT') {
      return;
    }
    let latestHistory = historyManager.getLatestData();
    handleShouCangFocus(favoritesManager, favoritesController, latestHistory, {type: 1}, e);
  }

  removeFavoritesMenu(e) {
    handleShouCangBlur(e);
  }

  render(){
    // this.d1 = new Date();
    let className = classNames('comparator-prediction-chart');

    return (<div style={{position:'absolute',height:'100%',width:'100%'}}>
      <div className='comparator-info-container'>
        <span ref='info_title' className='title font-simsun'>匹配图形</span><i ref='info_O'>O</i><i ref='info_H'>H</i><i ref='info_L'>L</i><i ref='info_C'>C</i>
        <button className='flat-btn add-btn' onFocus={ this.showFavoritesMenu.bind(this) } onBlur={ this.removeFavoritesMenu.bind(this) }>add</button>
      </div>
      <div ref='eChartPredictionLine' className={ className }></div>
    </div>);
  }
}

ComparatorPrediction.propTypes = propTypes;
ComparatorPrediction.defaultProps = defaultProps;

export default ComparatorPrediction;
