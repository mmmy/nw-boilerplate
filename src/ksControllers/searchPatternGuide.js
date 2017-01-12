
var searchPatternGuide = {};

searchPatternGuide.check = function() {
	var storage = window.localStorage;
	var key = '__FIRST_IN_TRADINGVIEW';
	// if(!storage[key]) {
		var overlay = $(`<div class="modal-overlay flex-center">
											<div class="guide-confirm-container">
													<p>请浏览一下简短的功能指引<br/>以便您在最短的时间内熟悉拱石</p>
													<div class="buttons-container">
														<button class="flat-btn border-btn2 round btn-red">开始引导</button>
														<button class="flat-btn border-btn2 round">跳过引导</button>
													</div>
											</div>
										</div>`);

		$(document.body).append(overlay);
		overlay.find('button:nth-child(1)').click(function(event) {
			overlay.remove();
			searchPatternGuide.start();
		});
		overlay.find('button:nth-child(2)').click(function(event) {
			overlay.remove();
		});

		// searchPatternGuide.start();
		storage[key] = true;
	// }
};

searchPatternGuide.start = function() {
	var _$overlay = $(`<div class="modal-overlay"></div>`);
	var _$modal = $(`<div class="search-pattern-guide"></div>`);

	var _$header = $(`<div class="title"></div>`);
	var _$body = $(`<div class="body" data-step="-1"><div class="content"><div class="step-container"></div><h4></h4><p></p></div></div>`);
	var _$footer = $(`<div class="footer"></div>`);
	_$modal.append([_$header, _$body, _$footer]);
	_$overlay.append(_$modal);
	$(window.document.body).append(_$overlay);

	var dateRange = $(`<div class="date-range-container">
									<div class="bars-info mask"><span>10根K线 13日</span><button class="flat-btn icon-btn-15 icon-close hover"></button></div>
									<hr />
									<div class="search-info mask">
										<button class="flat-btn icon-btn-30 hover icon-search"></button>搜索
										<button class="flat-btn icon-btn-30 hover icon-plot"></button>7根
										<button class="flat-btn icon-btn-30 hover icon-close"></button>
									</div>
								</div>`)
							.css({position:'absolute', bottom:"205px",left:"500px"});

	var dateRange2 = dateRange.clone(true);
	dateRange2.addClass('wider').find('.bars-info span:first-child').text('58根K线 83日');
	var steps = [
		{
			title: '搜索选择你想研究的目标',
			content: '键入数字或字符代码、名称(简拼)以查找您要研究的标的，选择K线图周期级别(分钟线、日线)',
			position:{left: '800px', top: '300px', right:'auto', bottom:'auto'},
			bodyClass: 'left',
			others: [
				$('<div class="s1-container mask"><img src="./image/s1.png" alt="" /></div>').css({position:"absolute", left:'80px', top:'60px'}),
			]
		},
		{
			title: '拖拽选择研究图形',
			content: '<span class="">单击拱石后，在K线图中选择研究图形的区间起点和终点；</span>注意：如果选择的研究图形区间过长，搜索得到的匹配结果数量较少或为零',
			position:{top:'auto', right: '240px', bottom: '176px', left:'auto'},
			bodyClass: 'right',
			others: [
				$('<div class="s2-container mask"><img src="./image/s2.png"/></div>').css({position:'absolute', bottom: '279px', right: '119px'}),
				dateRange,
			]
		},
		// {
		// 	title: '拖拽选择研究图形',
		// 	content: '<span class="red">选择图形任一点 往右平移选择区间</span><br />注意如果选择的研究图形区间过长, 搜索得到的匹配结果数量可能较少或为零',
		// 	position:{left: '150px', right:'auto', bottom: '300px', top:'auto'},
		// 	bodyClass: 'right',
		// },
		{
			title: '设置搜索的条件参数',
			content: '<span class="">单击此处，以设置进阶的搜索条件参数；</span>您可以设置以统计匹配结果后向五天的走势，您可以设置只对发生在某一段时间中的历史进行搜索，还可以设置只展示并统计相似度大于70%的匹配结果',
			position:{left: '780px', right:'auto', bottom: '135px', top:'auto'},
			bodyClass: 'left',
			others: [
				dateRange2,
			]
		},
		{
			title: '查看搜索结果',
			content: '<span class="">单击搜索，拱石将为您搜索并呈现出历史中相似的图形结果。</span>首先会出现的是对于本次提炼出的概况；点击搜索结果按钮，以查看完整的搜索报告结果',
			position:{left: 'calc(50% + 100px)', right:'auto', bottom: '50px', top:'auto'},
			bodyClass: 'left down',
			others: [
				dateRange2,
				$(`<div class="s6-container mask"><img src="./image/s6.png" alt="" /></div>`),
			]
		},
	];
	
	var len = steps.length;
	var curIndex = -1;
	var goStep = function(isNext) {
		if(isNext && (curIndex == len - 1)) {
			_$overlay.remove();
		}
		var $content = _$body.find('.content');
		curIndex = isNext ? (curIndex + 1) : (curIndex - 1);
		var option = steps[curIndex];
		$content.find('.step-container').text(curIndex + 1);
		$content.find('h4').html(option.title);
		$content.find('p').html(option.content);
		_$modal.css(option.position);

		_$body.removeClass('top right left bottom down').addClass(option.bodyClass).attr('data-step', curIndex);
		_$modal.siblings().remove();
		_$overlay.append(option.others);
		lastBtn.toggle(curIndex > 0);
		if(curIndex >= len - 1) {
			nextBtn.text('知道了');
		} else {
			nextBtn.text('下一步')
		}
	};
	var lastBtn = $(`<button class="flat-btn gray-light round">上一步</button>`).click(function(event) {
		goStep(false);
		// nextBtn.text('下一步');
	});
	var nextBtn = $(`<button class="flat-btn gray-light round btn-red">下一步</button>`).click(function(event) {
		goStep(true);
	});
	_$body.find('.content').append(steps);
	_$footer.append([lastBtn, nextBtn]);
	goStep(true);
};

module.exports = searchPatternGuide;
