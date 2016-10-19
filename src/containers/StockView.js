import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import { STOCK_VIEW } from '../flux/constants/Const';
import datafeedCache from '../cache/datafeedCache';
let { setDataFeed } = datafeedCache;

import stockviewController from '../ksControllers/stockviewController';
let historyController = stockviewController.historyController;
let favoritesController = stockviewController.favoritesController;


const propTypes = {
	stockView: PropTypes.bool
};

class StockView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};
	}


	componentDidMount() {
		historyController.init(this.refs.history_nav_container, this.refs.history_body_container);
		favoritesController.init(this.refs.favorites_nav_container, this.refs.favorites_body_container);
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
		let datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10 * 1000, 2, 0);
		setDataFeed(datafeed);
		let options = {
				symbol: '上证综合指数',//'OKCOIN.SZ',
				interval: 'D',
				container_id: STOCK_VIEW,
				//	BEWARE: no trailing slash is expected in feed URL
				// datafeed: new window.Datafeeds.UDFCompatibleDatafeed("http://localhost:8888"),
				// datafeed: new window.Datafeeds.UDFCompatibleDatafeed("http://demo_feed.tradingview.com"),
				datafeed: datafeed, //params: datafeedURL, updateFrequency, protocolVersion, id
				library_path: "charting_library/",
				locale: "zh",
      			theme: "Black",
				//	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
				drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
				disabled_features: ['left_toolbar','control_bar','timeframes_toolbar', 'remove_library_container_border', 'chart_property_page_style'],
				enabled_features: ["study_templates", "narrow_chart_enabled"],
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
	          "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
	          "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",
	          "symbolWatermarkProperties.color": '#131313',
						// "symbolWatermarkProperties.transparency": 90,
						"symbolWatermarkProperties.color" : "rgba(255, 255, 255, 0.03)",
						"scalesProperties.textColor" : "#AAA",

            "mainSeriesProperties.showPriceLine": false,
						"mainSeriesProperties.candleStyle.upColor": "#131313",//"#131313",
						"mainSeriesProperties.candleStyle.downColor": "#666",
						"mainSeriesProperties.candleStyle.drawWick": true,
						"mainSeriesProperties.candleStyle.drawBorder": true,
						"mainSeriesProperties.candleStyle.borderColor": "#999",
						"mainSeriesProperties.candleStyle.borderUpColor": "#999",//"#8E0000",
						"mainSeriesProperties.candleStyle.borderDownColor": "#666",//"#6A6A6A",
						"mainSeriesProperties.candleStyle.wickUpColor": "#999",//'#8E0000',
						"mainSeriesProperties.candleStyle.wickDownColor": "#666",//'#6A6A6A',
						"mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,

						"mainSeriesProperties.hollowCandleStyle.upColor": "#999",
						"mainSeriesProperties.hollowCandleStyle.downColor": "#666",
						"mainSeriesProperties.hollowCandleStyle.drawWick": true,
						"mainSeriesProperties.hollowCandleStyle.drawBorder": true,
						"mainSeriesProperties.hollowCandleStyle.borderColor": "#999",
						"mainSeriesProperties.hollowCandleStyle.borderUpColor": "#999",
						"mainSeriesProperties.hollowCandleStyle.borderDownColor": "#666",
						"mainSeriesProperties.hollowCandleStyle.wickUpColor": '#999',
						"mainSeriesProperties.hollowCandleStyle.wickDownColor": '#666',
						"mainSeriesProperties.hollowCandleStyle.barColorsOnPrevClose": false,
						"scalesProperties.lineColor" : "rgba(255,255,255,0)",
						"scalesProperties.textColor" : "rgba(255,255,255,1)"
				},
				studies_overrides: {

				},
				ks_overrides: {
					disableContextMenu: true,
					// "ksSplitView": true,
					// ksBottomView: true,
					ksFullView: true,
					volume: false,
					OHLCBarBorderColor: true,
					ksSearch: true,
					ksSearchFloat: true,
					ksSearchRange: [10, 100],
					showLiveBtn: true,
					alwaysUpdateCache: true,
					// candleStyle: 9,
					// ksPaneBackground: ['#222','#111'],

					lineToolTimeAxisView: {
						background: '#333',
						// activeBackground: 'green',
						color: '#fff',
						borderColor: '#333',
					},
					lineToolPriceAxisView: {
						background: '#b61c15',
						// activeBackground: 'green',
						color: '#fff',
						borderColor: '#b61c15',
					},
					lineToolAxisRange: {
						background: 'rgba(255,255,255,0.1)',
					},
					debug: false,
				}
			};
		return (
	    <div ref='container' className={"transition-all container-stockview " + (stockView ? "" : "stockview-hide")} >
	    	<div className='container-stockview-inner'>
	      	<div className='left-toolbar-container'>
	      		<div><button data-kstooltip="K线图" ref='curve_btn' className='flat-btn curve active' onClick={ this.showSockView.bind(this) }>quxian</button></div>
	      		<div><button data-kstooltip="收藏夹" ref='favorites_btn' className='flat-btn favorites' onClick={ this.showFavorites.bind(this) }>favorites</button></div>
	      		<div><button data-kstooltip="历史记录" ref='history_btn' className='flat-btn history' onClick={ this.showHistory.bind(this) }>history</button></div>
	      	</div>

		      <div ref='stock_view' className='content-wrapper curve top-z'>
		        <ReactTradingView
		          viewId={ STOCK_VIEW }
		          options={ options }
		          init={ logined } />
		      </div>
		      
		      <div ref='favorites_view' className='content-wrapper favorites'>
		      	<div className='nav-container'>
		      		<h4 className='nav-title'>我的收藏夹</h4>
		      		<div ref='favorites_nav_container' className='nav-item-container'></div>
		      		<div className='favorites-input-wrapper'>
		      			<input className='font-simsun' ref='favorite_input' onChange={this.handleChangeFoldInput.bind(this)} placeholder='新建收藏夹'/>
		      			<button className='flat-btn new-folder ks-disable' ref='add_newfolder_btn' onClick={this.handleNewFavorites.bind(this)}>+</button>
		      			<button className='flat-btn clear ks-disable' ref='clear_btn' onClick={this.handleClearInput.bind(this)}>x</button>
		      		</div>
		      		<h6 className='trash-panel-btn font-simsun' onClick={this.handleShowTrashedPatterns.bind(this)}>
		      			<span className='name'>回收站</span>
		      			<span className='trash-number'></span>
		      			<button className='flat-btn clear' onClick={this.handleClearTrashedPatterns.bind(this)}>清空</button>
		      		</h6>
		      	</div>
		      	<div className='body-container-wrap'>
			      	<div ref='favorites_body_container' className='body-container'>

			      	</div>
			      </div>
		      </div>

		      <div ref='history_view' className='content-wrapper history'>
		      	<div className='nav-container'>
		      		<h4 className='nav-title'>历史记录</h4>
		      		<div ref='history_nav_container' className='nav-item-container'>

		      		</div>
		      	</div>
		      	<div className='body-container-wrap'>
		      		<div ref='history_body_container' className='body-container'>

		      		</div>
		      		<div className='shadow-bottom'></div>
		      	</div>
		      </div> 
	    	</div>
	    </div>
	  );
	}

	resetButton() {
		$(this.refs.curve_btn).removeClass('active');
		$(this.refs.history_btn).removeClass('active');
		$(this.refs.favorites_btn).removeClass('active');
	}

	showSockView(e) {
		$(this.refs.favorites_view).removeClass('top-z');
		$(this.refs.history_view).removeClass('top-z');
		$(this.refs.stock_view).addClass('top-z');
		this.resetButton();
		$(e.target).addClass('active');
	}

	showFavorites(e) {
		$(this.refs.favorites_view).addClass('top-z');
		$(this.refs.history_view).removeClass('top-z');
		$(this.refs.stock_view).removeClass('top-z');
		this.resetButton();
		$(e.target).addClass('active');
	}

	showHistory(e) {
		$(this.refs.favorites_view).removeClass('top-z');
		$(this.refs.history_view).addClass('top-z');
		$(this.refs.stock_view).removeClass('top-z');
		this.resetButton();
		$(e.target).addClass('active');
		// historyController.updateNavContainer(this.refs.history_nav_container);
	}

	handleChangeFoldInput(e) {
		let folderName = e.currentTarget.value;
		
		$(this.refs.clear_btn).toggleClass('ks-disable', folderName==='');

		if(folderName === '' || favoritesController.hasFavoriteFolder(folderName)) {
			$(this.refs.add_newfolder_btn).addClass('ks-disable');
		} else {
			$(this.refs.add_newfolder_btn).removeClass('ks-disable');
		}
	}

	handleNewFavorites(e) {
		
		if($(e.currentTarget).hasClass('ks-disable')) return;

		let folderName = $(this.refs.favorite_input).val();
		if(folderName) {
			favoritesController.addNewFolder(folderName);
			$(this.refs.favorite_input).val('');
		}
	}

	handleClearInput() {
		$(this.refs.favorite_input).val('');
		$(this.refs.clear_btn).addClass('ks-disable');
		$(this.refs.add_newfolder_btn).addClass('ks-disable');
	}

	handleShowTrashedPatterns(e) {
		favoritesController.showTrashedPatterns(e);
	}

	handleClearTrashedPatterns(e) {
		e.stopPropagation();
		favoritesController.clearTrashedPatterns();
	}
}

StockView.propTypes = propTypes;

let mapStateToProps = function mapStateToProps(state) {
	console.log('state changed');
	const { layout, account } = state;
	const { stockView } = layout;
	let logined = true;//account.username !== '';
	return {
	  stockView,
	  logined
	};
}

export default connect(mapStateToProps)(StockView);
