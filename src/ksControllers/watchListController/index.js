
import WatchList from './WatchList';
import WatchlistDropDown from './WatchlistDropDown';

var _watchList = null;
var _watchListDropdown = null;

var watchListController = {};
var _$headerDom = null;
var _$bodyDom = null;

watchListController.init = (wrapper) => {
	if($(wrapper).find('.watchlist-body-wrapper').length > 0) {
		return;
	}
	_$headerDom = $(`<div class="watchlist-header-wrapper"><strong class="title strong">智能监控</strong><span class="config-info">根据近期  <span role="config-data">-</span> 根  <span role="config-data">-</span> 线 统计后向 <span role="config-data">-</span>根</span><span class="update hide">实时监测中</span></div>`)
								.append(`<div class="pull-right widget-wrapper edit-watchlist"><button role="edit-watchlist" class="flat-btn border-btn">编辑列表</button></div>`)
								.append(`<div class="pull-right widget-wrapper edit-searchConfig"><button role="edit-searchConfig" class="flat-btn border-btn">设置搜索条件</button></div>`)
	
	_$bodyDom = $(`<div class="watchlist-body-wrapper"></div>`);
	$(wrapper).append(_$headerDom).append(_$bodyDom);
	_watchList = new WatchList({dom: _$bodyDom});

	window._watchList = _watchList;
	watchListController._udpateConfigUI();
	watchListController._initActions();
};
watchListController._udpateConfigUI = () => {
	var searchConfig = _watchList.getSearchConfig();
	var resolution = _watchList.getResolution();
	var baseBars = _watchList.getBasebars();
	var $configInfoDoms = _$headerDom.find('[role="config-data"]');
	$configInfoDoms[0].innerHTML = baseBars;
	$configInfoDoms[1].innerHTML = resolution == 'D' ? '日' : '分钟';
	$configInfoDoms[2].innerHTML = searchConfig.additionDate.value;
}
watchListController._initActions = () => {

	var $editWatchlist = _$headerDom.find('.widget-wrapper.edit-watchlist');
	_watchListDropdown = new WatchlistDropDown({
														dom:$editWatchlist,
														watchList: _watchList,
													});
	window.watchlistDropDown = _watchListDropdown;

	var $editSearchConfig = _$headerDom.find('.widget-wrapper.edit-searchConfig');
	$editSearchConfig.on('click', function(event) {
		var ConfigEditor = require('../ConfigEditor');
		var searchConfig = _watchList.getSearchConfig();
		var resolution = _watchList.getResolution();
		var baseBars = _watchList.getBasebars();
		//创建模态对话框
		var configEditor = new ConfigEditor(null, searchConfig, null, _watchList);
		configEditor.onSave(function({searchConfig, resolution, baseBars}){
			_watchList.updateConfig({searchConfig, resolution, baseBars});
			watchListController._udpateConfigUI();
		});
	});
	//尝试解决双重scroll的bug
	_$bodyDom.on('mousewheel',function(e){
		// console.log(e,'mousewheel');
		// var $target = $(e.target);
		// var $parent = $target.parent();
		// if($(e.currentTarget).hasClass('watchlist-body-wrapper')) {
		// 	if($target.hasClass('symbol-item') || $target.hasClass('symbol-list-container') || $parent.hasClass('symbol-item') || $parent.hasClass('symbol-list-container')) {
		// 		e.preventDefault();
		// 	}
		// }
	});
	// setTimeout(function(){
	// 	var ConfigEditor = require('../ConfigEditor');
	// 	var searchConfig = _watchList.getSearchConfig();
	// 	var resolution = _watchList.getResolution();
	// 	var baseBars = _watchList.getBasebars();
	// 	//创建模态对话框
	// 	var configEditor = new ConfigEditor(null, searchConfig, null, _watchList);
	// },300);
}

module.exports = watchListController;