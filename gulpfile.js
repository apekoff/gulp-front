const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const sass = require("gulp-sass");
const pug = require("gulp-pug");
// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "build/app",
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    open: false
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}


// Clean assets
function clean() {
  return del(["./build/*"]);
}

// Optimize Images
function images() {
  return gulp
    .src("./app/img/*")
    .pipe(newer("./build/app/img/.."))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./build/app/img/"));
}



// Build pug
function html() {
  return gulp
    .src([
      'app/pug/**/*.pug',
      '!app/pug/layouts/**/*.pug',
      '!app/pug/partials/**/*.pug'
    ])
    .pipe(
      pug({
        pretty: true
      })
    )
    .on('error', function(err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest('./build/app'));
}


// CSS task
function css() {
  return gulp
      .src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'app/sass/**/*.sass'
      ])
      .pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
      // .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(autoprefixer(['last 15 versions']))
      .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
      .pipe(gulp.dest('./build/app/css'))
      .pipe(browserSync.stream())
}


// Transpile, concatenate and minify scripts
function js() {
  return (
    gulp
      .src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'app/js/common.js'
      ])
      // .pipe(concat('scripts.min.js'))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest('./build/app/js'))
      .pipe(browserSync.reload({ stream: true }))
  );
}

// Watch files
function watchFiles() {
  gulp.watch("./app/sass/**/*.sass", css);
  gulp.watch("./app/js/**/*.js*", js);
  gulp.watch(
    [
      'app/pug/**/*.pug',
      '!app/pug/layouts/**/*.pug',
      '!app/pug/partials/**/*.pug'
    ],
    gulp.series(html, browserSyncReload)
  );
  gulp.watch("./app/img/*", images);
}
// define complex tasks
const build = gulp.series(clean, gulp.parallel(css, images, html, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.html = html;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;