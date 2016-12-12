
function WatchlistDropDown(config) {
	this._$wrapper = config.dom;
	this._$submit = this._$wrapper.find('[role="edit-watchlist"]');
	this._watchList = config.watchList;
	this._unDoStack = [];
	this._actvieIndex = 0;
	this._removedNodeCache = [];
	this._initDoms();
	this._updateList();
}

WatchlistDropDown.prototype._initDoms = function() {
	this._$headerWrapper = $(`<div class="header-wrapper"><button role="undo" class="flat-btn icon-btn-30 icon-undo"></button></button><button class="flat-btn icon-btn-30 icon-close pull-right"></button><button class="flat-btn icon-btn-30 icon-trash pull-right"></div>`);
	this._$bodyWrapper = $(`<div class="body-wrapper"></div>`);
	this._$footerWrapper = $(`<div class="footer-wrapper"><button class="flat-btn save">保存</button><button class="flat-btn cancel">撤销</button></div>`);
	this._$container = $(`<div class="watch-list-dropdown"><div>`)
											.append(this._$headerWrapper)
											.append(this._$bodyWrapper)
											.append(this._$footerWrapper)

	this._$wrapper.append(this._$container);
	this._$undoBtn = this._$headerWrapper.find('[role="undo"]');

	var that = this;
	this._$submit.on('click', function(e){
		that._show();
	});
	this._$headerWrapper.find('.icon-close').on('click', this._handleCancel.bind(this));
	this._$headerWrapper.find('.icon-trash').on('click', this._deleteActive.bind(this));
	this._$undoBtn.on('click', this._unDo.bind(this));
	this._$footerWrapper.find('.save').on('click', this._handleSave.bind(this));
	this._$footerWrapper.find('.cancel').on('click', this._handleCancel.bind(this));
}
WatchlistDropDown.prototype._handleSave = function() {
	this._watchList.updateList(this._list);
}
WatchlistDropDown.prototype._handleCancel = function() {
	this._hide();
}
WatchlistDropDown.prototype._submitClick = function() {

}
WatchlistDropDown.prototype._resetUndoStack = function() {
	this._unDoStack = [];
	this._removedNodeCache = [];
}
WatchlistDropDown.prototype._pushUndoStack = function() {
	//copy
	this._unDoStack.push(this._list.map(function(item){ return window.Object.assign({},item); }));
}
WatchlistDropDown.prototype._unDo = function() {
	var lastList = this._unDoStack.pop();
	if(lastList) {
		var lastLen = lastList.length;
		//比较lastList 和 this._list
		if(lastLen == this._list.length) { 													//恢复顺序
			var listDoms = this._$bodyWrapper.find('.watch-list-item');
			var listDomsSorted = [];
			for(var i=0; i<lastLen; i++) {
				var symbolInfo = lastList[i].symbolInfo;
				this._list[i].symbolInfo = symbolInfo;
				//p
				for(var j=0; j<listDoms.length; j++) {
					if($(listDoms[j]).data().symbol == symbolInfo.symbol) {
						listDomsSorted[i] = $(listDoms[j]);
						listDoms.splice(j,1);
						break;
					}
				}
			}
			//update UI
			for(var j=1; j<listDomsSorted.length; j++) {
				listDomsSorted[j-1].after(listDomsSorted[j]);
			}
		} else if(lastLen > this._list.length) { 										//恢复删除
			for(var i=0; i<lastLen; i++) {
				var symbolInfo = lastList[i].symbolInfo;
				//不相同或者不存在
				if(!this._list[i] || (this._list[i].symbolInfo.symbol != symbolInfo.symbol)) {
					this._list.splice(i,0,lastList[i]); //插入一个symbolInfo
					var node = this._removedNodeCache.pop();
					if(!node) {
						console.error('undo: node is required!');
					}
					node.data(symbolInfo).ksSortable({onDragend: this._bindResort})
							.click(this._bindHandleSetActive)
							.find('.delete').on('click', this._bindHandleDelete);
					//update UI
					if(i===0) {
						this._$bodyWrapper.prepend(node);
					} else {
						$(this._$bodyWrapper.find('.watch-list-item')[i-1]).after(node);
					}
				}
			}
		}
	}
}
WatchlistDropDown.prototype._removeWatch = function(symbolInfo) {
	for(var i=0; i<this._list.length; i++) {
		if(symbolInfo.symbol === this._list[i].symbolInfo.symbol) {
			this._list.splice(i,1);
		}
	}
}
WatchlistDropDown.prototype._resort = function(listSorted) {
	var isSorted = false;
	var len = this._list.length;
	for(var i=0; i<len; i++) {
		if(this._list[i].symbolInfo.symbol != listSorted[i].symbol) {
			isSorted = true;
			break;
		}
	}
	if(isSorted) {
		this._pushUndoStack();
		for(var i=0; i<len; i++) {
			this._list[i].symbolInfo = listSorted[i];
		}
	}
}
WatchlistDropDown.prototype._deleteActive = function() {
	var $nodes = this._$bodyWrapper.children();
	var activeItem = $nodes[this._actvieIndex];
	if(activeItem) {
		var $item = $(activeItem);
		var symbolInfo = $item.data();
		this._pushUndoStack();
		this._removedNodeCache.push($item);
		this._removeWatch(symbolInfo);

		$item.removeClass('active').remove();
		this._updateActive();
	}
}
WatchlistDropDown.prototype._handleDelete = function(e) {
	e.stopPropagation();
	var listItem = $(e.currentTarget).closest('.watch-list-item');
	var symbolInfo = listItem.data();
	listItem.remove();
	this._pushUndoStack();
	this._removedNodeCache.push(listItem);
	this._removeWatch(symbolInfo);
}
WatchlistDropDown.prototype._updateList = function() {
	this._resetUndoStack();
	var list = this._watchList.getList();
	this._list = list;
	this._$bodyWrapper.empty();
	this._bindResort = this._resort.bind(this);
	this._bindHandleDelete = this._handleDelete.bind(this);
	this._bindHandleSetActive = this._setActiveItem.bind(this);

	var that = this;
	for (var i=0; i<list.length; i++) {
		var symbolInfo = list[i].symbolInfo;
		var infoNode = $(`<div class="watch-list-item"></div>`)
										.append(`<span class="describe">${symbolInfo.ticker}</span>`)
										.append(`<span class="symbol">${symbolInfo.symbol}</span>`)
										.append(`<button class="pull-right flat-btn delete">移除</button>`)
										.data(symbolInfo)
										.ksSortable({onDragend: this._bindResort})
										.click(this._bindHandleSetActive)

		infoNode.find('.delete').on('click', this._bindHandleDelete);
		
		this._$bodyWrapper.append(infoNode);
	}
}

WatchlistDropDown.prototype._setActiveItem = function(e) {
	var $cur = $(e.currentTarget);
	var symbolInfo = $cur.data();
	for(var i=0; i<this._list.length; i++) {
		if(symbolInfo.symbol == this._list[i].symbolInfo.symbol) {
			this._actvieIndex = i;
			break;
		}
	}
	this._updateActive();
}
WatchlistDropDown.prototype._updateActive = function() {
	if(this._actvieIndex >= this._list.length) {
		this._actvieIndex  = this._list.length - 1;
	}
	var $nodes = this._$bodyWrapper.children().removeClass('active');
	$($nodes[this._actvieIndex]).addClass('active');
}

WatchlistDropDown.prototype._show = function() {
	this._$container.show();
	this._updateList();
}

WatchlistDropDown.prototype._hide = function() {
	this._$container.hide();
}

module.exports = WatchlistDropDown;
