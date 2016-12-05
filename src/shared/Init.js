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
	require('./bootstrap-datepicker.min');
	require('./bootstrap-datepicker.zh-CN.min');
	//animate.css helper
	if(!$.fn.animatedCss){
			$.fn.extend({
			    animateCss: function (animationName, cb) {
			        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
			            $(this).removeClass('animated ' + animationName);
			            cb && cb();
			        });
			    }
			});
	}
	//ksDefaultConfig
	var theme = $(document.body).attr('theme');
	$.extend({
		keyStone: {
			configDefault:{
				brownRedDark: '#750905',
				brownRed: theme == 'dark' ? 'rgb(170,65,66)' : '#8D151B',
				brownRedLight: '#AC1822'
			},
			theme: theme,              //or dark
		}
	});

	$.fn.extend({
		ksDragable: function(options) {      //可拖动工具栏
			var $container = $(this);
			var _offsetX = 0;
	    var _offsetY = 0;
	    var targetSelector = options && options.targetSelector;
	    $container.on('mousedown', function(e){
	    		//首先判断是否为触发按钮
	    		if(targetSelector && ($container.find(targetSelector)[0] != e.target)) {
	    			return;
	    		}
					var $parent = $container.parent();
	        _offsetX = e.offsetX;
	        _offsetY = e.offsetY;
	        $parent.on('mousemove.ksDrag', divMove);
	        $parent.one('mouseup', function() {
	            $parent.off('mousemove.ksDrag');
	        });
	    })
	    function divMove(e) {
					var $parent = $container.parent();
					var parentOffset = $parent.offset();
	        var containerW = $container.width();
	        var containerH = $container.height();
	        var bodyW = $parent.width();
	        var bodyH = $parent.height();
	        var right = bodyW - (e.clientX - parentOffset.left) - containerW + _offsetX;
	        var top = e.clientY - parentOffset.top - _offsetY;
	        if(e.clientX > 0 && right > 0 && (containerW + right) < bodyW) {    //没有超出边界
	            $container.css('right', right);
	        }
	        if(e.clientY > 50 && top > 0) {
	            $container.css('top', top);
	        }
	        // $container.css({
	        //     right: right,
	        //     bottom: bottom
	        // })
	    }
	    return this;
		},
		ksTooltip: function() {
			var $this = $(this);
			$this.on('mouseenter', function(e) {
				let that = this;
				let kstooltip = $(that).data().kstooltip;
				let top = e.pageY - 12,
						left = e.pageX + 12;
				let $tooltip = $(`<div class="ks-tooltip-container fade"><span class="tooltip-describe">${kstooltip}</span></div>`).css({left, top});
				clearTimeout(this._delayShowTooltip);
				this._delayShowTooltip = setTimeout(() => {
					$(document.body).append($tooltip);
					$tooltip.addClass('in');
				},200);
			})
			.on('mouseleave', function(e) {
				//移除tooltip 和 延时
				$('.ks-tooltip-container').one('transitionend',function(e){
					$(this).remove();
				}).removeClass('in');
				clearTimeout(this._delayShowTooltip);
			});
			return this;
		},
		updatePercentInfo: function(value, decimal) {
			decimal = decimal || 2;
			value = value || 0;
			var $this = $(this);
			var vauleStr = (value*100).toFixed(decimal) + '';
		  var values = vauleStr.split('.');
		  var $spans = $this.find('span');
		  $($spans[0]).text(values[0]);
		  $($spans[2]).text(values.length > 1 ? values[1] : '');
			return this;
		}
	});
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
	}
}
