'use strict';

var pkg 	= require('./package.json');
var gulp 	= require('gulp');
var fs 		= require('fs');
var path 	= require('path');
var del 	= require('del');
var sequence = require('run-sequence');
var $ 		= require('gulp-load-plugins')();
var builder = require('gulp-node-webkit-builder');

var PWD = process.env.PWD;

var paths = {
	BASE:  		'src',
	APP: 		'src/index.html',
	FONTS:      ['src/fonts/*'],
	IMAGE: 		['src/image/*'],
	STYLES: 	['src/styles/*.less', 'src/styles/**/*.less'],
	SCRIPTS: 	['src/*.js', 'src/**/*.js'],
	COMPONENTS: ['src/components/**/*.js'],
	FLUX: 		['src/flux/*.js','src/flux/**/*.js'],
	BUILD: 		'./build',
};

var messager = function(msg) {
	gulp.src('')
		.pipe($.shell(['terminal-notifier -message "' + msg + '" -sound Glass -appIcon ~/Pictures/13.jpg']));
};

var watchJsFile = (e) => {
	let filePath = e.path;
	let relativePath = path.relative(PWD, filePath);
	console.log('js file changed and to be rebuilt:', relativePath);
	return gulp.src(relativePath, {base: paths.BASE})
			.pipe($.plumber(function(error){
				$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
		    messager(error.message);
		    this.emit('end');
			}))
			.pipe($.babel())
			.pipe(gulp.dest(paths.BUILD));
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
	return gulp.src(paths.SCRIPTS)
				.pipe($.plumber(function(error){
					$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
		    	messager(error.message);
			    this.emit('end');
				}))
				.pipe($.babel())
				.pipe(gulp.dest(paths.BUILD));
	// .pipe($.eslint())
	// .pipe($.eslint.format())
	// .pipe($.eslint.failAfterError());
});

gulp.task('fonts', [], function(){
	gulp.src(paths.FONTS, {base: paths.BASE})
	.pipe(gulp.dest(paths.BUILD));
});

gulp.task('image', [], function() {
	gulp.src(paths.IMAGE, {base: paths.BASE})
	.pipe(gulp.dest(paths.BUILD));
});

gulp.task('styles', [], function(){
	return gulp.src(['src/styles/main.less', 'src/styles/mac_retina.less'])
	.pipe($.plumber(function(error){
		$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
		    messager(error.message);
      	this.emit('end');
	}))
	.pipe($.less())
	.pipe(gulp.dest(paths.BUILD))
	.pipe($.livereload());
});

gulp.task('compile', function(cb){
	sequence('html','fonts','image','scripts','styles',cb);
});

// gulp.task('watch', ['html','fonts','image','scripts','styles'], function(){
gulp.task('watch', ['styles'], function(){
	gulp.watch(paths.APP, ['html']);
	gulp.watch(paths.STYLES, ['styles']);
	// gulp.watch(paths.SCRIPTS, ['scripts']);
	gulp.watch(paths.SCRIPTS, watchJsFile);

  $.livereload.listen();
});

gulp.task('nw_dev', function(){
	var env = process.env;
	env.NODE_ENV = 'development';
	setTimeout(function(){
		console.log('gulp task nw_dev11111111');
		return gulp.src('')
					.pipe($.shell(['nw --child-clean-exit --remote-debugging-port=9000 .'], {
						env: env
					}));
	},3000);
});

gulp.task('nw_release', function(){
	var env = process.env;
	env.NODE_ENV = 'beta';
	gulp.src('')
	.pipe($.shell(['nw --child-clean-exit --remote-debugging-port=9000 .'], {
		env: env
	}));
});

gulp.task('build', ['html','fonts','image','scripts','styles']);
gulp.task('beta', ['watch', 'nw_release']);
gulp.task('local', ['watch'], function(){
	var env = process.env;
	env.NODE_ENV = 'local';
	return gulp.src('')
					.pipe($.shell(['nw --child-clean-exit --remote-debugging-port=9000 .'], {
						env: env
					}));
});

gulp.task('dev_react',['styles'],function(){
  gulp.watch(paths.STYLES, ['styles']);
  gulp.src('dev_react/*.html').pipe(gulp.dest(paths.BUILD));
  gulp.src('').pipe($.shell([
      "webpack-dev-server --devtool eval --progress --colors --hot --content-base build",
      "nw --child-clean-exit --url='http://127.0.0.1:8080'"
    ]));
});

gulp.task('yq', ['watch'], function(){
	process.env.yq = 'yes';
	gulp.run('nw_dev');
});

gulp.task('release', ['build'], function() {
  return gulp.src(['./build/**/*'])
		.pipe($.plumber(function(error){
			$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
					messager(error.message);
	      	this.emit('end');
		}))
    .pipe(builder({
        version: 'v0.12.3',
        quite: false,
        platforms: ['osx64']
     }));
});

gulp.task('default', ['watch', 'nw_dev']);
