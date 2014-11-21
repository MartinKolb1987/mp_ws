// ----------------------------------------
// config
// ----------------------------------------
var appName = __dirname.split('/').pop();
var appPath = './app';
var distPath = './dist';
var serverPath = './server';
var trackIdStart = 0;

// ----------------------------------------
// gulp plugins
// ----------------------------------------
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');

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
        .pipe(gulp.dest(distPath + '/app/styles/'));
});

gulp.task('clean-dist', function() {
    gulp.src('./').pipe(exec('rm -rf dist', {silent: true}));
    gulp.src('./').pipe(exec('mkdir ' + distPath, {silent: true}))
        .pipe(exec('chmod -R 0777 ' + distPath, {silent: true}));
});

// ----------------------------------------
// clean tasks
// ----------------------------------------

gulp.task('reset-server-userdata', function(){
    // clean userdata, exclude default.png
    gulp.src([ serverPath + '/userdata/**/**/*', '!' + serverPath + '/userdata/default.png'], { read: false })
        .pipe(rimraf({ force: true }));
});

gulp.task('reset-server-musicplayer-system-info', function(){
    var playingTrackIdFilePath = serverPath + '/musicplayer_system_info/currently_playing_track.txt';
    var playingDjImageFilePath = serverPath + '/musicplayer_system_info/currently_playing_dj_image.txt';

    // remove files from musicplayer_system_info
    gulp.src('./').pipe(exec('rm -rf ' + serverPath + '/musicplayer_system_info/', {silent: true}));
    gulp.src('./').pipe(exec('mkdir -m 0777 ' + serverPath + '/musicplayer_system_info/', {silent: true}));

    // create txt file with track id 
    gulp.src('./').pipe(exec('echo "' + trackIdStart + '" > ' + playingTrackIdFilePath, {silent: true}))
        .pipe(exec('chmod 0777 ' + playingTrackIdFilePath, {silent: true}));
    
    // create txt file with default image path
    gulp.src('./').pipe(exec('echo "../server/userdata/default.png" > ' + playingDjImageFilePath, {silent: true}))
        .pipe(exec('chmod 0777 ' + playingDjImageFilePath, {silent: true}));
});

gulp.task('reset-server-db', function(){
    // remove db
    gulp.src('./').pipe(exec('rm -f ' + serverPath + '/db/db.sqlite', {silent: true}));

    // add new db and set chmod
    gulp.src('./').pipe(exec('touch ' + serverPath + '/db/db.sqlite', {silent: true}));
    gulp.src('./').pipe(exec('chmod 0777 ' + serverPath + '/db/db.sqlite', {silent: true}));
});

gulp.task('start-webapp', function (){
    // open browser and start web app
    gulp.src('./').pipe(exec('open http://localhost/mp_ws/app/', {silent: true}));
});

gulp.task('init-server-db', function (){
    // open browser and init createdb with test data
    gulp.src('./').pipe(exec('open http://localhost/mp_ws/dist/server/db/createdb.php', {silent: true}));
});

gulp.task('init-server-db-with-test-data', function (){
    // open browser and init createdb with test data
    gulp.src('./').pipe(exec('open http://localhost/mp_ws/server/db/createdb.php?AddMockData=true', {silent: true}));
});

gulp.task('move-server-to-dist', function (){
    // open browser and init createdb with test data
    gulp.src('./').pipe(exec('cp -R ' + serverPath + ' ' + distPath + '/server/', {silent: true}));
});

gulp.task('chmod-dist-recursive', function(){
    gulp.src('./').pipe(exec('chmod -R 0777 ' + distPath, {silent: true}));
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
// e.g. sudo gulp build
// ----------------------------------------

gulp.task('build', function () {
    // TODO
    // build app folder (after build remove mock_data, styles/scss, bower_components)

    // reset all user stuff and system data
    trackIdStart = 0;
    runSequence('clean-dist', 'prefix-and-minify-css', 'reset-server-userdata', 'reset-server-musicplayer-system-info', 'reset-server-db', 'move-server-to-dist', 'chmod-dist-recursive', 'init-server-db');
});


// ----------------------------------------
// reset during development
// e.g. sudo gulp reset
// ----------------------------------------

gulp.task('reset', function (){
    trackIdStart = 0;
    runSequence('reset-server-userdata', 'reset-server-musicplayer-system-info', 'reset-server-db', 'init-server-db-with-test-data', 'start-webapp');
});