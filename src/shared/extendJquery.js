
module.exports = function($) {
	var theme = $(document.body).attr('theme');
	$.extend({
		keyStone: {
			configDefault:{
				brownRedDark: '#750905',
				brownRed: theme == 'dark' ? 'rgb(170,65,66)' : '#8D151B',
				brownRedLight: '#AC1822'
			},
			theme: theme,              //or dark
			resolutionToDataCategory: function(conifg) {
				var type = conifg.type,                //'futures','stock','index'
						resolution = conifg.resolution;    //'1','5','15','D'

				var dataCategory = "cs";
        if(type === "stock" || type === "index") {   //股票 & 指数
            if(resolution === "1") {
                dataCategory = "cs_m1";
            } else if(resolution === '5') {
                dataCategory = "cs_m5";
            } else if(resolution.toUpperCase() === 'D') {
                dataCategory = "cs";
            }
        } else if(type === "bt") { //bit coin
            dataCategory = "bt";
        } else if(type === "futures") { //期货
            if(resolution == '5') { //5分钟
                dataCategory = 'cf_m5';
            } else if(resolution === 'D' || resolution == 'd') { //天数据
                dataCategory = 'cf';
            }
        }
        return dataCategory;
			}

		}
	});

	$.fn.extend({
		animateCss: function (animationName, cb) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            cb && cb();
        });
    },
		ksSortable: function(options) {				//拖动排序
			var $this = $(this);
			$this.attr('draggable',true);

			$this.on('dragstart',function(e){
				// console.log('dragstart',e);
				$this.css('opacity', '0.3').addClass('dragging');
			})
			.on('dragenter',function(e){
				var $cur = $(e.currentTarget);
				// console.log('cur',$cur.text(),$cur.attr('draggable'));
				// console.log('this',$this.text(),$this.attr('draggable'));
				if($cur.attr('draggable') == 'true') {
					if($cur.nextAll('.dragging').length>0) {
						$cur.siblings('.dragging').insertBefore($cur);
					} else {
						$cur.siblings('.dragging').insertAfter($cur);
					}
				}
			})
			.on('dragover',function(e){
				// e.preventDefault();
			})
			.on('dragleave',function(e){

			})
			.on('dragend',function(e){
				var $cur = $(e.currentTarget);
				// console.log('dragend',e);
				// console.log('dragend cur',$cur.text(),$cur.attr('draggable'));
				$this.css('opacity','').removeClass('dragging');
				var sortedData = $cur.parent().children().map(function(i,e){ return $(e).data() });
				options && options.onDragend(sortedData);
			})
			.on('drop',function(e){
				// console.log('drop',e);
			})
			return $this;
		},
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
		ksTooltip: function(handle) {
			var $this = $(this);
			$this.on('mouseenter', function(e) {
				let that = this;
				let kstooltip = handle ? handle($this) : $(that).data().kstooltip;
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
}