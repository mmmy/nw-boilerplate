import 'babel-polyfill';

import init from './shared/Init';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';


import Root from './containers/Root';
import GenerateStore from './flux/GenerateStore';

let store = GenerateStore();
window.store = store;


Promise.all([
	new Promise((resolve) => {
		if(window.addEventListener) {
			window.addEventListener('DOMContentLoaded', resolve);
		} else {
			window.attachEvent('onLoad', resolve);
		}
	})
]).then(() => {
	// window.nw && window.nw.Window.get()
	// var win = ;
	// win.showDevTools();
	require('nw.gui').Window.get().showDevTools();
	init();

	if (process.env.NODE_ENV === 'development') {
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://localhost:35729/livereload.js';
      head.appendChild(script);
    }
	ReactDOM.render(<Provider store={store}><Root /></Provider>, document.getElementById('app'));
});