import React from 'react';
let TradingView = window.TradingView;

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount(){
		console.log('componentDidMountm');
		let getParameterByName = (name) => {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

		//window.TradingView.onready(function()
		//{
			var widget = new window.TradingView.widget({
				fullscreen: true,
				symbol: 'AA',
				interval: 'D',
				container_id: "tv_chart_container",
				//	BEWARE: no trailing slash is expected in feed URL
				datafeed: new Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
				library_path: "charting_library/",
				locale: getParameterByName('lang') || "en",
				//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
				drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
				disabled_features: ["use_localstorage_for_settings"],
				enabled_features: ["study_templates"],
				charts_storage_url: 'http://saveload.tradingview.com',
                charts_storage_api_version: "1.1",
				client_id: 'tradingview.com',
				user_id: 'public_user_id'
			});

			window.widget = widget;
		// /});
	}

	handleClick(){
		alert('MainChart clicked--');
	}

	render(){
		return <div>
			<div id="tv_chart_container"></div>
		</div>;
	}
}

export default MainChart;