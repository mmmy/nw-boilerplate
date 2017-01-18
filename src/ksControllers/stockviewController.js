
import { getSortedHistoryMonth, getSortedMonthData, pushHistory, getAllFilesFromStorage, deleteHistory, deleteOneHistory } from '../backend/historyManager';
import favoritesManager from '../backend/favoritesManager';
import store from '../store';
import { drawKline } from './painter';
import SearchEditor from './SearchEditor';
// import actionTradingview from '../shared/actionTradingview';
import { handleShouCangFocus, handleShouCangBlur } from './publicHelper';
import ConfirmModal from './ConfirmModal';

// let { updateTradingviewAfterSearch } = actionTradingview;

let _searchEditorHistory = null;
let _searchEditorFavorites = null;
let drawKlineOption = {volume:true, volumeHeight:1/6, klineGapBottom: 10};

//显示K线编辑器
let _createDetailPanel = (parentDom, type, dataObj) => {
	let editorContainer = $(`<div class='search-editor-container'></div>`);
	let $newDom = $(`<div class='detail-panel'><div class='head-nav'><button class='flat-btn font-simsun return'><span class='icon-return'></span>返回</button></div></div>`).append(editorContainer);
	let editorCache = null;
	$newDom.find('button.return').click((event) => { //返回
		_disposeDetailPanel(parentDom, editorCache);
	});
	$(parentDom).append($newDom);
	editorCache = new SearchEditor(editorContainer, dataObj, favoritesManager, favoritesController);
	(type == 'favorites') ? (_searchEditorFavorites = editorCache) : (_searchEditorHistory = editorCache);
};

let _disposeDetailPanel = (parentDom, editorCache) => {
	let isSaved = editorCache.isSaved();
	let remove = () => {
			editorCache.dispose();
			editorCache = null;	
			parentDom && $(parentDom).find('.detail-panel').remove();
	};
	if(!isSaved) {
		new ConfirmModal({
			title:'编辑未保存, 是否保存?', 
			sessionName:'', 
			onYes:()=>{
				editorCache.save();
				remove();
			}, 
			onNo:()=>{
				remove();
			}
		});
	} else {
		remove();
	}
	//refresh UI
	// _refreshFavoritesBody();
}; 

let _removeSearchEditor = (onDispose) => {
	try {
		if(!_searchEditorFavorites) {
			onDispose && onDispose();
			return;
		}
		let isSaved = _searchEditorFavorites.isSaved();
		let remove = () => {
				_searchEditorFavorites.dispose();
				_searchEditorFavorites = null;	
				$('.favorites .detail-panel').remove();
		};
		if(!isSaved) {
			new ConfirmModal({
				title:'编辑未保存, 是否保存?', 
				sessionName:'', 
				onYes:()=>{
					_searchEditorFavorites.save();
					remove();
					onDispose && onDispose();
				}, 
				onNo:()=>{
					remove();
					onDispose && onDispose();
				}
			});
		} else {
			remove();
			onDispose && onDispose();
		}
	} catch(e) {
		console.error(e);
	}
}

let _reSearch = (dataObj, cb, {favoriteFolder=''}) => {  //当从收藏夹过来的 favoriteFolder 为收藏夹名
	let actions = require('../flux/actions');
	dataObj.favoriteFolder = favoriteFolder;
	// store.dispatch(actions.layoutActions.waitingForPatterns());
	// store.dispatch(actions.patternActions.resetError());
	store.dispatch(actions.patternActions.getPatterns(dataObj, cb));
};

let _handleDeleteOne = (e) => {
	let dataObj = $(e.target).closest('.history-item').data('data');
	let $wrapper = $(e.target).closest('.history-items-wrapper');
	let data = $wrapper.data();
	let type = data.type; //0:favorites, 1:history
	if(type == 0) {
		favoritesManager.deleteOneFavorite(data.meta.name, dataObj, false);
		$(e.target).closest('.history-item').addClass('hide');
	} else if(type == 1) { //历史记录, 暂时没用
		let resLen = deleteOneHistory(data.meta, dataObj);
		if(resLen == 0) {
			$(e.target).closest('.history-day-wrapper').remove();
		} else {
			$(e.target).closest('.history-item').remove();
		}
	} else if(type == 2) { //删除垃圾箱
		favoritesManager.deleteOneFavorite(null, dataObj, true);
		$(e.target).closest('.history-item').remove();
	}
	_updateTrashedNumber();
};

