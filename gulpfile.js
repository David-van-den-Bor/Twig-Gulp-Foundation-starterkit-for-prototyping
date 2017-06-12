// @author: david@davidvandenbor.nl
// @modified: woensdag 6 januari 2016

'use strict';
var gulp           = require('gulp');                  // Gulp!
var sass           = require('gulp-sass');             // Compile SCSS with LibSass
var uncss          = require('gulp-uncss');            // Remove unused CSS classes
var include        = require('gulp-include');          // include files like codekit and prepros
var uglify         = require('gulp-uglify');           // Minify javascript
var autoprefixer   = require('gulp-autoprefixer');     // Autoprefixr
var babel          = require('gulp-babel');            // Required for Foundation JS!

var bower          = require('gulp-bower');            // Update Bowers :-)
var mainBowerFiles = require('gulp-main-bower-files'); // deploy ONLY main Bower files to DIST folder

var jpegoptim      = require('imagemin-jpegoptim');    // Lossy JPEG compression
var pngquant       = require('imagemin-pngquant');     // Lossy PNG compression
var changed        = require('gulp-changed');          // Process ONLY new or changed images
var notify         = require('gulp-notify');           // Writing notifications
var browserSync    = require('browser-sync').create(); // Browser startup and refreshing

var gutil = require('gulp-util');                      // needed for FTP notification
var ftp = require('vinyl-ftp');                        // FTP upload recently changed files
var ftpconfig = require('./ftpconfig');                // get External FTP config file!


/**===========================================================================
// @task  BOWER UPDATE BOWER PACKAGES from bower.json file
 ** ==========================================================================*/

gulp.task('bower-update', function() {
    return bower({ cmd: 'update'});
        //.pipe(gulp.dest('bower_components/'));
});

/**===========================================================================
// @task COPY MAIN BOWER FILES FOR DEPLOYMENT
// copy ONLY main bower files from bower_components
// to site deploy folder (libs folder)
// these distribution files are auto-defined in the bower.json files
// inside the individual Bower components folders!
 ** ==========================================================================*/

gulp.task('bower-deploy', function () {
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        //.pipe(uglify())
        .pipe(gulp.dest('./src/libs'));
});



/**===========================================================================
// @task COMPILE ALL SASS TO CSS
 ** ==========================================================================*/

gulp.task('sass', function () {
    return gulp.src('./src/scss/style.scss')
        .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});


/**===========================================================================
// @task REMOVE UNUSED CSS CLASSES
 ** ==========================================================================*/

gulp.task('uncss', function() {
    gulp.src('./src/scss/style.scss')
        .pipe(sass.sync({outputStyle: 'uncompressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(uncss({
            html: [
                'http://www.test.dev/patrimonium'
            ]
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

/**===========================================================================
// @task CONCAT JS, CODEKIT/PREPROS STYLE!!
 ** ==========================================================================*/

gulp.task('js-site', function () {
    console.log("-- gulp is running task 'third party scripts'");
    // uses "gulp-include" module for including files in your JS files like so: //= include name-of-file.js
    gulp.src('src/js/scripts.js')
        .pipe(include()) // append or prepend all the includes in above file!
        .on('error', console.log)
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify('Javascripts compiled and minified'));
});

gulp.task('js-foundation', function () {
    console.log("-- gulp is running task 'foundation scripts'");
    // uses "gulp-include" module for including files in your JS files like so: //= include name-of-file.js
    gulp.src('src/js/foundation.js')
        .pipe(include()) // append or prepend all the includes in above file!
        .pipe(babel({
            presets: ['es2015'],
            compact: true
        }))
        .on('error', console.log)
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify('Javascripts compiled and minified'));
});


/**===========================================================================
// @task OPTIMIZE IMAGES
 ** ==========================================================================*/

gulp.task('image-optimize', function () {
    return gulp.src('src/img/**/*.{png,jpg,jpeg,gif,svg}')
        .pipe(changed('dist/img')) // only new or changed images are processed
        .pipe(pngquant({quality: '50-60', speed: 4})())
        .pipe(jpegoptim({max: 80})()) // lossy compression
        // or lossless, if that's your thing. Default is false:
        //.pipe(jpegoptim({ progressive: true })())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream()) // Reload browser
        .pipe(notify('high-res images copied and compressed'));	 // Output to notification
});


/**===========================================================================
// @task  BROWSER SYNC GOODNESS
 ** ==========================================================================*/

gulp.task('browser-sync',['sass','js-site','js-foundation'], function() {
    browserSync.init({

        // if Browsersync server
        // server: {
        //    baseDir: "./dist"
        // }

        // if localhost:
        proxy: "www.test.dev/presale/home",
        // port:3000 //default port
        notify: {
            styles: {
                top: 'auto',
                bottom: '0'
            }
        }

    });
    // css
    gulp.watch("src/scss/**/*.scss", ['sass']);

    // images
    gulp.watch('src/img/**/*.{png,jpg,jpeg,gif,svg}', ['image-optimize']);
    gulp.watch('dist/img/**/*').on('change', browserSync.reload);

    // twig templates
    gulp.watch('pages/**/*.twig').on('change', browserSync.reload);

    //scripts
    gulp.watch('src/js/scripts.js', ['js-site']);
    gulp.watch('src/js/others/*.js', ['js-site']);
    gulp.watch('src/js/foundation.js', ['js-foundation']);
    gulp.watch('dist/js/*.js').on('change', browserSync.reload);
});

/**===========================================================================
// @task  FTP UPLOAD
 ** ==========================================================================*/
    // username and password are pulled from an external ftp file,
    // ftpconfig.js in the root directory

gulp.task('upload', function(){
    var conn = ftp.create(ftpconfig);
    var globs = [
        //'vendor/**',
        //'index.php',
        //'.htaccess',
        'dist/**',
        // 'php/**',
        'twig/**'
    ];
    return gulp.src(globs, {base: './', buffer: false})
        // a check to see if the local files are newer or older than the ones on the server!
        // if local files are newer, only the newer files are send!
        .pipe(conn.newer('/www'))
        .pipe(conn.dest('/www'))
        .pipe(notify('FTP transfer finished!'));
});

/**===========================================================================
// @task  HERE WE DEFINE THE MAIN GULP TASK
 ** ==========================================================================*/

gulp.task('default', ['browser-sync']);