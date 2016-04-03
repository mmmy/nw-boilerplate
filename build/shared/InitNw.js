'use strict';

module.exports = function () {
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
};