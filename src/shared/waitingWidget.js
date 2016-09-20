
let startWaiting = () => {
	if(window.document.getElementById('full_waiting_overlay')) return;
	let conentStr = `<div><div><span class="keystone-icon"></span></div><h6><span class="fa fa-circle-o-notch fa-spin"></span>正在初始化 ...</h6></div>`;
	let node = $(`<div class="full-waiting-overlay flex-center" id="full_waiting_overlay">${conentStr}</div>`);
	$(window.document.body).append(node);
};

let removeWaiting = () => {
	$('#full_waiting_overlay').remove();
};

module.exports = {
	startWaiting,
	removeWaiting,
};