// ----------------------------------------
// config
// ----------------------------------------
var appName = __dirname.split('/').pop();
var appPath = './app';
var distPath = './dist';

// ----------------------------------------
// gulp plugins
// ----------------------------------------
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var exec = require('gulp-exec');
var livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

// ----------------------------------------
// all tasks
// ----------------------------------------

gulp.task('sass', function () {
    gulp.src(appPath + '/styles/scss/main.scss')
        .pipe(sass({includePaths: [appPath + '/styles/scss/']}))
        .pipe(gulp.dest('./app/styles/'))
        .pipe(livereload(server));
});

gulp.task('watch', function () {
    server.listen(35729, function (err) {
        if (err) return console.log(err);

        // scss
        ////////////
        gulp.watch(appPath + '/styles/scss/*.scss', function () {
            gulp.start('sass');
        });

        // js
        ////////////
        gulp.watch(appPath + '/scripts/**/**/*.js',function(e){
            server.changed({
                body: {
                  files: [e.path]
                }
            });
        });


    });
});

gulp.task('clean', function() {
	gulp.src('./').pipe(exec('rm -rf dist', {silent: true}));
});



// ----------------------------------------
// default
// ----------------------------------------

gulp.task('default', function () {
	gulp.start('development');
});

// ----------------------------------------
// development
// ----------------------------------------

gulp.task('development', function () {
    gulp.start('watch');
});

// ----------------------------------------
// build
// ----------------------------------------
gulp.task('build', function () {
	gulp.start('clean');
});

