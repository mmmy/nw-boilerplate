import { setRem } from '../components/utils/layoutUtils';
import _ from 'underscore';

let initJquery = () => {
	let $ = require('jquery');
	window.jQuery = window.$ = $;
	global.jQuery = global.$ = $;

	window.KEYSTONE = {
		patternsSorted: []
	};
};

let initJqueryPlugins = () => {
	require('../../vendor/jquery-ui.min');
	
	require('../../vendor/bootstrap-datepicker.min');
	require('../../vendor/bootstrap-datepicker.zh-CN.min');
	

	require('./extendJquery')($);
	//load tradingview libs
	
	/*let TradingView =*/ require('../../tradingview/charting_library/charting_library');
	/*let Datafeed =*/ //require('../../tradingview/charting_library/datafeed/udf/datafeed');
  require('../../tradingview/charting_library/datafeed/udf/ks_search_result');
  require('../../tradingview/charting_library/datafeed/udf/ks_symbols_database');
  require('../../tradingview/charting_library/datafeed/udf/mock_request');
  require('../../tradingview/charting_library/datafeed/udf/kfeed');
};

let loadChartLib = () => {

};

let initAssert = () => {
	window.Assert = (condition, message) => {
		if (!condition) {
			let msg = message || "Assertion failed 请检查代码!";
	        if (typeof Error !== "undefined") {
	            throw new Error(msg);
	        }
	        throw message; // Fallback
		}
	};
};

let initResize = () => {
	setRem();
	window.addEventListener('resize', _.debounce(setRem, 200));
};

let initNwEvents = () => {
	var _btnCache = null;
	try {
		var gui = window.require('nw.gui');
		var Win = gui.Window.get();
		Win.on('maximize', function(){
			if(_btnCache == null) {
				_btnCache = $('.app-maximize');
			}
			_btnCache.addClass('fullScreen');
		});
		Win.on('unmaximize', function(){
			if(_btnCache == null) {
				_btnCache = $('.app-maximize');
			}
			_btnCache.removeClass('fullScreen');
		});
	} catch(e) {
		console.error(e);
	}
};

let initGolbalKeyEvent = () => {
	window.addEventListener('keydown', (e)=>{
		if(e.altKey && e.ctrlKey && e.shiftKey) {
			switch(e.keyCode) {
				case 73: //i
					// window._gui && window._gui.Window.get().showDevTools();
					setTimeout(() => {
						window.require('nw.gui').Window.get().showDevTools();
					},100);
					break;
				default:
					break;
			}
		}
	});
	//在K线图页, 将焦点锁定在tradingview
	var $stockViewCache = null,
			$searchReportCache = null,
			$iframe = null;
	window.addEventListener('mouseup', (e)=>{
		$stockViewCache = $stockViewCache || $('.content-wrapper.curve');
		$searchReportCache = $searchReportCache || $('.container-searchreport.static');
		$iframe = $iframe || $('iframe');
		if($stockViewCache && $stockViewCache.hasClass('top-z') && $searchReportCache && !$searchReportCache.hasClass('searchreport-full')) {
			$iframe.focus();
		}
	});
};

module.exports = {
	initJquery,
	initAfterLogin: () => {
		/******************************************
			.showDevTools()  not work at here
		********************************************/
		// var win = window.nw.Window.get();
		// win.showDevTools();
		// console.log('InitNw=====');
		//not work !!
		/**********************************************/
		// if (process.env.NODE_ENV === 'development') {
	 //      var head = window.document.getElementsByTagName('head')[0];
	 //      var script = window.document.createElement('script');
	 //      script.type = 'text/javascript';
	 //      script.src = 'http://localhost:35729/livereload.js';
	 //      head.appendChild(script);
	 //      console.log('hi')
	 //    }

	 	initJqueryPlugins();
	 	initAssert();
	 	initResize();
	 	initGolbalKeyEvent();
	 	initNwEvents();
	 	if(process && process.platform == 'darwin') {
	 		$(document.body).addClass('mac');
	 	}
	}
}
