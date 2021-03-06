import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactTradingView from '../components/ReactTradingView';
import { STOCK_VIEW } from '../flux/constants/Const';
import datafeedCache from '../cache/datafeedCache';
let { setDataFeed } = datafeedCache;
import searchPatternGuide from '../ksControllers/searchPatternGuide';

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
		this._watchlistInited = false;
		this._scannerInited = false;
	}

	initScanner() {
		if(this._scannerInited) return;
		var scannerController = require('../ksControllers/scannerController');
		var that = this;
		scannerController.init(this.refs.scanner_view);

		this._scannerInited = true;
	}

	initWatchlist() {
		if(this._watchlistInited) return;

		var watchlistController = require('../ksControllers/watchlistController');
		var watchlistStorage = require('../backend/watchlistStorage');
		var storage = watchlistStorage.getDataFromStorage(this._category);
		var that = this;
		if(storage) {
			watchlistController.init(that.refs.watchlist_view);
			//显示更新日志在 关闭其他modal之后
			var interval = setInterval(function(){
				if($('body > .modal-overlay').length == 0) {
      		require('../ksControllers/updateLog').check();
      		clearInterval(interval);
				}				
			},500);
		} else {
			//查询如果没有模态对话框(比如过期信息对话框), 开始引导 , 简单粗暴
			var interval = setInterval(function(){
				if($('body > .modal-overlay').length == 0) {
					var watchlistGuide = require('../ksControllers/watchlistController/watchlistGuide');
					watchlistGuide.start(function(configObj){
		      	require('../ksControllers/updateLog').check();
						watchlistStorage.saveToFile(configObj);
						watchlistController.init(that.refs.watchlist_view);
					});
					clearInterval(interval);
				}
			}, 500);
		}

		this._watchlistInited = true;
	}

	componentDidMount() {
		var that = this;
		historyController.init(this.refs.history_nav_container, this.refs.history_body_container);
		favoritesController.init(this.refs.favorites_nav_container, this.refs.favorites_body_container);
		//init date inputs
		var $dateWrapper = $(this.refs.date_input_wrapper);
		var $dateInput = $dateWrapper.find('input');
		var $dateSubmit = $dateWrapper.find('button');

		let datePickerOptions = {
			format: "yyyy/mm/dd",
			language: "zh-CN",
			todayBtn: "linked",
			keyboardNavigation: false,
			autoclose: true,
		};
		$dateInput.on('mouseup',(e)=>{ e.stopPropagation(); })
							.datepicker(datePickerOptions).on('hide', (e)=>{  });
		//fix bug
		$(this.refs.stock_view).find('.chart-container').on('ks-click',(e)=>{
			$dateInput.datepicker('hide');
		});
		$dateSubmit.on('click',(e)=>{
			var date = new Date($dateInput.val());
			if(date > new Date('1980/1/1') && date < new Date()) {
				that.stockViewGoDate(date);
			}
		});
		//init watchlist
		// var watchlistStorage = require('../backend/watchlistStorage');
		// var storage = watchlistStorage.getDataFromStorage(this._category);
		// if(storage) {
		// 	this.initWatchlist();
		// }
		this.initWatchlist();
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

						// "mainSeriesProperties.hollowCandleStyle.upColor": "#999",
						// "mainSeriesProperties.hollowCandleStyle.downColor": "#666",
						// "mainSeriesProperties.hollowCandleStyle.drawWick": true,
						// "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
						// "mainSeriesProperties.hollowCandleStyle.borderColor": "#999",
						// "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#999",
						// "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#666",
						// "mainSeriesProperties.hollowCandleStyle.wickUpColor": '#999',
						// "mainSeriesProperties.hollowCandleStyle.wickDownColor": '#666',
						// "mainSeriesProperties.hollowCandleStyle.barColorsOnPrevClose": false,
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
					volume: true,
					OHLCBarBorderColor: true,
					ksSearch: true,
					ksSearchFloat: true,
					ksSearchRange: [10, 250],
					showLiveBtn: true,
					alwaysUpdateCache: true,
					customVolumeView: true,
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
	    <div ref='container' className={"transition-all transition-opacity container-stockview " + (stockView ? "" : "stockview-hide")} >
	    	<div className='container-stockview-inner'>
	      	<div className='left-toolbar-container'>
	      		<div><button data-kstooltip="智能监控" ref='watchlist_btn' className='flat-btn watchlist active' onMouseDown={ this.showWatchlist.bind(this) }>watchlist</button></div>
	      		<div><button data-kstooltip="扫描" ref='scanner_btn' className='flat-btn scanner' onMouseDown={ this.showScanner.bind(this) }>scanner</button></div>
	      		<div><button data-kstooltip="K线图" ref='curve_btn' className='flat-btn curve' onMouseDown={ this.showSockView.bind(this) }>quxian</button></div>
	      		<div><button data-kstooltip="收藏夹" ref='favorites_btn' className='flat-btn favorites' onMouseDown={ this.showFavorites.bind(this) }>favorites</button></div>
	      		<div><button data-kstooltip="历史记录" ref='history_btn' className='flat-btn history' onMouseDown={ this.showHistory.bind(this) }>history</button></div>
	      	</div>

	      	<div ref="watchlist_view" className='content-wrapper watchlist top-z'>
	      	</div>

	      	<div ref="scanner_view" className='content-wrapper scanner'>
	      	</div>

		      <div ref='stock_view' className='content-wrapper curve'>
		        <ReactTradingView
		          viewId={ STOCK_VIEW }
		          options={ options }
		          init={ logined } />
		        <div className="date-input-wrapper" ref="date_input_wrapper"><input value={new Date().toLocaleDateString()}/><button className="flat-btn btn-red round">跳转</button></div>
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
		var that = this;
		this._$containerToggleCache = this._$containerToggleCache || $('.container-toggle');
		this._$containerToggleCache.removeClass('transition-all').find('>.btn-container').removeClass('transition-position');
		$(document.body).removeClass('watchlist');
		//注意: 此处代码只是取消切换到watchlsit的时候取消 '搜索结果'按钮的上下动画效果
		setTimeout(function(){
			that._$containerToggleCache.addClass('transition-all').find('>.btn-container').addClass('transition-position');
		}, 500);
		//reset button state
		$(this.refs.container).find('.left-toolbar-container button').removeClass('active');
		//reset views top-z
		$(this.refs.container).find('.content-wrapper').removeClass('top-z');
	}

	showSockView(e) {
		this.resetButton();
		$(e.target).addClass('active');
		$(this.refs.stock_view).addClass('top-z');
		//显示拱石搜索的guide
		searchPatternGuide.check();
	}

	showScanner(e) {
		this.resetButton();
		$(this.refs.scanner_view).addClass('top-z');
		$(e.target).addClass('active');
		$(document.body).addClass('watchlist');
		this.initScanner();
	}

	showWatchlist(e) {
		this.resetButton();
		$(this.refs.watchlist_view).addClass('top-z');
		$(e.target).addClass('active');
		$(document.body).addClass('watchlist');
		this.initWatchlist();
	}

	showFavorites(e) {
		this.resetButton();
		$(this.refs.favorites_view).addClass('top-z');
		$(e.target).addClass('active');
	}

	showHistory(e) {
		this.resetButton();
		$(this.refs.history_view).addClass('top-z');
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
			$(this.refs.add_newfolder_btn).addClass('ks-disable');
			$(this.refs.clear_btn).addClass('ks-disable');
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

	stockViewGoDate(date) {
		var offset = 4 * 30 * 24 * 3600; //4 months
		var middle = +new Date(date) / 1000;
		var actionTradingview = require('../shared/actionTradingview');
		actionTradingview.setStockViewVisibleRange('', {from: middle - offset, to: middle + offset},0);
	}
}

StockView.propTypes = propTypes;

let mapStateToProps = function mapStateToProps(state) {
	const { layout, account } = state;
	const { stockView } = layout;
	let logined = true;//account.username !== '';
	return {
	  stockView,
	  logined
	};
}

export default connect(mapStateToProps)(StockView);
