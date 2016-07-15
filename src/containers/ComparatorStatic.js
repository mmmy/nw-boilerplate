import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import HeatmapContainer from './heatmapContainer';
import PredictionContainer from './PredictionContainer';
import ActivePatternInfoContainer from './ActivePatternInfoContainer';
import { layoutActions } from '../flux/actions';
import _ from 'underscore';

const propTypes = {

};

const defaultProps = {

};

function resizePrediction(context) {
  try{
    var timeScale = context.widget_comparator._innerWindow().Q5.getAll()[0].model().timeScale();
    const info = $('#searching-info-content')[0].innerHTML;
    let daysCount = parseInt(info.slice(0, info.indexOf('bars')));
    var offset = 45;
    var range = context.searchingRange;
    var rangeStartIndex = range && (timeScale.timePointToIndex(range.from) + range.baseBars);
    var lastDateIndex = rangeStartIndex || (timeScale.visibleBars().firstBar() + daysCount - 1); // for prediction DOM width
    var pixel = timeScale.width() - timeScale.indexToCoordinate(lastDateIndex) + offset; //  50 => width by prediction dom margin
    var wrapperWidth = context.eChart.getDom().parentNode.parentNode.parentNode.clientWidth;
    pixel = ((pixel > (wrapperWidth - 130)) || (pixel < 50)) ? 300 : pixel;
    context.eChart.getDom().parentNode.parentNode.style.width = pixel + 'px';
    context.eChart.resize();
    // context.actionsForIframe.updatePaneViews();  // align both TV and prediction
    // window.actionsForIframe.recalculateHeatmap();
  }catch(e){
    console.error(e);
  }
}

window._ksResizePrediction = resizePrediction;

class ComparatorStatic extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {};
	}

	componentDidMount() {
    this.handleResize = _.debounce(
      () => {
        try {
          window.widget_comparator && window.widget_comparator.setVisibleRange(window.searchingRange, '0');
          resizePrediction(window);
        } catch (e) {}
      },
      400);
    window.addEventListener('resize', this.handleResize);
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps, newState){
    // return newProps.stretchView === this.props.stretchView;
		return true;
	}

	componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
	}
  componentDidUpdate() {
    console.info('ComparatorStatic did update in millsec: ', new Date() - this.d1);
  }

	render() {
    this.d1 = new Date();
    const {stretchView,
      isPredictionShow,
      logined } = this.props;

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': stretchView,
      'comparator-chart-static-hide': !stretchView,
    });

    const predictionMainClassName = classNames('prediction-main');

    const STOCK_VIEW = 'comparator-chart';

    let options = {
      symbol: '300336.SZ',
      interval: 'D',
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
      charts_storage_url: 'http://saveload.tradingview.com',
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
      disabled_features: ["header_widget","border_around_the_chart",'control_bar','timeframes_toolbar', 'display_market_status', 'remove_library_container_border', 'chart_property_page_style'],
     overrides: {
            "paneProperties.background": "#fff",
            "paneProperties.vertGridProperties.color": "#fff",
            "paneProperties.horzGridProperties.color": "#fff",
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

            "mainSeriesProperties.candleStyle.upColor": "#fff",
            "mainSeriesProperties.candleStyle.downColor": "#fff",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#378658",
            "mainSeriesProperties.candleStyle.borderUpColor": "#c50017",
            "mainSeriesProperties.candleStyle.borderDownColor": "#6A6A6A",
            "mainSeriesProperties.candleStyle.wickUpColor": '#c50017',
            "mainSeriesProperties.candleStyle.wickDownColor": '#6A6A6A',
            "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            "scalesProperties.lineColor" : "transparent",

            "mainSeriesProperties.barStyle.upColor": "#6ba583",
        },
        ks_overrides: {
          "ksSplitView": true,
          volume: true,
          OHLCBarBorderColor: true,
          lineToolTimeAxisView: {
            background: '#656667',
            // activeBackground: 'green',
            color: '#fff',
            borderColor: '#b61c15',
          },
          lineToolAxisRange: {
            background: 'rgba(190, 191, 192, 1.00)',
          }
        },
        // debug: true
      // height: 300,
      // width: 300,
    }

    const comparatorPredictionContainerClass = classNames('comparator-prediction-container',{
      'comparator-prediction-hide': !isPredictionShow
    });

    return (
      <div className={ comparatorChartClassName } id='__comparator_prediction_container'>
        {/*<div className={ 'comparator-tv-wrapper' }>*/}
          <ReactTradingView
            viewId={ STOCK_VIEW }
            init={ logined }
            options={ options } />
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

      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, account} = state;
	const {stockView, isPredictionShow} = layout;
  let logined = account.username !== '';
	return {
		stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    logined,
	};
};
export default connect(stateToProps)(ComparatorStatic);
