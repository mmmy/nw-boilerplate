'use strict';

var _Init = require('./shared/Init');

var _Init2 = _interopRequireDefault(_Init);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _Root = require('./components/Root');

var _Root2 = _interopRequireDefault(_Root);

var _flux = require('./flux');

var _flux2 = _interopRequireDefault(_flux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Promise.all([new Promise(function (resolve) {
	if (window.addEventListener) {
		window.addEventListener('DOMContentLoaded', resolve);
	} else {
		window.attachEvent('onLoad', resolve);
	}
})]).then(function () {
	// window.nw && window.nw.Window.get()
	// var win = ;
	// win.showDevTools();
	require('nw.gui').Window.get().showDevTools();
	(0, _Init2.default)();

	if (process.env.NODE_ENV === 'development') {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'http://localhost:35729/livereload.js';
		head.appendChild(script);
	}
	console.log('window onload');
	_reactDom2.default.render(_react2.default.createElement(
		_reactRedux.Provider,
		{ store: _flux2.default },
		_react2.default.createElement(_Root2.default, null)
	), document.getElementById('app'));
});