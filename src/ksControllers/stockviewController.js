
import { getSortedHistoryMonth, getSortedMonthData, pushHistory, getAllFilesFromStorage, deleteHistory, deleteOneHistory } from '../backend/historyManager';
import favoritesManager from '../backend/favoritesManager';
import store from '../store';
import { drawKline } from './painter';
import SearchEditor from './SearchEditor';
import actionTradingview from '../shared/actionTradingview';
import { handleShouCangFocus, handleShouCangBlur } from './publicHelper';

let { updateTradingviewAfterSearch } = actionTradingview;

let _searchEditorHistory = null;
let _searchEditorFavorites = null;

//显示K线编辑器
let _createDetailPanel = (parentDom, editorCache, dataObj) => {
	let editorContainer = $(`<div class='search-editor-container'></div>`);
	let $newDom = $(`<div class='detail-panel'><div class='head-nav'><button class='flat-btn font-simsun return'><span class='icon-return'></span>返回</button></div></div>`).append(editorContainer);
	$newDom.find('button.return').click((event) => { //返回
		_disposeDetailPanel(parentDom, editorCache);
	});
	$(parentDom).append($newDom);
	editorCache = new SearchEditor(editorContainer, dataObj, favoritesManager, favoritesController);
};

let _disposeDetailPanel = (parentDom, editorCache) => {
	editorCache.dispose();
	editorCache = null;
	$(parentDom).find('.detail-panel').remove();
	//refresh UI
	// _refreshFavoritesBody();
}; 

let _reSearch = (dataObj, cb) => {
	let actions = require('../flux/actions');
	store.dispatch(actions.layoutActions.waitingForPatterns());
	store.dispatch(actions.patternActions.resetError());
	store.dispatch(actions.patternActions.getPatterns(dataObj, cb));
};

let _handleDeleteOne = (e) => {
	let dataObj = $(e.target).closest('.history-item').data('data');
	let $wrapper = $(e.target).closest('.history-items-wrapper');
	let data = $wrapper.data();
	let type = data.type; //0:favorites, 1:history
	if(type == 0) {
		favoritesManager.deleteOneFavorite(data.meta.name, dataObj);
		$(e.target).closest('.history-item').remove();
	} else if(type == 1) {
		let resLen = deleteOneHistory(data.meta, dataObj);
		if(resLen == 0) {
			$(e.target).closest('.history-day-wrapper').remove();
		} else {
			$(e.target).closest('.history-item').remove();
		}
	}
};

let _handleReSearch = (event) => {
	let dataObj = $(event.target).closest('.history-item').data('data');
	_reSearch(dataObj, () => {
		updateTradingviewAfterSearch(dataObj);
	});
};

let _handleDetail = (event) => {
	let dataObj = $(event.target).closest('.history-item').data('data');
	let bodyNode = $(event.target).closest('.body-container')[0];
	_createDetailPanel(bodyNode.parentNode, (bodyNode==_bodyDom ? _searchEditorHistory : _searchEditorFavorites), dataObj);
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

let _generatePattern = (pattern, type) => {
	let startDateStr = pattern.dateRange && new Date(pattern.dateRange[0]).toISOString() || '',
			endDateStr = pattern.dateRange && new Date(pattern.dateRange[1]).toISOString() || '';
	startDateStr = startDateStr.slice(0, 10).replace(/-/g,'.');
	endDateStr = endDateStr.slice(0, 10).replace(/-/g,'.');

	let name = `<h2 class='name font-msyh'>${pattern.name||'未命名'}</h2>`;
	// let info = `<p class='header-info'>${pattern.symbol}     ${pattern.kline.length}根K线</p>`;
	let info = `<p class='header-info'><span class='strong'>${pattern.kline.length}</span>根K线</p>`;
	let addButton = `<button class='add-btn flat-btn'>add</button>`;
	let deleteButton = `<button class='delete-btn flat-btn'>delete</button>`;
	let hoverBtns = (type == 0) ? 
									`<span class='btn-overlay flex-around'><button class='flat-btn re-search'>重新搜索</button><button class='flat-btn go-detail'>查看详情</button></span>`
									:
									`<span class='btn-overlay flex-around'><button class='flat-btn re-search'>重新搜索</button></span>`;

	let canvasDiv = `<div class='canvas-wrapper'><canvas class='kline' width='150' height='120' style='width:150px;height:120px'/>${hoverBtns}</div>`;
	// let range = `<span class='daterange-info font-number'>${startDateStr} ~ ${endDateStr}</span>`;
	// let footer = `<div class='btn-wrapper'><button class='re-search'>重新搜索</button><button class='go-detail'>查看详情</button></div>`;
	let fromInfo = `<p class='from-info'>来源:${pattern.symbol}</p>`;

	let $node = $(`<div class='history-item font-simsun'>${name}${info}${addButton}${deleteButton}${canvasDiv}${fromInfo}</div>`);
			$node.data('data', pattern);

			$node.find('.add-btn').focus(handleShouCangFocus.bind(null, favoritesManager, favoritesController, pattern, {type:2})).blur(handleShouCangBlur); //添加到收藏夹
			$node.find('.delete-btn').click(_handleDeleteOne);
			$node.find('.re-search').click(_handleReSearch);  //重新搜索
			$node.find('.go-detail').click(_handleDetail);  //重新搜索
			drawKline($node.find('canvas.kline')[0], pattern.kline);

	return $node;
};

let _generatePatterns = (dataArr, type, meta) => {  //dataArr:[{symbol, dateRange, kline}], type:0(fav) 1(history), meta:object
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
	let dayChinese = ['一','二','三','四','五','六','日'];
	return year + '年' + (month+1) + '月' + date + '日 - 星期' + dayChinese[day-1] + (isToday ? '(今天)' : '') + (isYesterday ? '(昨天)' : '') ;
};

let _generateHistoryItem = (date, data) => {
	let patterns = _generatePatterns(data, 1, date);
	let dateStr = dateToString(date);
	return $(`<div class='history-day-wrapper'><h4 class='date-string'>${dateStr}</h4></div>`).append(patterns);
};

let historyController = {};
let _navDom = null;
let _bodyDom = null;
console.debug('_navDom is null -0-0-0-0-');
let _initDayDom = ($dayDom, dataArr) => {
	let $canvas = $dayDom.find('canvas.kline');
	for(let i=0, len=$canvas.length; i<len; i++) {
		let canvasDom = $canvas[i];
		drawKline(canvasDom, dataArr[i].kline);
	}
};

let _handleDeleteHistoryByMonth = (event) => {
	let $item = $(event.target).closest('.month');
	let { year, month } = $item.data();
	deleteHistory(year, month);
	$item.remove();
};

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
	console.log(historyDataByMonth);

	historyMonth.forEach((histroyDateName) => { //'2012-12'
		let date = new Date(histroyDateName);
		let _year = date.getFullYear();
		let _month = date.getMonth() + 1;

		// if(year !== _year) {
		// 	$dom.append(`<h6 class='year'>${_year}</h6>`);
		// 	year = _year;
		// }
		$navDom.append($(`<p class='month font-simsun'><span class='name'>${_month}月</span></p>`).data({year:_year, month:_month}).append($('<button class="flat-btn delete">delete</button>').click(_handleDeleteHistoryByMonth)));
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
			console.log(yearMonth, key, data[key]);
			let day = key.replace('.json','');
			let theDate = new Date(`${yearMonth}-${day}`);
			let newDomStr = _generateHistoryItem(theDate, data[key].data);
			let $newDom = $(newDomStr);

			$newDom.data('date', theDate);
			// _initDayDom($newDom, data[key].data);
			
			$bodyDom.append($newDom);
		});
	});

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

