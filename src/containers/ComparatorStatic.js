import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import ComparatorPrediction from '../components/ComparatorPrediction';
import ComparatorHeatmap from '../components/ComparatorHeatmap';
import { layoutActions } from '../flux/actions';
const propTypes = {

};

const defaultProps = {

};

class ComparatorStatic extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {};
	}

	componentDidMount() {
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps, newState){
    // return newProps.stretchView === this.props.stretchView;
		return true;
    // return newProps.filter === this.props.filter;
	}

	componentWillUnmount(){

	}
  componentDidUpdate() {
    console.info('ComparatorStatic did update in millsec: ', new Date() - this.d1);
  }

  isChartPriceAutoScale() {
    let chart = window.widget_comparator._innerWindow().Q5.getAll()[0];
    let model = chart.model();
    let priceScale = model.mainSeries().priceScale();

    return priceScale.properties().autoScale.value()
  }

  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());

    if (this.props.isPredictionShow === false) {
      window.widget_comparator.setVisibleRange(window.searchingRange, '0');
    }
  }

	render() {
    this.d1 = new Date();
    const { patterns,
      stretchView,
      filter,
      isPredictionShow,
      lastClosePrice,
      heatmapYAxis,
      scaleMinValue,
      scaleMaxValue,
      dispatch,
      activeId,
      logined } = this.props;

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': stretchView,
      'comparator-chart-static-hide': !stretchView,
    });

    const predictionMainClassName = classNames('prediction-main');

    const STOCK_VIEW = 'comparator-chart';

    let options = {
      symbol: '000003.SZ',
      interval: 'D',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      // datafeed: new Datafeeds.UDFCompatibleDatafeed("http://localhost:8888"),
      datafeed: new window.Kfeeds.UDFCompatibleDatafeed(""),
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
            "symbolWatermarkProperties.transparency": 10, //TODO,
            "symbolWatermarkProperties.color": '#fff',
            "scalesProperties.textColor" : "#333",

            "mainSeriesProperties.showCountDown": true,
            "mainSeriesProperties.showLastValue": true,
            "mainSeriesProperties.showPriceLine": true,
            "mainSeriesProperties.visible": true,

            "mainSeriesProperties.candleStyle.upColor": "#fff",
            "mainSeriesProperties.candleStyle.downColor": "#fff",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#378658",
            "mainSeriesProperties.candleStyle.borderUpColor": "#8E0000",
            "mainSeriesProperties.candleStyle.borderDownColor": "#6A6A6A",
            "mainSeriesProperties.candleStyle.wickUpColor": '#8E0000',
            "mainSeriesProperties.candleStyle.wickDownColor": '#6A6A6A',
            "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
            "scalesProperties.lineColor" : "transparent",

            "mainSeriesProperties.barStyle.upColor": "#6ba583",
        },
        ks_overrides: {
          "ksSplitView": true,
          volume: true,
          OHLCBarBorderColor: true,
        },
        debug: true
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
        <div className={'prediction-transparent-overlay top-left'}>
          <div className={'horizon-line'}></div>
          <div className={'linear-gradient-to-top-left'}></div>
        </div>
        <div className={'prediction-transparent-overlay bottom-left'}>
          <div className={'horizon-line'}></div>
          <div className={'linear-gradient-to-top-left'}></div>
        </div>
        <div className={'prediction-transparent-overlay bottom-right'}>
          <div className={'linear-gradient-to-top-right'}></div>
        </div>

        <div className={'pattern-tv-box-shadow'}></div>

        <div className={ comparatorPredictionContainerClass }>
          <div className={ predictionMainClassName }>
            <div className={ 'comparator-header' }>
              <span>走势分布</span>
            </div>
            <ComparatorPrediction
              stretchView={ stretchView }
              dispatch={ dispatch }
              filter={ filter }
              patterns={ patterns }
              activeId={ activeId }/>
          </div>
        </div>

        <div className={'prediction-panel'}>
          <button
            className={ 'prediction-toggle' }
            onClick={ this.togglePredictionPanel.bind(this) }>
            <i className={this.props.isPredictionShow ? "fa fa-caret-right" : "fa fa-caret-left"}></i>
          </button>
          <ComparatorHeatmap
            stretchView={ stretchView }
            heatmapYAxis={ heatmapYAxis }
            filter={ filter }
            patterns={ patterns }
            scaleMinValue={ scaleMinValue }
            scaleMaxValue={ scaleMaxValue } />
        </div>
      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, patterns, filter, prediction, active, account} = state;
	const {stockView, isPredictionShow} = layout;
  const {lastClosePrice, predictionpriceScaleMarks, predictionLastClosePrices, heatmapYAxis, scaleMaxValue, scaleMinValue} = prediction;
  const {id} = active;
  let logined = account.username !== '';
	return {
		stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    patterns: patterns,
    filter: filter,
    lastClosePrice: lastClosePrice,
    heatmapYAxis: heatmapYAxis,
    scaleMinValue: scaleMinValue,
    scaleMaxValue: scaleMaxValue,
    activeId: id,
    logined
	};
};
export default connect(stateToProps)(ComparatorStatic);
