import React, { PropTypes } from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import ComparatorPrediction from '../components/ComparatorPrediction';

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

	render() {

    let comparatorChartClassName = classNames('comparator-chart-static', {
      'comparator-chart-static-show': this.props.stretchView,
      'comparator-chart-static-hide': !this.props.stretchView,
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
        <ComparatorPrediction />
      </div>
    );
	}
}

ComparatorStatic.propTypes = propTypes;
ComparatorStatic.defaultProps = defaultProps;

var stateToProps = function(state) {
	const {layout} = state;
	const {stockView} = layout;
	return {
		stretchView: !stockView,
	};
};
export default connect(stateToProps)(ComparatorStatic);