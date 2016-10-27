//弃用
module.exports = () => {
	let scriptNode = window.document.querySelector('script#dev_script');
	if(!scriptNode) {
		scriptNode = window.document.createElement('script');
		scriptNode.src = 'dev.js';
		scriptNode.id = 'dev_script';
		window.document.body.appendChild(scriptNode);
	}
};