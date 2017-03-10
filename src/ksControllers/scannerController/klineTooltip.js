

module.exports = function($nodes){
	var tooltip = $('<div class="kline-tooltip-container"></div>');
	var mouseenter = function(e){
		var $target = $(e.currentTarget);
		tooltip.appendTo($target);
	};
	var mouseleave = function(e){
		var $target = $(e.currentTarget);
		tooltip.detach();
	};
	$nodes.on('mouseenter.kline',mouseenter).on('mouseleave.kline',mouseleave);
}