let _handleReSearch = ({favoriteFolder=''},event) => {
	let dataObj = $(event.target).closest('.history-item').data('data');
	_reSearch(dataObj, () => {
		// updateTradingviewAfterSearch(dataObj);
	}, {favoriteFolder});
};

let _handleDetail = (event) => {
	let dataObj = $(event.target).closest('.history-item').data('data');
	let bodyNode = $(event.target).closest('.body-container')[0];
	_createDetailPanel(bodyNode.parentNode, (bodyNode==_bodyDom ? 'history' : 'favorites'), dataObj);
};

let _handleRecoverPattern = (event) => {
	let $historyItem = $(event.target).closest('.history-item');
	let dataObj = $(event.target).closest('.history-item').data('data');
	if(favoritesManager.recoverOneFavorite(dataObj)) {
		$historyItem.remove();
		_updateTrashedNumber();
	}
};

let _handleAddFocus = (event) => {
	let $target = $(event.target);
	let $pattern = $(event.target.parentNode);
	let dataObj = $pattern.data('data');
	let folders = favoritesManager.getFavoritesFolders();

	let optionsNode = $(`<div class='add-favorites-popup'></div>`);
	folders.forEach((folder) => {
		let button = $(`<div>${folder}</div>`).click((e) => {
			favoritesController.addFavorites(folder, dataObj);
			$target.children().remove();
		});
		optionsNode.append(button);
	});
	$target.append(optionsNode);
};
let _handleAddBlur = (event) => {
	let $target = $(event.target);
	$target.children().remove();
};

let getIntervalString = (interval) => {
	interval = interval && interval.toUpperCase() || '';
	let isInterval = (type) => {
		return interval.indexOf(type) > -1;
	};
	let typeString = '';
	let num = parseInt(interval);
	num = isNaN(num) ? '' : num;
	if(isInterval('D')) {
		typeString = '天';
	} else if(isInterval('W')) {
		typeString = '周';
	} else if(isInterval('M')) {
		typeString = '月';
	} else {
		typeString = '分钟';
	}
	return `${num}<span class='font-simsun'>${typeString}数据</span>`;
};

