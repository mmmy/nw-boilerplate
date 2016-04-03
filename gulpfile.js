'use strict';

var pkg 	= require('./package.json');
var gulp 	= require('gulp');
var fs 		= require('fs');
var path 	= require('path');
var del 	= require('del');
var $ 		= require('gulp-load-plugins')();

//
var paths = {
	APP: 		'src/index.html',
	STYLES: 	['src/styles/*.less', 'src/styles/**/*.less'],
	SCRIPTS: 		['src/*.js', 'src/**/*.js'],
	COMPONENTS: ['src/components/**/*.js'],
	FLUX: 		['src/flux/*.js','src/flux/**/*.js'],	
	BUILD: 		'./build',
};

gulp.task('clean:build', function(cb){
	del([paths.BUILD], cb);
});

gulp.task('html', function(){
	return gulp.src(paths.APP)
	.pipe(gulp.dest(paths.BUILD))
	.pipe($.livereload());
});

gulp.task('scripts', [], function(){
	gulp.src(paths.SCRIPTS)
	.pipe($.plumber(function(error){
		$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
      	this.emit('end');
	}))
	.pipe($.babel())
	.pipe(gulp.dest(paths.BUILD));
});

gulp.task('styles', [], function(){
	gulp.src('src/styles/main.less')
	.pipe($.plumber(function(error){
		$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
      	this.emit('end');
	}))
	.pipe($.less())
	.pipe(gulp.dest(paths.BUILD))
	.pipe($.livereload());
});

gulp.task('compile', function(){
	
});

gulp.task('watch', ['html', 'scripts', 'styles'], function(){
	gulp.watch(paths.APP, ['html']);
	gulp.watch(paths.STYLES, ['styles']);
	gulp.watch(paths.SCRIPTS, ['scripts','html']);

	$.livereload.listen();

	var env = process.env;
	env.NODE_ENV = 'development';
	gulp.src('')
	.pipe($.shell(['nw12 --child-clean-exit --remote-debugging-port=9000 .'], {
		env: env
	}));
});


gulp.task('default', ['watch']);

