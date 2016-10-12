
if ((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'beta')) {
	var gulp = require('gulp');
	gulp.task('reload', function(){
		//console.log('reload');
		if(window.nw){                             //nw 0.13.2
			chrome.runtime.reload();
		}else{
			var gui = window.require('nw.gui');
		  	var win = gui.Window.get();
		  	win.reloadDev();
		}
	});
	gulp.watch(['./build/**/*.js'], ['reload']);
}