let _generatePattern = (pattern, type) => { //type: 0 favorites, 1 history, 2 trashed
	let startDateStr = pattern.dateRange && new Date(pattern.dateRange[0]).toLocaleString('cn',{hour12:false}) || '',
			endDateStr = pattern.dateRange && new Date(pattern.dateRange[1]).toLocaleString('cn',{hour12:false}) || '';
	// startDateStr = startDateStr.slice(0, 19).replace(/-/g,'.').replace(/T/,' ');
	// endDateStr = endDateStr.slice(0, 19).replace(/-/g,'.').replace(/T/,' ');

	let state = pattern.state || {};

	let name = `<h2 class='name font-msyh'>${pattern.name||'未命名'}</h2>`;
	// let info = `<p class='header-info'>${pattern.symbol}     ${pattern.kline.length}根K线</p>`;
	let info = `<p class='header-info'><span class='strong'>${pattern.kline.length}</span>根K线</p>`;
	let addButton = (type==2) ? '' : `<button class='add-btn flat-btn ${type==1?"right":""}' data-kstooltip=${type==1?'收藏':'另存为'}>add</button>`;
	let deleteButton = (type == 0 || type == 2) ? `<button class='delete-btn flat-btn' data-kstooltip='删除'>delete</button>` : '';
	let hoverBtns = (type == 0) ? 
									`<span class='btn-overlay flex-around'><button class='flat-btn re-search' data-kstooltip='再次搜索'>再次搜索</button><button class='flat-btn go-detail' data-kstooltip='编辑K线'>编辑K线</button></span>`
									:
									(type == 1 ? `<span class='btn-overlay flex-around'><button class='flat-btn re-search' data-kstooltip='再次搜索'>再次搜索</button></span>` 
															: `<span class='btn-overlay flex-around'><button class='flat-btn recover' data-kstooltip='恢复'>恢复</button></span>`);

	let canvasDiv = `<div class='canvas-wrapper'><canvas class='kline' width='150' height='154' style='width:150px;height:154px'/>${hoverBtns}</div>`;
	// let range = `<span class='daterange-info font-number'>${startDateStr} ~ ${endDateStr}</span>`;
	// let footer = `<div class='btn-wrapper'><button class='re-search'>再次搜索</button><button class='go-detail'>查看详情</button></div>`;

	//favorites 和 history 不一样
	let describe = pattern.describe || pattern.symbol;
	let fromInfoContent = (type === 0 || type === 2) ? describe : (pattern.favoriteFolder ? `收藏夹/${pattern.favoriteFolder}` : `${describe}<br/>${startDateStr}<br/>${endDateStr}<br/>${getIntervalString(pattern.interval)}`); 
	let fromInfo = `<p class='from-info font-arial'><span class='font-simsun'>来源</span>:${fromInfoContent}</p>`;

	let favoriteFolder = (type === 0 ? _activeName : pattern.favoriteFolder) || '';

	let typeClass = (type === 0 || type ===2) ? 'favorites' : 'history';
	let trashClass = (type!=2 && state.isTrashed) ? 'hide' : '';//被删除
	let $node = $(`<div class='history-item font-simsun ${typeClass} ${trashClass}'>${name}${info}${addButton}${deleteButton}${canvasDiv}${fromInfo}</div>`);
			$node.data('data', pattern);

	let shoucangType = (type == 0) ? 2 : 1;
			$node.find('.add-btn').focus(handleShouCangFocus.bind(null, favoritesManager, favoritesController, pattern, {type:shoucangType})).blur(handleShouCangBlur); //添加到收藏夹
			$node.find('.delete-btn').click(_handleDeleteOne);
			$node.find('.re-search').click(_handleReSearch.bind(null,{favoriteFolder}));  //再次搜索
			$node.find('.go-detail').click(_handleDetail);  //再次搜索
			$node.find('.recover').click(_handleRecoverPattern);
			drawKline($node.find('canvas.kline')[0], pattern.kline, drawKlineOption);

	//init tooltip
	$node.find('[data-kstooltip]').ksTooltip();
	return $node;
};

let _generatePatterns = (dataArr, type, meta) => {  //dataArr:[{symbol, dateRange, kline}], type:0(fav) 1(history) 3(trashed), meta:object
	dataArr = dataArr.map ? dataArr : [dataArr];
	let patterns = dataArr.map((pattern) => {
		return _generatePattern(pattern, type);
	});
	// let concacted = patterns.reduce((pre, cur) => {
	// 	pre = cur + pre;
	// 	return pre;
	// }, '');
	let $node = $(`<div class='history-items-wrapper'></div>`);
			$node.append(patterns);
	$node.data({type: type, meta: meta});
	return $node;
};

let dateToString = (dateObj) => {
	let now = new Date();
	let yesterday = new Date(now - 1000*3600*24);
	let year = dateObj.getFullYear(),
			month = dateObj.getMonth(),
			date  = dateObj.getDate(),
			day = dateObj.getDay();
	let isToday = (year==now.getFullYear()) && (month==now.getMonth()) && (date==now.getDate());
	let isYesterday = (year==yesterday.getFullYear()) && (month==yesterday.getMonth()) && (date==yesterday.getDate());
	let dayChinese = ['日','一','二','三','四','五','六'];
	return year + '年' + (month+1) + '月' + date + '日 - 星期' + dayChinese[day] + (isToday ? '(今天)' : '') + (isYesterday ? '(昨天)' : '') ;
};

let _generateHistoryItem = (date, data) => {
	let patterns = _generatePatterns(data, 1, date);
	let dateStr = dateToString(date);
	return $(`<div class='history-day-wrapper'><h4 class='date-string'>${dateStr}</h4></div>`).append(patterns);
};

let historyController = {};
let _navDom = null;
let _bodyDom = null;
// console.debug('_navDom is null -0-0-0-0-');
let _initDayDom = ($dayDom, dataArr) => {
	let $canvas = $dayDom.find('canvas.kline');
	for(let i=0, len=$canvas.length; i<len; i++) {
		let canvasDom = $canvas[i];
		drawKline(canvasDom, dataArr[i].kline, {volume:true, volumeHeight:true});
	}
};

