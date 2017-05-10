
var helperModal = {};

helperModal.show = () => {
	var messages = [
				[
					'<h4>什么是"Scanner扫描"</h4>',
					`<p>我们对沪深300中所有股票进行<b>形态搜索</b>,<br>选取其中预期未来走势最好的个股呈现于此.</p>`,
					`<p>包括: 1.搜索结果 和 2.简报</p>`,
					'<p><button index="1" class="round flat-btn btn-red">点击了解更多</button></p>',
				],
				[
					'<h4>"Scanner扫描"是如何实现的</h4>',
					'<p>拱石选取沪深300所有股票最近20根日线图形作为搜索源,在历史数据中搜索出K线及成交量高度相似事件.</p>',
					'<p>对历史相似图形的后向10天走势进行统计,选取统计结果中涨跌平均值高于某一标准值的股票作为本次扫描的优选结果.</p>',
					'<p><button class="round flat-btn btn-red finish">开始体验</button></p>'
				]
			];
	var sections = messages.map((nodes)=>{
		return $('<div class="section"></div>').append(nodes);
	});

	var $overlay = $('<div class="modal-overlay flex-center font-msyh"></div>');
	var $wrapper = $('<div class="modal-wrapper scanner"></div>');

	// var $title = $('<h4 class="title">扫描原理</h4>');
	var $body = $(`<div class="body"></div>`).append($('<div class="wrapper"></div>').append(sections));
	var $footer = $(`<div class="spins"><ul><li class="active"></li><li></li></ul></div>`);

	$wrapper.append([$body, $footer]);
	$overlay.append($wrapper);
	$(document.body).append($overlay);

	var showSection = (index) => {
		index = +index;
		$wrapper = $body.find('.wrapper');
		var len = $wrapper.children().length;
		var left = - index * 100 + '%';
		$wrapper.css('left', left);
		//spins
		$footer.find(`li:nth-child(${index+1})`).addClass('active').siblings().removeClass('active');
	};
	$body.find('button[index]').click((e) => {
		var index = $(e.target).attr('index');
		showSection(index);
		e.preventDefault();
	});
	$body.find('button.finish').click(function(event) {
		$overlay.remove();
	});
	$footer.find('li').click((e)=>{
		var index = $(e.target).prevAll().length;
		showSection(index);
	});
};

helperModal.check = () => {
	var key = '__FIRST_IN_SCANNER';
	var storage = window.localStorage;
	var value = storage[key];
	if(!value) {
		helperModal.show();
		storage[key] = true;
	}
};

module.exports = helperModal;