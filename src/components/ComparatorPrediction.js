import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
// import { layoutActions } from '../flux/actions';
// import echarts from 'echarts';
// import { predictionRandomData } from './utils/comparatorPredictionEchart';
import _ from 'underscore';
import { setComparatorPosition } from '../shared/actionTradingview';
import store from '../store';
import { handleShouCangFocus, handleShouCangBlur } from '../ksControllers/publicHelper';
import historyManager from '../backend/historyManager';
import favoritesManager from '../backend/favoritesManager';
import { favoritesController } from '../ksControllers/stockviewController';
import PredictionWidget from '../ksControllers/PredictionWidget';
import OCLHTooltip from '../ksControllers/OCLHTooltip';
import klinePredictionWidget from '../ksControllers/klinePredictionWidget';

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

let _isMouseDowned = false;
let _cursorY = 0;
let _mouseoverDate = null;
let _scale = 1;
let _y2diff = 0;

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
    this._predictionChart = null;
    this._tooltip = null;
  }

  componentDidMount() {
    this.initTooltip();
    this.initPredictionChart();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps){
    // console.info(nextProps);
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
      window._blockHeatMapChart && window._blockHeatMapChart.setData(that._predictionChart.getLastPrices(), yMin, yMax);
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

      let that = this;
      let { yMin, yMax } = this._predictionChart.getLineChartMinMax();
      window._updateHeatMap && window._updateHeatMap(yMax - yMin, yMax, yMin);
      window._blockHeatMapChart && window._blockHeatMapChart.setData(that._predictionChart.getLastPrices(), yMin, yMax);
    }
  }

  initTooltip() {
    this._tooltip = this._tooltip || new OCLHTooltip(this.refs.eChartPredictionLine);
    let that = this;
    this.refs.eChartPredictionLine.addEventListener('mousemove', (e) => {
      let x = e.pageX,
          y = e.pageY;
      let predictionChart = that._predictionChart;
      if(predictionChart) {
        if(predictionChart.isCursorOverBar()) {
          let OCLH = predictionChart.getHoverOCLH();
          that._tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3]);
          that._tooltip.setPosition(x,y,'fixed');
          that._tooltip.show();
          //触发下面的tooltip
          let index = predictionChart.getHoverIndex();
          klinePredictionWidget.triggerHover(index);
        } else {
          that._tooltip.hide();
          klinePredictionWidget.triggerHover(-1);
        }
      }

    });
    klinePredictionWidget.setOriginHoverHandle(this.triggerTooltipHover.bind(this));
  }

  triggerTooltipHover(index) {
    if(index < 0) {
      this._tooltip.hide();
      return;
    }
    let {x,y} = this._predictionChart.setHoverIndex(index);
    let OCLH = this._predictionChart.getHoverOCLH();
    this._tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3]);
    this._tooltip.setPosition(x,y);
    this._tooltip.show();
  }

  componentDidUpdate() {
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