let _removeHistroiesByMonth = (year, month) => {
	let items = $(_bodyDom).find('.history-day-wrapper');
	let len = items.length;
	try {
		for(let i=0; i<len; i++) {
			let $item = $(items[i]);
			let date = $item.data().date;
			if(date && date.getFullYear() == year && (date.getMonth()+1 == month)) {
				$item.remove();
			}
		}
	} catch(e) {
		console.error(e);
	}
};

let _handleDeleteHistoryByMonth = (event) => {
	event.stopPropagation();
	let $item = $(event.target).closest('.month');
	let { year, month } = $item.data();
	new ConfirmModal({
		title:`确认删除${year}-${month}历史记录?`, 
		sessionName:'history-month-delete', 
		onYes:() => {
			deleteHistory(year, month);
			_removeHistroiesByMonth(year, month);
			$item.remove();
		}
	});
};

let __findFirstHistoryByDate = function(year, month) {
	let allHistoryDayWrapper = $(_bodyDom).find('.history-day-wrapper');

	let matchNode = null;
	for(let i=0; i<allHistoryDayWrapper.length; i++) {
		let one = $(allHistoryDayWrapper[i]);
		// console.log(one);
		let date = new Date(one.data().date);
		if(date.getFullYear() == year && (date.getMonth() + 1 == month)){
			matchNode = allHistoryDayWrapper[i];
			break;
		}
	}
	return matchNode;
}

let _handleGotoMonth = function(event) {
	let $currentTarget = $(event.currentTarget);
	let {year, month} = $currentTarget.data();
	if(typeof year == 'undefined' || typeof month == 'undefined') return;
	// try {
		let matchNode = __findFirstHistoryByDate(year, month);
		// console.log(matchNode);
		if(matchNode) {
			matchNode.scrollIntoView();
		}
		$currentTarget.siblings().removeClass('active');
		$currentTarget.addClass('active');
	// } catch(e) {
		// console.error(e);
	// }
}

let _setAcitveMonth = function(activeYear, activeMonth) {
	var pMonthDoms = $(_navDom).find('p.month');
	pMonthDoms && pMonthDoms.each(function(i, monthDom){
		let $dom = $(monthDom);
		let {year, month} = $dom.data();
		if(year==activeYear && month==activeMonth) {
			$dom.siblings().removeClass('active');
			$dom.addClass('active');
		}
	});
}

let _handleHistoryScroll = function(e) {
	var historyMonth = getSortedHistoryMonth();
	var len = historyMonth.length;
	for(let i=1; i<len; i++) {
		let date0 = new Date(historyMonth[i-1]);
		let date1 = new Date(historyMonth[i]);
		let dom0 = __findFirstHistoryByDate(date0.getFullYear(), date0.getMonth()+1);
		let dom1 = __findFirstHistoryByDate(date1.getFullYear(), date1.getMonth()+1);
		let top0 = $(dom0).offset().top;
		let top1 = $(dom1).offset().top;
		if(i==len-1 && top1 <= 50) { //last one
			_setAcitveMonth(date1.getFullYear(), date1.getMonth()+1)
		} else if(top0 <= 50 && top1 > 50) {
			_setAcitveMonth(date0.getFullYear(), date0.getMonth()+1)
		}
		// console.log(date.getMonth()+1, $(dom).offset());
	}
}

