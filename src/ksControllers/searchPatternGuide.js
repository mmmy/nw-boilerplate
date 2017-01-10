
var searchPatternGuide = {};

searchPatternGuide.check = function() {
	var storage = window.localStorage;
	var key = '__FIRST_IN_TRADINGVIEW';
	// if(!storage[key]) {
		searchPatternGuide.start();
		// storage[key] = true;
	// }
};

searchPatternGuide.start = function() {
	var _$overlay = $(`<div class="modal-overlay"></div>`);
	var _$modal = $(`<div class="search-pattern-guide"></div>`);

	var _$header = $(`<div class="title"></div>`);
	var _$body = $(`<div class="body"><div class="content"><h4></h4><p></p></div></div>`);
	var _$footer = $(`<div class="footer"></div>`);
	_$modal.append([_$header, _$body, _$footer]);
	_$overlay.append(_$modal);
	$(window.document.body).append(_$overlay);

	var steps = [
		{
			title: '搜索选择你想研究的目标',
			content: '键入数字或字符代码,名称(简拼)以查找您要研究的标的,选择K线图周期级别(分钟线,日线)',
			position:{left: '300px', top: '100px', right:'auto', bottom:'auto'},
		},
		{
			title: '单击拱石按钮 开始样本研究',
			content: '<span class="red">单击拱石,在K线图区域划选需要研究的图形区间;</span><br/>注意:如果选择的研究图形区间过长,搜索得到的匹配结果数量较少或为零',
			position:{top:'auto', right: '100px', bottom: '300px', left:'auto'},
		},
		{
			title: '拖拽选择研究图形',
			content: '<span class="red">选择图形任一点 往右平移选择区间</span><br />注意如果选择的研究图形区间过长, 搜索得到的匹配结果数量可能较少或为零',
			position:{left: '500px', right:'auto', bottom: '300px', top:'auto'},
		},
		{
			title: '设置搜索的条件参数',
			content: '<span class="red">单击此处, 以设置进阶的搜索条件参数;</span>您可以设置以统计匹配结果后向五天的走势,您可以设置只对发生在某一段时间中的历史进行搜索,还可以设置只展示并统计相似度大于70%的匹配结果',
			position:{left: '500px', right:'auto', bottom: '300px', top:'auto'},
		},
		{
			title: '查看搜索结果',
			content: '<span class="red">单击搜索,拱石将为您搜索并呈现出历史中相似的图形结果.</span>首先会出现的是对于本次提炼出的概况, 包括本次搜索得到的结果总数(至多展示前200个相似度最高的结果)这些结果在后向涨跌基本情况以及相似度最高的两条结果等等;点击搜索结果按钮,以查看完整的搜索报告',
			position:{left: '500px', right:'auto', bottom: '200px', top:'auto'},
		},
	];
	
	var len = steps.length;
	var curIndex = -1;
	var goStep = function(isNext) {
		var $content = _$body.find('.content');
		curIndex = isNext ? (curIndex + 1) : (curIndex - 1);
		$content.find('h4').html(steps[curIndex].title);
		$content.find('p').html(steps[curIndex].content);
		_$modal.css(steps[curIndex].position);
	};
	var lastBtn = $(`<button class="flat-btn border-btn">上一步</button>`).click(function(event) {
		goStep(false);
	});
	var nextBtn = $(`<button class="flat-btn border-btn red">知道了</button>`).click(function(event) {
		goStep(true);
	});
	_$body.find('.content').append(steps);
	_$footer.append([lastBtn, nextBtn]);
	goStep(true);
};

module.exports = searchPatternGuide;