let _addNewDayWrapper = (data, isInsert, $wrapper0) => {  //插入历史
	if(isInsert) {
		let $newHistoryItem = $(_generatePattern(data, 1));
		drawKline($newHistoryItem.find('canvas')[0], data.kline);
		$wrapper0.find('.history-items-wrapper').prepend($newHistoryItem);
	}else {
		let $newWrapper = $(_generatePatterns([dat, 0, a], 1, new Date()));
		$newWrapper.data('date', new Date());
		$(_bodyDom).prepend($newWrapper);
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
	let $item = $(event.target).closest('.favorites-folder');
	let data = $item.data('data');
	let name = $item.data('name');
	if(_activeName == name) return;
	let $bodyDom = $(_bodyDomF);
	_activeName = name;
	$bodyDom.empty();
	$bodyDom.append(_generatePatterns(data, 0, {name:name}));
};

let _refreshBodyItemUI = (ele) => {
	let $ele = $(ele);
	let data = $ele.data('data');
	let name = data.name || '未命名';
	let klineLen = data.kline.length;

	$ele.find('.name').text(name);
	$ele.find('.header-info').text(`${klineLen}根K线`);
	drawKline($ele.find('canvas.kline')[0], data.kline);
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
	let { fileName } = $item.data();
	favoritesManager.deleteFavorites(fileName, (e, d) => {
		if(e) {
			console.error(e);
		} else {
			$item.remove();
			_showFolder(0); //显示默认
		}
	});
};

let _generateFolderNode = (fileName, {name, data}) => {
	let $dom = $(`<h6 class='favorites-folder font-simsun'><span class='name'>${name}<span></h6>'`)
						.append($(`<button class='flat-btn delete'>delete</button>`).click(_handleDeleteFavoritesFolder))
						.append($(`<button class='flat-btn rename'>rename</button>`));

	$dom.data('fileName', fileName).data('name', name).data('data', data);
	$dom.click(_handleFolderClick);
	return $dom;
};

let _showFolder = (index) => {
	if(index < 0) return;
	let folderNodes = $(_navDomF).find('.favorites-folder');
	if(index < folderNodes.length) {
		let data = $(folderNodes[index]).data('data');
		let name = $(folderNodes[index]).data('name');
		let $bodyDom = $(_bodyDomF);
		_activeName = name;
		$bodyDom.empty();
		$bodyDom.append(_generatePatterns(data, 0, {name:name}));
	}
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

};

let _prependFavoritesBody = (dataObj) => {
	$(_bodyDomF).find('.history-items-wrapper').prepend(_generatePattern(dataObj, 0));
};

favoritesController.addFavorites  = (name, dataObj) => {
	//添加数据
	favoritesManager.addFavorites(name, dataObj);
	//更新UI
	if(name == _activeName) {
		_prependFavoritesBody(dataObj);
	}
};

favoritesController.updateFavorites = (dataObj) => {
	favoritesManager.addFavorites(_activeName, dataObj); //更新数据
	// 更新UI
	_refreshFavoritesBody();
};

favoritesController.addNewFolder = (name) => {
	let {fileName, initData} = favoritesManager.addNewClass(name);
	let folderNode = _generateFolderNode(fileName, initData);
	$(_navDomF).append(folderNode);
};

favoritesController.getActiveName = () => {
	return	_activeName;
};

module.exports = {
	historyController,
	favoritesController
};

