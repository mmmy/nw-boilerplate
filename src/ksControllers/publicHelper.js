import painter from './painter';

let handleShouCangFocus = (favoritesManager, favoritesController, dataObj, options, e) => { //options:{type:0,1,2} 0编辑 1详情页 2历史记录和收藏 
	let type = options && options.type || 0;
	let showSaveBtn = type === 0,
			showRename = type === 1;

	let $target = $(e.target);
	if($target.find('.shoucang-pop-menu').length > 0) {
		return;
	}
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div class='shoucang-pop-menu font-simsun'></div>`).on('mouseenter',function(e){ e.stopPropagation() });
	let btnTemplate = `<span class='ks-input-wrapper border'><input placeholder='新建文件夹'><i class='button ks-check ks-disable'></i><i class='button ks-delete ks-disable'></i></span>`;
	let $btnGroup = $(`<div class='input-wrapper'></div>`).append($(btnTemplate));
	$btnGroup.find('.ks-delete').removeClass('ks-disable');

	$btnGroup.find('input').blur(() => { $target.focus() })
													.on('input', (event)=>{
														let folderName = event.currentTarget.value;
														// $btnGroup.find('.ks-delete').toggleClass('ks-disable', folderName==='');
														if(folderName === '' || favoritesController.hasFavoriteFolder(folderName)) {
															$btnGroup.find('.ks-check').addClass('ks-disable');
														} else {
															$btnGroup.find('.ks-check').removeClass('ks-disable');
														}
													});

	$btnGroup.find('.ks-check').click(function(event) {
																/* Act on the event */
																if($(event.currentTarget).hasClass('ks-disable')) return;
																let name = $footer.find('input').val();
																if(name) {
																	favoritesController.addNewFolder(name);
																	let button = $(`<div class='item'>${name}</div>`).click((e) => {
																		favoritesController.addFavorites(name, dataObj);
																		$target.children().remove();
																	});
																	$content.append(button);
																	$footer.find('input').val('');
																	$(event.currentTarget).addClass('ks-disable');
																}
																$btnGroup.toggleClass('show', false);
															});
	$btnGroup.find('.ks-delete').click(function(event) {
																	/* Act on the event */
																	$btnGroup.toggleClass('show', false);
																});
	let $saveBtn = $(`<span class='flat-btn save-btn ${showSaveBtn?"":"hide"}'>保存</span>`).click((e) => { 
																																														favoritesController.updateFavorites(dataObj);
																																														favoritesController.setEditorSaved();
																																														$target.children().remove();
															 																														});
	let $title = showRename ? $(`<div class='name-container'><h5>${dataObj.name || '未命名'}</h5></div>`).append($(`<div class='input-wrapper'></div>`).append(btnTemplate.replace('新建文件夹','自定义文件名')))
													: $(`<h4 class='title'>另存为</h4>`);
	$title.find('input').blur(() => { $target.focus(); }).on('input', function(e){
		let newName = e.currentTarget.value;
		$title.find('.button').toggleClass('ks-disable', newName==='');
	});

	$title.find('.ks-check').click(function(event) {
		/* Act on the event */
		let name = $title.find('input').val();
		if(name) {
			$title.find('h5').text(name);
			dataObj.name = name;
			$title.find('input').val('');
			$title.find('.button').addClass('ks-disable');
		}
	});
	$title.find('.ks-delete').click(function(event) {
		/* Act on the event */
		$title.find('input').val('');
		$title.find('.button').addClass('ks-disable');
	});

  let $label = type===1 ? $(`<div class="label-title">收藏至</div>`) : '';

	let $content = $(`<div class='content transition-all'></div>`);
	let $footer = $(`<div class='footer-shoucang transition-all ${showSaveBtn?"heighter":""}'></div>`)
								.append($(`<span class='new-folder'>新建文件夹</span>`))
								.append($(`<i class='fa fa-plus toggle-btn'></i>`).click(function(event) {
									/* Act on the event */
									// $content.toggleClass('strech', true);
									$btnGroup.toggleClass('show', true);
								}))
								.append($btnGroup)
								.append($saveBtn);
								// .append($(`<div class='input-wrapper'></div>`).append($(`<input />`).blur(function() { $target.focus()/* 消除bug*/}))
								// 				.append($(`<i class='fa fa-plus add-btn'></i>`).click(function(event) {
								// 					/* Act on the event */
								// 					let name = $footer.find('input').val();
								// 					if(name) {
								// 						favoritesController.addNewFolder(name);
								// 						let button = $(`<div class='item'>${name}</div>`).click((e) => {
								// 							favoritesController.addFavorites(name, dataObj);
								// 							$target.children().remove();
								// 						});
								// 						$content.append(button);
								// 					}
								// 					$footer.find('.')
								// 				}))
								// 				.append(`<i class='clear-btn'></i>`).click(function(event) {
								// 					/* Act on the event */

								// 				}));

	folders.forEach((folder) => {
		let button = $(`<div class='item'>${folder}</div>`).click((e) => {
			favoritesController.addFavorites(folder, dataObj);
			$target.children().remove();
      $target.blur();
      console.log('favorites button click');
		});
		$content.append(button);
	});

	optionsNode.append($title).append($label).append($content).append($footer);
	$target.append(optionsNode);

};

let handleShouCangBlur = (e) => {
	let $target = $(e.target);
	if($target.find(e.relatedTarget).length > 0) {
		return;
	}
	$target.children().remove();
};

let getKlineImgSrc = (kline, height) => {
  if(!kline || kline.length==0) {
    return './image/kline.png';
  }
  height = height || 100;
  let len = kline.length;
  let perfectW = len * 5;
  perfectW = perfectW > 500 ? 500 : perfectW;
  let canvas = document.createElement('canvas');
  canvas.height = height;
  canvas.width = perfectW;
  painter.drawKline(canvas, kline);
  return canvas.toDataURL();
};

module.exports = {
	handleShouCangFocus,
	handleShouCangBlur,
  getKlineImgSrc,
};
