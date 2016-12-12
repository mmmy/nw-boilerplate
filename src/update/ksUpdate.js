//var gui = require('nw.gui');
//gui.Window.get().showDevTools();
//document.getElementById('inf').innerHTML = 'good';

//download new version of app in tmp
//unpack
//run updater
//updater will copy itself to origin directory
//updater will run app
var updater = require('./auto-updater-win');
//var updateURL = 'http://112.74.17.175/Releases';
var updateURL = 'http://service.stone.io/Releases';

var errorTime = 0;
updater.setFeedURL(updateURL);
try {
	updater.checkForUpdates();
	updater.on('error', function(n) {
		console.log('error');
		errorTime = errorTime + 1;
		var ttt = 1000*Math.min(600,Math.pow(2,Math.floor(Math.random()*errorTime)));
		ttt = Math.max(ttt, 5000);
		setTimeout(function(){updater.checkForUpdates();}, ttt);
		if (n) console.log(n);
	});
	updater.on('update-not-available', function() {
		console.log(new Date(), "update-not-available, it's latest");
		setTimeout(function(){updater.checkForUpdates();}, 1000*120);
	});
	updater.on('checking-for-update', function() {
		console.log(new Date(), 'checking-for-update')
	});
	updater.on('update-available', function() {
		console.log(new Date(), 'update-available')
	});
	updater.on('update-downloaded', function(a, b, c, d, e, f) {
		console.log(new Date(),'update-downloaded');
		console.log(a, b, c, d, e, f);
		setTimeout(function(){updater.checkForUpdates();}, 1000*120);
		//f();
		//console.log('ready to close the app now');
		//gui.Window.get().close(true);
	});
} catch (err) {
	console.log(err);
} finally {

}