historyController.init = (navDom, bodyDom) => {
	_navDom = navDom;
	_bodyDom = bodyDom;
	let $navDom = $(navDom);
	let $bodyDom = $(bodyDom);
	$navDom.empty();
	$bodyDom.empty();
	getAllFilesFromStorage();
	let historyMonth = getSortedHistoryMonth();
	let historyDataByMonth = historyMonth.map((yearMonth) => {
		return getSortedMonthData(yearMonth);
	}); 
	// console.log(historyDataByMonth);

	historyMonth.forEach((histroyDateName, i) => { //'2012-12'
		let date = new Date(histroyDateName);
		let _year = date.getFullYear();
		let _month = date.getMonth() + 1;

		// if(year !== _year) {
		// 	$dom.append(`<h6 class='year'>${_year}</h6>`);
		// 	year = _year;
		// }
		let itemNode = $(`<p class='month font-simsun'><span class='name'>${_month}月</span></p>`).data({year:_year, month:_month})
											.append($('<button class="flat-btn delete">delete</button>').click(_handleDeleteHistoryByMonth))
											.on('click', _handleGotoMonth);
		if(i==0) itemNode.addClass('active');
		$navDom.append(itemNode);
	});

	let now = new Date();
	let nowYear = now.getFullYear(),
			nowMonth = now.getMonth(),
			nowDay = now.getDate();

	historyDataByMonth.forEach((dataByMonth) => {
		let yearMonth = dataByMonth.yearMonth;
		let sortedDays = dataByMonth.keys;
		let data = dataByMonth.data;
		sortedDays.forEach((key) => {
			// console.log(yearMonth, key, data[key]);
			let day = key.replace('.json','');
			let theDate = new Date(`${yearMonth}-${day}`);
			let newDomStr = _generateHistoryItem(theDate, data[key].data);
			let $newDom = $(newDomStr);

			$newDom.data('date', theDate);
			// _initDayDom($newDom, data[key].data);
			
			$bodyDom.append($newDom);
		});
	});

	$bodyDom.on('scroll', _handleHistoryScroll);
	// _initEventAndPaint($navDom, $bodyDom);
};

historyController.updateNavContainer = (dom) => {
	let $dom = $(dom);
	let historyMonth = getSortedHistoryMonth();
	if($dom.find('.month').length < historyMonth.length) {
		$dom.empty();
		// let year = '';
		historyMonth.forEach((histroyDateName) => { //'2012-12'
			let date = new Date(histroyDateName);
			let _year = date.getFullYear();
			let _month = date.getMonth() + 1;

			// if(year !== _year) {
			// 	$dom.append(`<h6 class='year'>${_year}</h6>`);
			// 	year = _year;
			// }
			$dom.append(`<p class='month font-simsun'>${_month}</p>`);
		});
	}
};

let _isSameDate = (date1, date2) => {
		return (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate())
};
//添加左侧月份导航
let _insertHistoryMonth = (date) => {
	let _year = date.getFullYear();
	let _month = date.getMonth() + 1;
	let $navDom = $(_navDom);
	let firstItem = $navDom.find('p.month:first-child');
	let firstItemDate = firstItem.date();
	if(firstItemDate && firstItemDate.year == _year && firstItemDate.month == _month) {
		return;
	}
	let itemNode = $(`<p class='month font-simsun'><span class='name'>${_month}月</span></p>`).data({year:_year, month:_month})
									.append($('<button class="flat-btn delete">delete</button>').click(_handleDeleteHistoryByMonth))
									.on('click', _handleGotoMonth);
	itemNode.addClass('active');
	$navDom.find('p.month').removeClass('active');
	$navDom.prepend(itemNode);
};
//插入历史记录
let _addNewDayWrapper = (data, isInsert, $wrapper0) => {  //插入历史
	if(isInsert) {
		let $newHistoryItem = $(_generatePattern(data, 1));
		drawKline($newHistoryItem.find('canvas')[0], data.kline, drawKlineOption);
		$wrapper0.find('.history-items-wrapper').prepend($newHistoryItem);
	}else {
		// let $newWrapper = $(_generatePatterns(data, 1, new Date()));
		// $newWrapper.data('date', new Date());
		let now = new Date();
		let $historyItem = _generateHistoryItem(now, data);
		$historyItem.data('date', now);
		$(_bodyDom).prepend($historyItem);
		//添加导航栏
		_insertHistoryMonth(now);
	}
};

let _updateBodyContainer = (bodyDom, data) => {
	bodyDom = bodyDom || _bodyDom;
	let $bodyDom = $(bodyDom);
	console.assert($bodyDom, 'no bodyDom!!');
	let $dayWrappers = $bodyDom.find('.history-day-wrapper');
	let $dayWrapper0 = 	$dayWrappers[0] && $($dayWrappers[0]);
	if($dayWrapper0) {
		let thatDate = $dayWrapper0.data('date');
		let now = new Date();
		if(_isSameDate(thatDate, now)) { //同一天
			_addNewDayWrapper(data, true, $dayWrapper0);
		} else { 
			_addNewDayWrapper(data, false);
		}
		
	} else {  //没有Dom
		_addNewDayWrapper(data, false);
	}
};

