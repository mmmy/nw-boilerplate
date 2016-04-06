import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import { STOCK_VIEW } from '../flux/constants/Const';

class StockView extends React.Component {

	constructor(props) {
		super(props);

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

	render(){
		let { stockView } = this.props;
		let options = {
				fullscreen: true,
				symbol: 'AA',
				interval: 'D',
				//container_id: "tv_chart_container",
				//	BEWARE: no trailing slash is expected in feed URL
				datafeed: new Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
				library_path: "charting_library/",
				locale: "en",
				//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
				drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
				disabled_features: ["use_localstorage_for_settings"],
				enabled_features: ["study_templates"],
				charts_storage_url: 'http://saveload.tradingview.com',
                charts_storage_api_version: "1.1",
				client_id: 'tradingview.com',
				user_id: 'public_user_id',
				//autosize: true,
				height: 300,
			};

		return <div className={"transition-all container-stockview " + (stockView ? "" : "stockview-hide")}>{/*<ReactTradingView viewId={ STOCK_VIEW } options={ options }/>*/}</div>;
	}
}

var mapStateToProps = function mapStateToProps(state) {
	console.log('state changed');
	const { layout } = state;
	const { stockView } = layout;
	return {
	  stockView
	};
}

export default connect(mapStateToProps)(StockView);

