import { setRem } from '../components/utils/layoutUtils';
import _ from 'underscore';

let initJquery = () => {
	let $ = require('jquery');
	window.jQuery = window.$ = $;
	global.jQuery = global.$ = $;
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
	$.extend({
		keyStone: {
			configDefault:{
				brownRedDark: '#750905',
				brownRed: '#8D151B',
				brownRedLight: '#AC1822'
			}
		}
	});

	$.fn.extend({
		ksDragable: function() {      //可拖动工具栏
			var $container = $(this);
			var _offsetX = 0;
	    var _offsetY = 0;
	    $container.on('mousedown', function(e){
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
	        if(e.clientX > 0 && right > 0) {    //没有超出边界
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
	}
}
