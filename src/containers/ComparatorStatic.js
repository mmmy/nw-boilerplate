import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
// import ReactTradingView from '../components/ReactTradingView';
import HeatmapContainer from './HeatmapContainer';
import PredictionContainer from './PredictionContainer';
import ActivePatternInfoContainer from './ActivePatternInfoContainer';
import { layoutActions } from '../flux/actions';
import _ from 'underscore';
import { setStockViewSymbol } from '../shared/actionTradingview';
import store from '../store';
import klinePredictionWidget from '../ksControllers/klinePredictionWidget';
import searchResultController from '../ksControllers/searchResultController';
import { setStockViewVisibleRange } from '../shared/actionTradingview';

let _showRemainder = true;

let setActiveSymol = () => {
  let active = store.getState().active;
  let symbol = active && active.symbol;
  if(symbol) {
    setStockViewSymbol(symbol);
  }
};

let showStockView = () => {
  $(document.querySelector('.content-wrapper.favorites')).addClass('hide');
  $(document.querySelector('.content-wrapper.history')).addClass('hide');
  $(document.querySelector('.flat-btn.curve')).addClass('active');
  $(document.querySelector('.flat-btn.favorites')).removeClass('active');
  $(document.querySelector('.flat-btn.history')).removeClass('active');
};

const propTypes = {

};

const defaultProps = {

};

// function resizePrediction(context) {
//   try{
//     var timeScale = context.widget_comparator._innerWindow().Q5.getAll()[0].model().timeScale();
//     const info = $('#searching-info-content')[0].innerHTML;
//     let daysCount = parseInt(info);//parseInt(info.slice(0, info.indexOf('bars')));
//     var offset = 45;
//     var range = context.searchingRange;
//     var rangeStartIndex = range && (timeScale.timePointToIndex(range.from) + range.baseBars);
//     var lastDateIndex = rangeStartIndex || (timeScale.visibleBars().firstBar() + daysCount - 1); // for prediction DOM width
//     var pixel = timeScale.width() - timeScale.indexToCoordinate(lastDateIndex) + offset; //  50 => width by prediction dom margin
//     var wrapperWidth = context.eChart.getDom().parentNode.parentNode.parentNode.clientWidth;
//     pixel = ((pixel > (wrapperWidth - 130)) || (pixel < 50)) ? 300 : pixel;
//     context.eChart.getDom().parentNode.parentNode.style.width = pixel + 'px';
//     context.eChart.resize();
//     // context.actionsForIframe.updatePaneViews();  // align both TV and prediction
//     // window.actionsForIframe.recalculateHeatmap();
//   }catch(e){
//     console.error(e);
//   }
// }

// window._ksResizePrediction = resizePrediction;

