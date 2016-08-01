
import { getSortedHistoryMonth, getSortedMonthData, pushHistory, getAllFilesFromStorage, deleteHistory } from '../backend/historyManager';
import favoritesManager from '../backend/favoritesManager';
import store from '../store';
import { drawKline } from './painter';
import SearchEditor from './SearchEditor';
import actionTradingview from '../shared/actionTradingview';
let { updateTradingviewAfterSearch } = actionTradingview;

let _searchEditorHistory = null;
let _searchEditorFavorites = null;

//显示K线编辑器
let _createDetailPanel = (parentDom, editorCache, dataObj) => {
	let editorContainer = $(`<div class='search-editor-container'></div>`);
	let $newDom = $(`<div class='detail-panel'><div><button class='return'>返回</button></div></div>`).append(editorContainer);
	$newDom.find('button.return').click((event) => { //返回
		_disposeDetailPanel(parentDom, editorCache);
	});
	$(parentDom).append($newDom);
	editorCache = new SearchEditor(editorContainer, dataObj);
};

let _disposeDetailPanel = (parentDom, editorCache) => {
	editorCache.dispose();
	editorCache = null;
	$(parentDom).find('.detail-panel').remove();
}; 

let _reSearch = (dataObj, cb) => {
	let actions = require('../flux/actions');
	store.dispatch(actions.layoutActions.waitingForPatterns());
	store.dispatch(actions.patternActions.resetError());
	store.dispatch(actions.patternActions.getPatterns(dataObj, cb));
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

	let optionsNode = $(`<div style='position:absolute'></div>`);
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

let _generatePattern = (pattern) => {
	let info = `<div>${pattern.symbol}</div>`;
	let button = `<button class='add-btn'>add</button>`;
	let canvas = `<canvas class='kline' width='300' height='130' style='width:300px;height:130px'/>`;
	let range = `<div></div>`;
	let footer = `<div><button class='re-search'>重新搜索</button><button class='go-detail'>查看详情</button></div>`;
	let $node = $(`<div class='history-item'>${info}${button}${canvas}${range}${footer}</div>`);
			$node.data('data', pattern);

			$node.find('.add-btn').focus(_handleAddFocus).blur(_handleAddBlur); //添加到收藏夹
			$node.find('.re-search').click(_handleReSearch);  //重新搜索
			$node.find('.go-detail').click(_handleDetail);  //重新搜索
			drawKline($node.find('canvas.kline')[0], pattern.kline);

	return $node;
};

let _generatePatterns = (dataArr) => {  //dataArr:[{symbol, dateRange, kline}]
	let patterns = dataArr.map((pattern) => {
		return _generatePattern(pattern);
	});
	// let concacted = patterns.reduce((pre, cur) => {
	// 	pre = cur + pre;
	// 	return pre;
	// }, '');
	let $node = $(`<div class='history-items-wrapper'></div>`);
			$node.append(patterns);
	return $node;
};

let _generateHistoryItem = (date, data) => {
	let patterns = _generatePatterns(data);
	return $(`<div class='history-day-wrapper'><h5>${date}</h5></div>`).append(patterns);
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
		$navDom.append($(`<p class='month'><span>${_month}月</span></p>`).data({year:_year, month:_month}).append($('<button>delete</button>').click(_handleDeleteHistoryByMonth)));
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
			$dom.append(`<p class='month'>${_month}</p>`);
		});
	}
};

let _isSameDate = (date1, date2) => {
		return (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate())
};

let _addNewDayWrapper = (data, isInsert, $wrapper0) => {  //插入历史
	if(isInsert) {
		let $newHistoryItem = $(_generatePattern(data));
		drawKline($newHistoryItem.find('canvas')[0], data.kline);
		$wrapper0.find('.history-items-wrapper').prepend($newHistoryItem);
	}else {
		let $newWrapper = $(_generatePatterns([data]));
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
	$bodyDom.append(_generatePatterns(data));
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
	let $dom = $(`<h6 class='favorites-folder'><span>${name}<span></h6>'`).append($(`<button>delete</button>`).click(_handleDeleteFavoritesFolder));
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
		$bodyDom.append(_generatePatterns(data));
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
	$(_bodyDomF).find('.history-items-wrapper').prepend(_generatePattern(dataObj));
};

favoritesController.addFavorites  = (name, dataObj) => {
	//添加数据
	favoritesManager.addFavorites(name, dataObj);
	//更新UI
	if(name == _activeName) {
		_prependFavoritesBody(dataObj);
	}
};

favoritesController.addNewFolder = (name) => {
	let {fileName, initData} = favoritesManager.addNewClass(name);
	let folderNode = _generateFolderNode(fileName, initData);
	$(_navDomF).append(folderNode);
};

module.exports = {
	historyController,
	favoritesController
};

