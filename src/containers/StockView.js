import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import { STOCK_VIEW } from '../flux/constants/Const';


const propTypes = {
	stockView: PropTypes.bool
};

class StockView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
	}


	componentDidMount() {

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(newProps){
		return newProps.logined !== this.props.logined;
	}

	componentWillUnmount(){

	}

	render() {
		let { stockView, logined } = this.props;
		let options = {
				symbol: '000001.SZ',
				interval: 'D',
				container_id: STOCK_VIEW,
				//	BEWARE: no trailing slash is expected in feed URL
				// datafeed: new window.Datafeeds.UDFCompatibleDatafeed("http://localhost:8888"),
				// datafeed: new window.Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
				datafeed: new window.Kfeeds.UDFCompatibleDatafeed(""),
				library_path: "charting_library/",
				locale: "zh",
      			theme: "Black",
				//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
				drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
				disabled_features: ['control_bar','timeframes_toolbar', 'remove_library_container_border', 'chart_property_page_style'],
				enabled_features: ["study_templates"],
				charts_storage_url: 'http://saveload.tradingview.com',
        		charts_storage_api_version: "1.1",
				client_id: 'tradingview.com',
				user_id: 'public_user_id',
				autosize: true,
        fullscreen: false,
        		// height: 300,
        		// width: 300,
	      overrides: {
						"paneProperties.background": "#131313",
	          "paneProperties.vertGridProperties.color": "#131313",
	          "paneProperties.horzGridProperties.color": "#131313",
	          "symbolWatermarkProperties.color": '#131313',
						"symbolWatermarkProperties.transparency": 90,
						"scalesProperties.textColor" : "#AAA",

						"mainSeriesProperties.candleStyle.upColor": "#131313",
						"mainSeriesProperties.candleStyle.downColor": "#131313",
						"mainSeriesProperties.candleStyle.drawWick": true,
						"mainSeriesProperties.candleStyle.drawBorder": true,
						"mainSeriesProperties.candleStyle.borderColor": "#378658",
						"mainSeriesProperties.candleStyle.borderUpColor": "#8E0000",
						"mainSeriesProperties.candleStyle.borderDownColor": "#6A6A6A",
						"mainSeriesProperties.candleStyle.wickUpColor": '#8E0000',
						"mainSeriesProperties.candleStyle.wickDownColor": '#6A6A6A',
						"mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,

						"scalesProperties.lineColor" : "rgba(255,255,255,0)",
						"scalesProperties.textColor" : "rgba(255,255,255,1)"
				},
				studies_overrides: {

				},
				ks_overrides: {
					"ksSplitView": false,
					volume: false,
					OHLCBarBorderColor: true,
					ksSearch: true,
					showLiveBtn: true,
					lineToolTimeAxisView: {
						background: '#b61c15',
						// activeBackground: 'green',
						color: '#fff',
						borderColor: '#b61c15',
					},
					lineToolPriceAxisView: {
						background: '#b61c15',
						// activeBackground: 'green',
						color: '#fff',
						borderColor: '#b61c15',
					}
				}
			};

		return (
	      <div className={"transition-all container-stockview " + (stockView ? "" : "stockview-hide")} >
	        <ReactTradingView
	          viewId={ STOCK_VIEW }
	          options={ options } 
	          init={ logined } />
	      </div>
	    );
	}
}

StockView.propTypes = propTypes;

let mapStateToProps = function mapStateToProps(state) {
	console.log('state changed');
	const { layout, account } = state;
	const { stockView } = layout;
	let logined = account.username !== '';
	return {
	  stockView,
	  logined
	};
}

export default connect(mapStateToProps)(StockView);
