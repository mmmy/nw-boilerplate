'use strict';

var _InitNw = require('./shared/InitNw');

var _InitNw2 = _interopRequireDefault(_InitNw);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Root = require('./components/Root');

var _Root2 = _interopRequireDefault(_Root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Promise.all([new Promise(function (resolve) {
	if (window.addEventListener) {
		window.addEventListener('DOMContentLoaded', resolve);
	} else {
		window.attachEvent('onLoad', resolve);
	}
})]).then(function () {
	// var win = window.nw.Window.get();
	// win.showDevTools();
	//require('nw.gui').Window.get().showDevTools(false);
	(0, _InitNw2.default)();
	console.log(_InitNw2.default);

	if (process.env.NODE_ENV === 'development') {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'http://localhost:35729/livereload.js';
		head.appendChild(script);
	}
	delete global.require.cache;
	console.log('window onload');
	_reactDom2.default.render(_react2.default.createElement(_Root2.default, null), document.getElementById('app'));
});