
import initNw from './shared/InitNw';
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './components/Root';

Promise.all([
	new Promise((resolve) => {
		if(window.addEventListener) {
			window.addEventListener('DOMContentLoaded', resolve);
		} else {
			window.attachEvent('onLoad', resolve);
		}
	})
]).then(() => {
	// var win = window.nw.Window.get();
	// win.showDevTools();
	//require('nw.gui').Window.get().showDevTools(false);
	initNw();
	console.log(initNw);

	if (process.env.NODE_ENV === 'development') {
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://localhost:35729/livereload.js';
      head.appendChild(script);
    }
    delete global.require.cache;
	console.log('window onload');
	ReactDOM.render(<Root />,document.getElementById('app'));
});