import { setRem } from '../components/utils/layoutUtils';
import _ from 'underscore';

let initJquery = () => {
	let $ = require('jquery');
	window.jQuery = window.$ = $;
	global.jQuery = global.$ = $;
	require('./bootstrap-datepicker.min');
	require('./bootstrap-datepicker.zh-CN.min');
	//animate.css helper
	if(!$.fn.animatedCss){
			$.fn.extend({
			    animateCss: function (animationName) {
			        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
			            $(this).removeClass('animated ' + animationName);
			        });
			    }
			});
	}
	/*let TradingView =*/ require('../../tradingview/charting_library/charting_library');
	/*let Datafeed =*/ require('../../tradingview/charting_library/datafeed/udf/datafeed');
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

module.exports = () => {
	/******************************************
		.showDevTools()  not work at here
	********************************************/
	// var win = window.nw.Window.get();
	// win.showDevTools();
	console.log('InitNw=====');
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

 	initJquery();
 	initAssert();
 	initResize();
};
