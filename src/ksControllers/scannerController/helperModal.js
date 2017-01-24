
var helperModal = {};

helperModal.show = () => {
	var messages = [
		'<p>我们对沪深300中所有股票进行形态搜索，选取其中预期未来走势最好的个股呈现于此</p>',
		'<p>形态搜索的核心思想，是根据当前的股票图形走势，从庞大的历史数据中搜索并匹配出相似的图形，通过统计历史相似图形的后期走势，来预测当前股票的未来走势。</p>',
		'<p>每个交易日结束后，我们会将最新一根日K线纳入当前形态，并以此进行下一期扫描；新一期扫描结果将于每个交易日结束后推送。</p>',
		'<h5 class="sub-title">扫描参数及条件</h5>',
		'<p>拱石选取沪深300所有股票最近20根日线图形作为搜索源，在历史数据中搜索出K线及成交量高度相似的事件。对历史相似图形的后向10天走势进行统计，选取统计结果中涨跌平均值高于某一标准值*的股票作为本次扫描的优选结果。<small>每次扫描使用的标准值可能略有调整，参数条件自定义功能即将上线</small></p>',
		'<p><small>注意：所有结果是基于搜索得到的历史相似图形统计，由历史统计的比例择优选取的个股，并不完全等同于对该股未来走势的绝对收益或概率。</small></p>',
	];
	
	var $overlay = $('<div class="modal-overlay flex-center font-msyh"></div>');
	var $wrapper = $('<div class="modal-wrapper log"></div>');

	var $title = $('<h4 class="title">扫描原理</h4>');
	var $body = $(`<div class="body"></div>`).append($('<div class="wrapper"></div>').append(messages));
	var $footer = $(`<div class="footer"><button class="flat-btn gray-light round">知道了</button></div>`);

	$wrapper.append([$title, $body, $footer]);
	$overlay.append($wrapper);
	$(document.body).append($overlay);

	$footer.find('button').click(function(event) {
		$overlay.remove();
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