historyController.pushHistory = (historyObj) => {
	pushHistory(historyObj); //数据
	_updateBodyContainer(null, historyObj);
};

/****************************************/

let favoritesController = {};
let _navDomF = null;
let _bodyDomF = null;
let _activeName = '';

let _handleFolderClick = (event) => {
	let onDispose = () => {
		let $item = $(event.target).closest('.favorites-folder');
		let data = $item.data('data');
		let name = $item.data('name');
		if(_activeName == name) return;
		$item.siblings('.favorites-folder').removeClass('active');
		$item.addClass('active');
		let $bodyDom = $(_bodyDomF);
		_activeName = name;
		$bodyDom.empty();
		$bodyDom.append(_generatePatterns(data, 0, {name:name}));

		$(_navDomF).siblings('.trash-panel-btn').removeClass('active');
	};

	//移除编辑器
	_removeSearchEditor(onDispose);
};

let _refreshBodyItemUI = (ele) => {
	let $ele = $(ele);
	let data = $ele.data('data');
	let name = data.name || '未命名';
	let klineLen = data.kline.length;

	$ele.find('.name').text(name);
	$ele.find('.header-info').text(`${klineLen}根K线`);
	drawKline($ele.find('canvas.kline')[0], data.kline, drawKlineOption);
}

let _refreshFavoritesBody = () => {
	let $items = $(_bodyDomF).find('.history-item');
	$items.each(function(index, el) {
		_refreshBodyItemUI(el);
	});
};

let _handleDeleteFavoritesFolder = (event) => {
	event.stopPropagation();
	let $item = $(event.target).closest('.favorites-folder');
	let { fileName, name } = $item.data();
	let title = `确认删除"${name}"?`;
	new ConfirmModal({
		title, 
		sessionName: 'delete-favorite-folder', 
		onYes:() => {
			favoritesManager.deleteFavorites(fileName, (e, d) => {
				if(e) {
					console.error(e);
				} else {
					$item.remove();
					_showFolder(0); //显示默认
				}
			});
		}
	});
};
//收藏夹重命名
let _handleRenameFolder = (event) => {
	//先移除其他的rename 框
	$(event.target).closest('.nav-item-container').find('.rename-input-container').remove();
	event.stopPropagation();
	let $folderNode = $(event.target).closest('.favorites-folder');
	let data = $folderNode.data();
	let { name } = data;
	let $inputGroup = $(`<div class='ks-input-wrapper border'><input /><span class='flat-btn button ks-check ks-disable'>check</span><span class='flat-btn button ks-delete'>delete</span></div>`);
	let $renameInput = $(`<div class='rename-input-container'></div>`).append($inputGroup);
	
	$folderNode.after($renameInput);

	$inputGroup.find('input').focus().on('input', (event)=>{
		var folderName = event.currentTarget.value;
		if(folderName === '' || favoritesController.hasFavoriteFolder(folderName)) {
			$inputGroup.find('.ks-check').addClass('ks-disable');
		} else {
			$inputGroup.find('.ks-check').removeClass('ks-disable');
		}
	});

	$inputGroup.find('.ks-check').click(function(event) {
		/* Act on the event */
		if($(event.currentTarget).hasClass('ks-disable')) return;
		let oldName = $folderNode.data('name');
		let newName = $inputGroup.find('input').val();
		newName = newName.trim();
		if(newName && favoritesManager.renameFavorites(oldName, newName)) {
			$folderNode.find('.name').text(newName);
			$folderNode.data('name', newName);
			if(_activeName == oldName) {
				_activeName = newName;
			}
		}
		$renameInput.remove();
	});
	$inputGroup.find('.ks-delete').click(function(event) {
		/* Act on the event */
		$renameInput.remove();
	});
};

