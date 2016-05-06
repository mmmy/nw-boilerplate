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

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());
  }

	render() {
    const { patterns,
      filter,
      isPredictionShow,
      lastClosePrice,
      heatmapYAxis,
      dispatch } = this.props;

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': this.props.stretchView,
      'comparator-chart-static-hide': !this.props.stretchView,
    });

    const predictionMainClassName = classNames('prediction-main', {
      'comparator-prediction-hide': !isPredictionShow
    });

    const STOCK_VIEW = 'comparator-chart';

    let options = {
      symbol: '000001.SZ',
      interval: 'D',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      datafeed: new Datafeeds.UDFCompatibleDatafeed("http://localhost:8888"),
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
      overrides: {
          //"paneProperties.background": "#191919",
           //"paneProperties.vertGridProperties.color": "#191919",
           //"paneProperties.horzGridProperties.color": "#191919",
          //"symbolWatermarkProperties.transparency": 90,
          //"scalesProperties.textColor" : "#AAA",

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

      },
      // height: 300,
      // width: 300,
    }

    const comparatorPredictionContainerClass = classNames('comparator-prediction-container',{
      'comparator-prediction-hide': !isPredictionShow
    });

    return (
      <div className={ comparatorChartClassName }>
        <ReactTradingView
          viewId={ STOCK_VIEW }
          options={ options } />
        <div className={ 'comparator-prediction-container' }>

          <div className={ predictionMainClassName }>
            <div className={ 'comparator-header' }>
              <span>走势预测</span>
            </div>
            <ComparatorPrediction dispatch={ dispatch } filter={ filter } patterns={ patterns } lastClosePrice={ lastClosePrice }/>
          </div>

          <div className={'prediction-panel'}>
            <button
              className={ 'prediction-toggle' }
              onClick={ this.togglePredictionPanel.bind(this) }>
              <i className={this.props.isPredictionShow ? "fa fa-caret-right" : "fa fa-caret-left"}></i>
            </button>

            <ComparatorHeatmap lastClosePrice={ lastClosePrice } heatmapYAxis={ heatmapYAxis } filter={ filter } patterns={ patterns } />
          </div>

        </div>
      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, patterns, filter, prediction} = state;
	const {stockView, isPredictionShow} = layout;
  const {lastClosePrice, predictionpriceScaleMarks, predictionLastClosePrices, heatmapYAxis} = prediction;
	return {
		stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    patterns: patterns,
    filter: filter,
    lastClosePrice: lastClosePrice,
    heatmapYAxis: heatmapYAxis
	};
};
export default connect(stateToProps)(ComparatorStatic);
