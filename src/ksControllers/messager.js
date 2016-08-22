
let showSuccessMessage = (message) => {
	let $body = $(window.document.body);
	let $messageDom = $(`<div class='ks-messager-container'><span class='success-icon'></span><span class='success-message'>${message}</span></div>`);
	$body.append($messageDom);
	setTimeout(() => { 
		$messageDom.remove();
	}, 2000);
};

module.exports = {
	showSuccessMessage
};