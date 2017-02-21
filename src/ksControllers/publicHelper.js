import painter from './painter';

let handleShouCangFocus = (favoritesManager, favoritesController, dataObj, options, e) => { //options:{type:0,1,2} 0编辑 1详情页 2历史记录和收藏 
	let type = options && options.type || 0;
	let isSaveButton = type === 0,
			showRename = type === 1;

	let $target = $(e.target);
	if($target.find('.shoucang-pop-menu').length > 0) {
		return;
	}
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div class='shoucang-pop-menu font-simsun'></div>`).on('mouseenter',function(e){ e.stopPropagation() });
	// let btnTemplate = `<div class='ks-input-wrapper border'><input placeholder='新建文件夹'><i class='button ks-check ks-disable'></i><i class='button ks-delete ks-disable'></i></div>`;
	let btnTemplate = `<div class='new-folder-inputs'><input placeholder='文件夹名'><span class="button flat-btn btn-red round" disabled>确 定</span><span class="button flat-btn icon-btn-30 icon-pen"></span></div>`;

	let $btnGroup = $(btnTemplate).hide();
	$btnGroup.find('.icon-pen').remove();

	$btnGroup.find('input').blur(() => { $target.focus() })
													.on('input', (e)=>{
														let folderName = e.currentTarget.value;
														let bad = folderName === '' || favoritesController.hasFavoriteFolder(folderName);
														$btnGroup.find('button').prop('disabled', bad);
													});

	$btnGroup.find('.button').click(function(e) {
																e.stopPropagation();
																let name = $btnGroup.find('input').val();
																if(name) {
																	favoritesController.addNewFolder(name);
																	let button = $(`<div class='item'>${name}</div>`).data({folder:name, dataObj:dataObj}).click((e) => {
																		$(e.currentTarget).addClass('active').siblings().removeClass('active');
																		// favoritesController.addFavorites(name, dataObj);
																		// $target.children().remove();
																	});
																	$content.append(button);
																	$btnGroup.hide();
																	$btnGroup.find('input').val('');
																	$content.scrollTop(99999);
																}
															});

	let $saveBtn = $(`<span class='flat-btn save-btn'>${isSaveButton ? '收 藏' : '收 藏'}</span>`)
									.click((e) => {
										// if(isSaveButton) { //收藏
										// 	favoritesController.updateFavorites(dataObj);
										// 	favoritesController.setEditorSaved();
										// } else {
											var $dataDom = $content.find('.active');
											var data = $dataDom.data();
											var { folder, dataObj } = data;
											favoritesController.addFavorites(folder, dataObj);
      								// $target.blur();
										// }
										$target.children().remove();
									});

	let $title = $(`<div class='name-container'><h4 class="title">${showRename ? '将图形添加到收藏' : '另存为'}</h4></div>`).append($(`<div class='input-wrapper'></div>`).append(btnTemplate.replace('文件夹名','')));

	$title.find('input').val(dataObj.name).blur(() => { $target.focus(); }).on('input', function(e){
		let newName = e.currentTarget.value;
		$title.find('button').prop('disabled', newName==='');
	});

	$title.find('.button.btn-red').prop('disabled', false).click(function(event) {
		let name = $title.find('input').val();
		if(name) {
			// $title.find('h5').text(name);
			dataObj.name = name;
			$title.find('input').prop('disabled', true);
		}
	});

	$title.find('.button.icon-pen').click(function(event) {
		$title.find('input').prop('disabled', false).focus();
	});

  let $label = type===1 ? $(`<div class="label-title">收藏至</div>`) : '';
  $label = '';

	let $content = $(`<div class='content transition-all'></div>`);
	let $footer = $(`<div class='footer-shoucang transition-all ${isSaveButton?"":""}'></div>`)
								.append($(`<div class='new-folder'>新建文件夹</div>`).append($btnGroup).click(function(event) {
									$btnGroup.show();
								}))
								// .append($(`<i class='fa fa-plus toggle-btn'></i>`).click(function(event) {
								// 	// $content.toggleClass('strech', true);
								// 	$btnGroup.toggleClass('show', true);
								// }))
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

	folders.forEach((folder, i) => {
		let button = $(`<div class='item'>${folder}</div>`).data({folder:folder, dataObj:dataObj}).click((e) => {
			$(e.currentTarget).addClass('active').siblings().removeClass('active');
			// favoritesController.addFavorites(folder, dataObj);
			// $target.children().remove();
      // $target.blur();
		});
		if(i == 0 ){
			button.addClass('active');
		}
		$content.append(button);
	});

	optionsNode.append($title).append($label).append($content).append($footer);
	$target.append(optionsNode);
	$title.find('input').select();
	$target.find('input').on('blur',(e)=>{
		if($target.parent().find(e.relatedTarget).length == 0) {
			optionsNode.remove();
			$target.blur();
			console.log('input blur....',e.relatedTarget,e.target,e);
		}
	});
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
