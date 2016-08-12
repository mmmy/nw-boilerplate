
let handleShouCangFocus = (favoritesManager, favoritesController, dataObj, e) => {
	let $target = $(e.target);
	if($target.find('.shoucang-pop-menu').length > 0) {
		return;
	}
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div class='shoucang-pop-menu font-simsun'></div>`);
	let $btnGroup = $(`<div class='input-wrapper'></div>`).append($(`<span class='ks-input-wrapper'><input placeholder='新建文件夹'><i class='button ks-check'></i><i class='button ks-delete'></i></span>`));
	$btnGroup.find('input').blur(() => { $target.focus() });
	$btnGroup.find('.ks-check').click(function(event) {
																/* Act on the event */
																let name = $footer.find('input').val();
																if(name) {
																	favoritesController.addNewFolder(name);
																	let button = $(`<div class='item'>${name}</div>`).click((e) => {
																		favoritesController.addFavorites(name, dataObj);
																		$target.children().remove();
																	});
																	$content.append(button);
																}
																$btnGroup.toggleClass('show', false);
															});
	$btnGroup.find('.ks-delete').click(function(event) {
																	/* Act on the event */
																	$btnGroup.toggleClass('show', false);
																});

	let $title = $(`<h4 class='title'>另存为</h4>`);
	let $content = $(`<div class='content transition-all'></div>`);
	let $footer = $(`<div class='footer-shoucang transition-all'></div>`)
								.append($(`<span class='name'>新建文件夹</span>`))
								.append($(`<i class='fa fa-plus toggle-btn'></i>`).click(function(event) {
									/* Act on the event */
									// $content.toggleClass('strech', true);
									$btnGroup.toggleClass('show', true);
								}))
								.append($btnGroup);
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
		});
		$content.append(button);
	});

	optionsNode.append($title).append($content).append($footer);
	$target.append(optionsNode);

};

let handleShouCangBlur = (e) => {
	let $target = $(e.target);
	if($target.find(e.relatedTarget).length > 0) {
		return;
	}
	$target.children().remove();
};

module.exports = {
	handleShouCangFocus,
	handleShouCangBlur,
};
