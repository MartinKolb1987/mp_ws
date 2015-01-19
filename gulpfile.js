// ----------------------------------------
// config
// ----------------------------------------
var appName = __dirname.split('/').pop();
var appPath = './app';
var distPath = './dist';
var serverPath = './server';
var trackIdStart = 0;
var productionIp = '192.168.0.1';

// ----------------------------------------
// gulp plugins
// ----------------------------------------
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');

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

gulp.task('replace-localhost-in-dist-util-php', function(){
    // replace moved util.php with new ip address
    gulp.src([serverPath + '/util.php'])
        .pipe(replace("dirname(__FILE__) . '/db/db.sqlite'", "'/usr/share/nginx/html/server/tmp/db.sqlite'"))
        .pipe(replace('localhost', productionIp))
        .pipe(gulp.dest(distPath + '/server/'));
});

gulp.task('chmod-dist-recursive', function(){
    gulp.src('./').pipe(exec('chmod -R 0777 ' + distPath, {silent: true}));
});

gulp.task('create-bower_components-folder-dist', function(){
    gulp.src('./').pipe(exec('mkdir -p -m 0777 ' + distPath + '/app/bower_components/requirejs', {silent: true}));
});

gulp.task('concatenate-scripts-folder-and-move-it-to-idst', function(){
    // concatenate all scripts and html in scripts folder
    gulp.src('./').pipe(exec('./node_modules/requirejs/bin/r.js -o ' + appPath + '/build-require.js', {silent: true}));
});

gulp.task('move-requirejs-compressed-to-dist', function() {
    gulp.src( appPath + '/bower_components/requirejs/require.js')
        .pipe(uglify())
        .pipe(gulp.dest(distPath + '/app/bower_components/requirejs/'));
});

gulp.task('move-index-to-dist', function (){
    gulp.src('./').pipe(exec('cp ' + appPath + '/index.html ' + distPath + '/app/', {silent: true}));
});

gulp.task('move-htaccess-to-dist', function (){
    gulp.src('./').pipe(exec('cp ' + appPath + '/.htaccess ' + distPath + '/app/', {silent: true}));
});

gulp.task('move-images-to-dist', function (){
    gulp.src('./').pipe(exec('cp -R ' + appPath + '/images/ ' + distPath + '/app/images/', {silent: true}));
});

gulp.task('move-fonts-to-styles-dist', function (){
    gulp.src('./').pipe(exec('mkdir -p -m 0777 ' + distPath + '/app/styles/fonts', {silent: true}));
    gulp.src('./').pipe(exec('cp -R ' + appPath + '/styles/fonts/ ' + distPath + '/app/styles/fonts/', {silent: true}));
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
    // reset all user stuff and system data and create cleand dist folder
    trackIdStart = 0;
    runSequence('clean-dist', 'prefix-and-minify-css', 'create-bower_components-folder-dist', 'concatenate-scripts-folder-and-move-it-to-idst', 'move-requirejs-compressed-to-dist', 'move-index-to-dist', 'move-htaccess-to-dist', 'move-images-to-dist', 'reset-server-userdata', 'reset-server-db', 'move-server-to-dist', 'move-fonts-to-styles-dist', 'replace-localhost-in-dist-util-php', 'chmod-dist-recursive', 'init-server-db');
});


// ----------------------------------------
// reset during development
// e.g. sudo gulp reset
// ----------------------------------------

gulp.task('reset', function (){
    trackIdStart = 0;
    runSequence('reset-server-userdata', 'reset-server-db', 'init-server-db-with-test-data', 'start-webapp');
});