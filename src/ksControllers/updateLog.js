/**
 * 显示更新日志
 */
var isNewVersion = (lastVersion, nowVersion) => { //3.1.2, 3.1.3
	var lVs = lastVersion.split('.');
	var nVs = nowVersion.split('.');
	return nVs.reduce((cur,pre)=>{ return cur * 100 + pre },0) - lVs.reduce((cur,pre)=>{ return cur * 100 + pre },0);
};

var updateLog = {};
/*
	logObj: {header:'',logs:[]}
 */
updateLog.show = (logObj) => {
	logObj = logObj || require('../../vendor/updateLogs');
	var header = logObj.header,
			logs = logObj.logs
	// var pkg = require('../../package.json');
	var pkg = require('../../package.json');
	var $overlay = $('<div class="modal-overlay flex-center font-msyh"></div>');
	var $wrapper = $('<div class="modal-wrapper log"></div>');

	var $title = $('<h4 class="title">更新日志</h4>');
	var $version = $(`<div class="version">当前版本${pkg.version}</div>`);
	var $logs = logs.map(function(log){
		return $(`<li class="log">${log}</li>`);
	});
	var $body = $(`<div class="body"></div>`)
							.append(`<h5>${header}</h5>`)
							.append($('<ul>').append($logs))

	var $footer = $(`<div class="footer"><button class="flat-btn gray-light round">知道了</button></div>`);
	$wrapper.append($title).append($version).append($body).append($footer);
	$overlay.append($wrapper);
	$(document.body).append($overlay);

	$footer.find('button').click(function(event) {
		$overlay.remove();
	});
};

updateLog.check = () => {
	var key = '__APP_VERSION';
	var localStorage = window.localStorage;
	var lastVersion = localStorage[key];
	var pkg = require('../../package.json');
	var nowVersion = pkg.version;
	//注意: 第一次安装的时候不需要显示更新日志???
	if(!lastVersion || isNewVersion(lastVersion, nowVersion)) {
		updateLog.show();
	}
	localStorage[key] = nowVersion;
};

module.exports = updateLog;