let _generateFolderNode = (fileName, {name, data}) => {
	let $dom = $(`<h6 class='favorites-folder font-simsun'><span class='name'>${name}<span></h6>'`)
						.append($(`<button class='flat-btn delete'>delete</button>`).click(_handleDeleteFavoritesFolder))
						.append($(`<button class='flat-btn rename'>rename</button>`).click(_handleRenameFolder));

	$dom.data('fileName', fileName).data('name', name).data('data', data);
	$dom.click(_handleFolderClick);
	return $dom;
};

let _showFolder = (index) => {
	// if(index < 0) return;
	let folderNodes = $(_navDomF).find('.favorites-folder');
	folderNodes.removeClass('active');
	if(index == -1) { //show trashed patterns
		_activeName = '';
		folderNodes.removeClass('active');
	} else if (index < folderNodes.length) {
		$(folderNodes[index]).addClass('active');
		let data = $(folderNodes[index]).data('data');
		let name = $(folderNodes[index]).data('name');
		let $bodyDom = $(_bodyDomF);
		_activeName = name;
		$bodyDom.empty();
		$bodyDom.append(_generatePatterns(data, 0, {name:name}));
	}
};

let _updateTrashedNumber = () => {
	let trashedNum = favoritesManager.getTrashedDataLength();
	let $navDomF = $(_navDomF);
	$navDomF.siblings('.trash-panel-btn').find('.trash-number').text(trashedNum);
};

favoritesController.init = (navDom, bodyDom) => {
	_navDomF = navDom;
	_bodyDomF = bodyDom;
	let $navDom = $(navDom);
	let $bodyDom = $(bodyDom);
	$navDom.empty();
	$bodyDom.empty();

	favoritesManager.getAllDataFromStorage(); //初始化
	
	let  { filesName, dataArray } = favoritesManager.getFavoritesList();
	filesName.forEach((fileName, i) => {
		let folderNode = _generateFolderNode(fileName, dataArray[i]);
		$navDom.append(folderNode);
	});

	_showFolder(0); //显示第一个
	_updateTrashedNumber();
};

let _prependFavoritesBody = (dataObj) => {
	$(_bodyDomF).find('.history-items-wrapper').prepend(_generatePattern(dataObj, 0));
};

favoritesController.addFavorites  = (name, dataObj) => {
	let dataCopy = $.extend(true, {}, dataObj);
	
	//添加数据
	favoritesManager.addFavorites(name, dataCopy);
	//更新UI
	if(name == _activeName) {
		_prependFavoritesBody(dataCopy);
	}
};

favoritesController.updateFavorites = (dataObj) => {
	favoritesManager.updateFavorites(null, dataObj, true); //更新数据
	// 更新UI
	_refreshFavoritesBody();
};

favoritesController.addNewFolder = (name) => {
	let {fileName, initData} = favoritesManager.addNewClass(name);
	if(fileName) {
		let folderNode = _generateFolderNode(fileName, initData);
		$(_navDomF).append(folderNode);
	}
};

favoritesController.getActiveName = () => {
	return	_activeName;
};

favoritesController.showTrashedPatterns = (e) => {
	_showFolder(-1);
	$(e.currentTarget).addClass('active');
	let trashedData = favoritesManager.getTrashedData();
	let $bodyDom = $(_bodyDomF);
	$bodyDom.empty();
	$bodyDom.append(_generatePatterns(trashedData, 2));
}

favoritesController.clearTrashedPatterns = () => {
	new ConfirmModal({
		title:'清空回收站?', 
		sessionName:'clear-trashed-patterns', 
		onYes:() => {
			if(favoritesManager.clearTrashedFavorites()) {
				_updateTrashedNumber();
				let $bodyDom = $(_bodyDomF);
				let trashedData = [];
				$bodyDom.empty();
				$bodyDom.append(_generatePatterns(trashedData, 2));
			}
		}
	});
};

favoritesController.hasFavoriteFolder = (folderName) => {
	return favoritesManager.hasFavoriteFolder(folderName);
};

favoritesController.setEditorSaved = () => {
	try {
		_searchEditorFavorites.setSaved();
		_searchEditorFavorites.save();
	} catch (e) {
		console.error(e);
	}
};

module.exports = {
	historyController,
	favoritesController
};

