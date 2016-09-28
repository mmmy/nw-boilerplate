//此文件应该在react 所有的component都加载完毕后执行
(function() {
	// function handleEnter() {

	// }
	$("[data-kstooltip]")
	.on('mouseenter', function(e) {
		let that = this;
		let kstooltip = $(that).data().kstooltip;
		let top = e.pageY - 12,
				left = e.pageX + 12;
		let $tooltip = $(`<div class="ks-tooltip-container fade"><span class="tooltip-describe">${kstooltip}</span></div>`).css({left, top});
		clearTimeout(this._delayShowTooltip);
		this._delayShowTooltip = setTimeout(() => {
			$(document.body).append($tooltip);
			$tooltip.addClass('in');
		},1000);
	})
	.on('mouseleave', function(e) {
		//移除tooltip 和 延时
		$('.ks-tooltip-container').one('transitionend',function(e){
			$(this).remove();
		}).removeClass('in');
		clearTimeout(this._delayShowTooltip);
	});
})()