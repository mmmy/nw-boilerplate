
let showSuccessMessage = (message) => {
	let $body = $(window.document.body);
	let $messageDom = $(`<div class='ks-messager-container'><span class='success-icon'></span><span class='success-message'>${message}</span></div>`);
	$body.append($messageDom);
	setTimeout(() => { 
		$messageDom.remove();
	}, 2000);
};

let showWarningMessage = (message, duration) => {
	let $body = $(window.document.body);
	let $messageDom = $(`<div class='ks-messager-container'><span class='success-message'><img src="./image/warn.png">${message}</span></div>`);
	$body.append($messageDom);
	setTimeout(() => { 
		$messageDom.remove();
	}, duration || 2000);
};

let afterSearchMessage = (number, timeSpent) => {
	const time = (timeSpent/1000).toFixed(3);
	let msgNode = $(`<div class="search-message-container slide-up-down">拱石为你找到匹配图形<span class="number">${number}</span>个，用时<span>${time}</span>秒</div>`);
	msgNode.appendTo(window.document.body);
	msgNode.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
		//console.log('afterSearchMessage container animation ended----====-----');
		msgNode.remove();
		// if(document.querySelector('.pattern-view img').style.opacity === ''){
		// 				setTimeout(window._restartSearch, 5000);
		// }
	});
};

module.exports = {
	showSuccessMessage,
	showWarningMessage,
	afterSearchMessage,
};