class ComparatorStatic extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {};
	}

	componentDidMount() {
    klinePredictionWidget.init(this.refs.kline_prediction_widget);
    // this.handleResize = _.debounce(
    //   () => {
    //     try {
    //       window.widget_comparator && window.widget_comparator.setVisibleRange(window.searchingRange, '0');
    //       resizePrediction(window);
    //     } catch (e) {}
    //   },
    //   400);
    // window.addEventListener('resize', this.handleResize);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps, newState){
    // return newProps.stretchView === this.props.stretchView;
		return true;
	}

	componentWillUnmount(){
    // window.removeEventListener('resize', this.handleResize);
	}
  componentDidUpdate() {
    // console.info('ComparatorStatic did update in millsec: ', new Date() - this.d1);
  }

  goToSearchPage() {
    try {
      window.heap.track("click btn queren", {"hhah":5});
    }catch (e) {

    }
    let { dispatch } = this.props;
    let goAction = () => {
      // dispatch(layoutActions.toggleStockView()); //弃用了
      let active = store.getState().active;
      let metaData = active.metaData,
          startUnixTime = new Date(active.dateStart) / 1000,
          endUnixTime = new Date(active.dateEnd) / 1000;

      metaData && setStockViewVisibleRange(metaData.name, {from: startUnixTime, to: endUnixTime}); 
      searchResultController.triggerToggle();
      // setActiveSymol();
      showStockView();
    };

    if(_showRemainder) {
      let title = '将此图形作为原始研究对象?';
      let p = '选择"是"将返回首页, 当前结果将不被保存';
      let contentStr = `<h4 style='margin-top:70px'>${title}</h4><p style='margin-top:10px'>${p}</p><p style='margin-top:30px'><button class='confirm-btn'>是</button></p><div class='footer'><i class='fa fa-square-o' style="margin-right: 10px;"></i>不再提示</div>`;
      let modalStr = `<div class='modal-wrapper search-remainder' style='width:470px;height:250px'><div class='close-icon-container'><span class='close-btn'></span></div>${contentStr}</div>`;
      let nodeStr = `<div class='modal-overlay flex-center font-simsun'>${modalStr}</div>`;

      let $node = $(nodeStr);
      let closeBtn = $node.find('.close-btn'),
          confirmBtn = $node.find('.confirm-btn'),
          squareBtn = $node.find('.fa-square-o');

      closeBtn.click(() => {
        $node.remove();
      });

      confirmBtn.click(() => {
        $node.remove();
        goAction();
      });
      
      squareBtn.click(() => {
        _showRemainder = !_showRemainder;
        squareBtn.toggleClass('fa-square-o');
        squareBtn.toggleClass('fa-check-square-o');
      });

      $(document.body).append($node);
    } else {
      goAction();
    }
  }

	render() {
    // this.d1 = new Date();
    const {stretchView,
      isPredictionShow,
      logined } = this.props;

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': stretchView,
      'comparator-chart-static-hide': !stretchView,
    });

    const predictionMainClassName = classNames('prediction-main');

    const STOCK_VIEW = 'comparator-chart';
    /**
    let options = {
      symbol: 'OKCOIN.SZ',//'平安银行',
      interval: '5',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://localhost:8888"),
      datafeed: new window.Kfeeds.UDFCompatibleDatafeed("", 1000 * 1000, 2, 1),
      library_path: "charting_library/",
      locale: "zh",
      //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
      // disabled_features: ["use_localstorage_for_settings"],
      disabled_features: ["header_widget"],
      enabled_features: ["study_templates"],
      // charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: "1.1",
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      autosize: true,
      fullscreen: false,
      // overrides: {
      //     //"paneProperties.background": "#191919",
      //      //"paneProperties.vertGridProperties.color": "#191919",
      //      //"paneProperties.horzGridProperties.color": "#191919",
      //     //"symbolWatermarkProperties.transparency": 90,
      //     //"scalesProperties.textColor" : "#AAA",

      //     "mainSeriesProperties.candleStyle.upColor": "#fff",
      //     "mainSeriesProperties.candleStyle.downColor": "#fff",
      //     "mainSeriesProperties.candleStyle.drawWick": true,
      //     "mainSeriesProperties.candleStyle.drawBorder": true,
      //     "mainSeriesProperties.candleStyle.borderColor": "#378658",
      //     "mainSeriesProperties.candleStyle.borderUpColor": "#8E0000",
      //     "mainSeriesProperties.candleStyle.borderDownColor": "#6A6A6A",
      //     "mainSeriesProperties.candleStyle.wickUpColor": '#8E0000',
      //     "mainSeriesProperties.candleStyle.wickDownColor": '#6A6A6A',
      //     "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,

      // },
      disabled_features: ["left_toolbar","header_widget","border_around_the_chart",'control_bar','timeframes_toolbar', 'display_market_status', 'remove_library_container_border', 'chart_property_page_style'],
     overrides: {
            "paneProperties.background": "#fff",
            "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
            "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",
            "paneProperties.topMargin": 40,
            "paneProperties.bottomMargin": 20,
            "symbolWatermarkProperties.transparency": 10, //TODO,
            "symbolWatermarkProperties.color": '#fff',

            "scalesProperties.showRightScale" : false,
            "scalesProperties.textColor" : "#333",

            "mainSeriesProperties.showCountDown": true,
            "mainSeriesProperties.showLastValue": false,
            "mainSeriesProperties.showPriceLine": false,
            "mainSeriesProperties.visible": true,

            "mainSeriesProperties.candleStyle.upColor": '#AC1822',//"#fff",
            "mainSeriesProperties.candleStyle.downColor": "#fff",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#378658",
            "mainSeriesProperties.candleStyle.borderUpColor": '#8D151B',//"#c50017",
            "mainSeriesProperties.candleStyle.borderDownColor": '#000',//"#6A6A6A",
            "mainSeriesProperties.candleStyle.wickUpColor": '#8D151B',//'#c50017',
            "mainSeriesProperties.candleStyle.wickDownColor": '#000',//'#6A6A6A',
            "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            "scalesProperties.lineColor" : "rgba(0,0,0,0)",

            "mainSeriesProperties.hollowCandleStyle.upColor": "#888",
            "mainSeriesProperties.hollowCandleStyle.downColor": "#555",
            "mainSeriesProperties.hollowCandleStyle.drawWick": true,
            "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
            "mainSeriesProperties.hollowCandleStyle.borderColor": "#888",
            "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#888",
            "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#444",
            "mainSeriesProperties.hollowCandleStyle.wickUpColor": '#888',
            "mainSeriesProperties.hollowCandleStyle.wickDownColor": '#444',
            "mainSeriesProperties.hollowCandleStyle.barColorsOnPrevClose": false,
            "mainSeriesProperties.barStyle.upColor": "#6ba583",
        },
        ks_overrides: {
          // "ksSplitView": true,
          // ksBottomView: true,
          ksLeftView: true,
          volume: false,
          OHLCBarBorderColor: true,
          fixPaneLegend: true,
          lineToolTimeAxisView: {
            background: '#444',
            // activeBackground: 'green',
            color: '#fff',
            borderColor: '#444',
          },
          lineToolAxisRange: {
            background: 'rgba(190, 191, 192, 1.00)',
          }
        },
        debug: false,
      // height: 300,
      // width: 300,
    }
    **/
    const comparatorPredictionContainerClass = classNames('comparator-prediction-container',{
      'comparator-prediction-hide': !isPredictionShow
    });

    return (
      <div className={ comparatorChartClassName } id='__comparator_prediction_container'>
        <div className='pattern-tv-box-shadow'>
        </div>
        {/*<div className={ 'comparator-tv-wrapper' }>*/}
        {/*<ReactTradingView
            viewId={ STOCK_VIEW }
            init={ logined }
            options={ options } />*/}
        <div className='kline-prediction-widget-container' ref='kline_prediction_widget'>

        </div>

        <div className='start-btn-container'>
          <button data-kstooltip="切换到主K线视图" className='flat-btn' onClick={ this.goToSearchPage.bind(this) }></button>
        </div>
        {/*</div>*/}
        {/*<div className={'prediction-transparent-overlay top-left'}>
          <div className={'horizon-line'}></div>
          <div className={'linear-gradient-to-top-left'}></div>
        </div>
        <div className={'prediction-transparent-overlay bottom-left'}>
          <div className={'horizon-line'}></div>
          <div className={'linear-gradient-to-top-left'}></div>
        </div>
        <div className={'prediction-transparent-overlay bottom-right'}>
          <div className={'linear-gradient-to-top-right'}></div>
        </div>*/}

        <div className={'pattern-tv-box-shadow-top'}>
        </div>

        
        <div className={'pattern-tv-box-shadow-bottom'}>
          <ActivePatternInfoContainer/>
        </div>

        <div className={ comparatorPredictionContainerClass }>
          <PredictionContainer/>
        </div>

        <HeatmapContainer/>

        <div className='pattern-tv-split-line'>
        </div>

      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, account} = state;
	const {stockView, isPredictionShow} = layout;
  let logined = true;//account.username !== ''; //只有登陆后才能到这一步, 所以logined = true
	return {
		stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    logined,
	};
};
export default connect(stateToProps)(ComparatorStatic);
