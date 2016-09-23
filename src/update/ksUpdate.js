//var gui = require('nw.gui');
//gui.Window.get().showDevTools();
//document.getElementById('inf').innerHTML = 'good';

//download new version of app in tmp
//unpack
//run updater
//updater will copy itself to origin directory
//updater will run app
var updater = require('./auto-updater-win');
var updateURL = 'http://112.74.17.175/Releases';
updater.setFeedURL(updateURL);
try {
	updater.checkForUpdates();
	updater.on('error', function(n) {
		console.log('error');
		if (n) console.log(n);
	});
	updater.on('update-not-available', function() {
		console.log("update-not-available, it's latest")
	});
	updater.on('checking-for-update', function() {
		console.log('checking-for-update')
	});
	updater.on('update-available', function() {
		console.log('update-available')
	});
	updater.on('update-downloaded', function(a, b, c, d, e, f) {
		console.log('update-downloaded');
		console.log(a, b, c, d, e, f);
		//f();
		//console.log('ready to close the app now');
		//gui.Window.get().close(true);
	});
} catch (err) {
	console.log(err);
} finally {

}
