
var initJquery = () => {
	let $ = require('jquery');
	window.jQeury = window.$ = $;
	global.jQeury = global.$ = $;
	let TradingView = require('../../tradingview/charting_library/charting_library');
	let Datafeed = require('../../tradingview/charting_library/datafeed/udf/datafeed');
};

var loadChartLib = () => {

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
};
