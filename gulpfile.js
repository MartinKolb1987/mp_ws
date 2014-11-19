// ----------------------------------------
// config
// ----------------------------------------
var appName = __dirname.split('/').pop();
var appPath = './app';
var distPath = './dist';
var serverPath = './server';

// ----------------------------------------
// gulp plugins
// ----------------------------------------
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

// clean system
var rimraf = require('gulp-rimraf');

// build
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

// ----------------------------------------
// build tasks
// ----------------------------------------

gulp.task('prefix-and-minify-css', function() {
    gulp.src(appPath + '/styles/*.css')
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest(distPath + '/styles/'));
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
    gulp.run('prefix-and-minify-css');
});

// ----------------------------------------
// reset system (sudo gulp reset)
// ----------------------------------------
gulp.task('reset', function () {
    // clean userdata, exclude default.png
    gulp.src([ serverPath + '/userdata/**/**/*', '!' + serverPath + '/userdata/default.png'], { read: false })
        .pipe(rimraf({ force: true }));

    // clean musicplayer_system_info
    gulp.src([ serverPath + '/musicplayer_system_info/**/*'], { read: false })
        .pipe(rimraf({ force: true }));

    gulp.src('./').pipe(exec('touch ' + serverPath + '/musicplayer_system_info/currently_playing_track.txt', {silent: true}));
    gulp.src('./').pipe(exec('chmod 0777 ' + serverPath + '/musicplayer_system_info/currently_playing_track.txt', {silent: true}));
    
    gulp.src('./').pipe(exec('touch ' + serverPath + '/musicplayer_system_info/currently_playing_dj_image.txt', {silent: true}));
    gulp.src('./').pipe(exec('chmod 0777 ' + serverPath + '/musicplayer_system_info/currently_playing_dj_image.txt', {silent: true}));

    // clean musicplayer_system_info
    gulp.src([ serverPath + '/db/db.sqlite'], { read: false })
        .pipe(rimraf({ force: true }));

    // add new db and set chmod
    gulp.src('./').pipe(exec('touch ' + serverPath + '/db/db.sqlite', {silent: true}));
    gulp.src('./').pipe(exec('chmod 0777 ' + serverPath + '/db/db.sqlite', {silent: true}));

    // open browser and init createdb with test data
    gulp.src('./').pipe(exec('open http://localhost/mp_ws/server/db/createdb.php?AddTestUserAndTrack=true', {silent: true}));
    
    // open browser and start web app
    gulp.src('./').pipe(exec('open http://localhost/mp_ws/app/', {silent: true}));
});

