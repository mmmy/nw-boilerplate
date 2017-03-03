
function $s(elem) {
  return $(document.createElementNS('http://www.w3.org/2000/svg', elem));
}

module.exports = function($) {
	var theme = $(document.body).attr('theme');
	$.extend({
		keyStone: {
			configDefault:{
				brownRedDark: '#750905',
				brownRed: theme == 'dark' ? 'rgb(170,65,66)' : '#8D151B',
				brownRedLight: '#AC1822' //rgb(172,24,34)
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
        } else {
        	dataCategory = type;
        }
        return dataCategory;
			},
			volumeFormatter: function(volume) {
				var v = parseInt(volume);
				var str = 'N/A';
				if(isNaN(v)) {
					return str;
				}
				v = v / 100;
				if(9995 > v) str = v + ' 手';
				else {
					var num = v / 1E4;
					str = num >= 10000 ? num.toFixed(0) : (num + '').slice(0,6);
					str += ' 万手'
				}
				return str;
			},
			amountFormatter: function(amount) { //万, 亿
				var a = parseInt(amount);
				var str = 'N/A';
				if(isNaN(a)) {
					return str;
				}
				a = Math.round(a / 10000);
				if(10000 > a) str = a + ' 万';
				else {
					var num = Math.round(a / 10000);
					str = num + ' 亿'
				}
				return str;
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
		},
		svgPercent: function(options) {
			options = $.extend({
				count: 0,
				total: 0,
				caption: ''
			},options);
			var l = 2 * Math.PI * 45;
			var $this = $(this);
			var $svg = $this.find('svg');
			var $caption = $this.find('figcaption');

			var percent = 1 - options.count / options.total;
			var dashLen = isFinite(percent) ? l * percent : l;

			$caption.text(options.caption || '---')
			$svg[0].setAttribute('viewBox', '0 0 100 100');

			var $circle = $($s('g').attr({'transform':'rotate(-90 50 50)'})).append($s('circle').attr({r:'45',cx:'50',cy:'50'}))
										.append($s('circle').attr({r:'45',cx:'50',cy:'50','stroke-dasharray':l}));
			$circle.find('circle:last-child').css('stroke-dashoffset', dashLen);

			var $text = $($s('g')).append($s('text').attr({x:'50',y:'60'}))
			$text.find('text').append([$s('tspan'),$s('tspan'),$s('tspan')]);
			$text.find('tspan:nth-child(1)').text(options.count);
			$text.find('tspan:nth-child(2)').text('/');
			$text.find('tspan:nth-child(3)').text(options.total);
			
			$svg.empty().append($circle).append($text);
			return this;
		},
		barChart: function(options) {
			options = $.extend({barWidth:10, barSpace:2, data:[], keyFormatter:null,},options);
			var $this = $(this);
			var $svg = $this.find('svg');
			var len = options.data.length;

			var totalWidth = 250;
			var labelWith = 15;
			var viewWidth = totalWidth - labelWith;

			var viewHeight = (options.barWidth + options.barSpace) * len;
			// $svg.attr('height', viewHeight);
			$svg[0].setAttribute('viewBox', `0 0 ${totalWidth} ${viewHeight > 0 ? viewHeight : 12}`);

			var paths = [];
			if(len > 0) {
				var maxValue = options.data.reduce((pre, cur)=>{ return Math.max(pre,cur.value) }, 0);
				for(var i=0; i<len; i++) {
					var item = options.data[i];
					var key = options.keyFormatter ? options.keyFormatter(item.key) : item.key;
					var x = labelWith;
					var y = i*(options.barWidth + options.barSpace);

					var width = viewWidth * item.value / maxValue;
					var $g = $($s('g')).append($s('rect')).append($s('rect')).append($s('text').addClass('key')).append($s('text').addClass('label'));
					$g.find('rect:nth-child(1)').attr({x:x, y:y, height: options.barWidth, width: viewWidth}).addClass('bg');
					var $animate = $s('animate');
					$animate[0].setAttribute('attributeName','width');
					// $animate[0].setAttribute('repeatCount','indefinite');
					// $animate[0].setAttribute('autoReverse','true');

					$g.find('rect:nth-child(2)').attr({x:x, y:y, height:options.barWidth})
																				.append($animate.attr({'from':0,'to':width,dur:'3s',fill:'freeze'}))
					$g.find('text.key').text(key).attr({x: x+3, y: (y + options.barWidth/2), 'font-size':options.barWidth * 0.8});
					$g.find('text.label').text(item.value).attr({x: x-4, y: (y + options.barWidth/2), 'font-size':options.barWidth * 0.8});
					paths.push($g);
				}
			}

			$svg.empty().append(paths);
			return this;
		},

	});
}
