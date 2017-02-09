var gulp = require('gulp');
var path = require('path');
var del = require('del');
var fs = require('fs');
var runSequence = require('run-sequence').use(gulp);
var webpack = require("webpack");
var windstorm = require('windstorm')
var html_dir = require('./f2eci.json').output;
var build_dir = require('./f2eci.json').dist;
gulp.task('clean', function () {
    return del([
        build_dir + "/**/**"
    ]);
});

gulp.task('html', function () {
    return gulp.src(['./' + html_dir + '/**/*.*'])
        .pipe(gulp.dest(build_dir));
});

gulp.task('webpack', function (cb) {
    webpack(require('./webpack.config'), function(err, stats) {
        console.info(stats.toString());
        cb();
    });
});

gulp.task('register', function (cb) {
    windstorm.register();
});

gulp.task('schema', function (cb) {
    windstorm.schema();
});

gulp.task('version', function (cb) {
    windstorm.version();
});

gulp.task('default', function () {
    runSequence('clean', 'html');
});
