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
    const { patterns, filter } = this.props;

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': this.props.stretchView,
      'comparator-chart-static-hide': !this.props.stretchView,
    });

    let predictionMainClassName = classNames('prediction-main', {
      'comparator-prediction-hide': !this.props.isPredictionShow
    });

    const STOCK_VIEW = 'comparator-chart';

    let options = {
      symbol: 'AA',
      interval: 'D',
      container_id: STOCK_VIEW,
      //	BEWARE: no trailing slash is expected in feed URL
      datafeed: new Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
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
      // height: 300,
      // width: 300,
    }

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
            <ComparatorPrediction filter={ filter } patterns={ patterns }/>
          </div>

          <div className={'prediction-panel'}>
            <button
              className={ 'prediction-toggle' }
              onClick={ this.togglePredictionPanel.bind(this) }>
              <i className={this.props.isPredictionShow ? "fa fa-caret-right" : "fa fa-caret-left"}></i>
            </button>

            <ComparatorHeatmap />
          </div>

        </div>
      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout, patterns, filter} = state;
	const {stockView, isPredictionShow} = layout;
	return {
		stretchView: !stockView,
    isPredictionShow: isPredictionShow,
    patterns: patterns,
    filter, filter
	};
};
export default connect(stateToProps)(ComparatorStatic);
