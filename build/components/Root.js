'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MainContainer = require('./main-container/MainContainer');

var _MainContainer2 = _interopRequireDefault(_MainContainer);

var _reactRedux = require('react-redux');

var _layoutActions = require('../flux/actions/layoutActions');

var _Header = require('./header/Header');

var _Header2 = _interopRequireDefault(_Header);

var _RightToolBar = require('./right-tool-bar/RightToolBar');

var _RightToolBar2 = _interopRequireDefault(_RightToolBar);

var _CoreApp = require('./core-app/CoreApp');

var _CoreApp2 = _interopRequireDefault(_CoreApp);

var _StockView = require('./stock-view/StockView');

var _StockView2 = _interopRequireDefault(_StockView);

var _SearchReport = require('./search-report/SearchReport');

var _SearchReport2 = _interopRequireDefault(_SearchReport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
	dispatch: _react.PropTypes.func.isRequired
};

var mapStateToProps = function mapStateToProps(state) {
	console.log('state changed');
	var layout = state.layout;
	var stockView = layout.stockView;

	return {
		stockView: stockView
	};
};

// function mapDispatchProps(dispatch) {
//   return {
//     toggleView: function(toggleStockView){ dispatch({type:"TOGGLE_STOCK_VIEW", toggleStockView:toggleStockView}); },
//   };
// }

var Root = function (_React$Component) {
	_inherits(Root, _React$Component);

	function Root(props) {
		_classCallCheck(this, Root);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Root).call(this, props));
	}

	_createClass(Root, [{
		key: 'render',
		value: function render() {
			var stockView = this.props.stockView;

			return _react2.default.createElement(
				_MainContainer2.default,
				null,
				_react2.default.createElement(_Header2.default, null),
				_react2.default.createElement(_RightToolBar2.default, null),
				_react2.default.createElement(
					_CoreApp2.default,
					null,
					_react2.default.createElement(_StockView2.default, { show: stockView }),
					_react2.default.createElement(
						'div',
						null,
						_react2.default.createElement(
							'button',
							{ className: 'btn btn-default', onClick: this.toggleView.bind(this) },
							'云搜索'
						)
					),
					_react2.default.createElement(_SearchReport2.default, { fullView: !stockView })
				)
			);
		}
	}, {
		key: 'toggleView',
		value: function toggleView() {
			var dispatch = this.props.dispatch;

			dispatch((0, _layoutActions.toggleStockView)());
		}
	}]);

	return Root;
}(_react2.default.Component);

Root.propTypes = propTypes;

exports.default = (0, _reactRedux.connect)(mapStateToProps)(Root);