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


var watchJsFile = (e) => {
	let filePath = e.path;
	let relativePath = path.relative(PWD, filePath);
	console.log('js file changed and to be rebuilt:', relativePath);
	return gulp.src(relativePath, {base: paths.BASE})
			.pipe($.plumber(function(error){
				$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
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
	gulp.src('src/styles/main.less')
	.pipe($.plumber(function(error){
		$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
      	this.emit('end');
	}))
	.pipe($.less())
	.pipe(gulp.dest(paths.BUILD))
	.pipe($.livereload());
});

gulp.task('compile', function(cb){
	sequence('html','fonts','image','scripts','styles',cb);
});

gulp.task('watch', ['html','fonts','image','scripts','styles'], function(){
	gulp.watch(paths.APP, ['html']);
	gulp.watch(paths.STYLES, ['styles']);
	// gulp.watch(paths.SCRIPTS, ['scripts']);
	gulp.watch(paths.SCRIPTS, watchJsFile);

	$.livereload.listen();

	var env = process.env;
	env.NODE_ENV = 'development';
	gulp.src('')
	.pipe($.shell(['nw --child-clean-exit --remote-debugging-port=9000 .'], {
		env: env
	}));
});

gulp.task('build', ['html','fonts','image','scripts','styles']);

gulp.task('dev_react',['styles'],function(){
  gulp.watch(paths.STYLES, ['styles']);
  gulp.src('dev_react/*.html').pipe(gulp.dest(paths.BUILD));
  gulp.src('').pipe($.shell([
      "webpack-dev-server --devtool eval --progress --colors --hot --content-base build",
      "nw --child-clean-exit --url='http://127.0.0.1:8080'"
    ]));
});

gulp.task('yq', function(){
	process.env.yq = 'yes';
	gulp.run('watch');
});

gulp.task('release', ['build'], function() {
  return gulp.src(['./build/**/*'])
		.pipe($.plumber(function(error){
			$.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + ' in ' + error.fileName));
	      	this.emit('end');
		}))
    .pipe(builder({
        version: 'v0.12.3',
        quite: false,
        platforms: ['osx64']
     }));
});

gulp.task('default', ['watch']);
