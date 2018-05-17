var gulp = require('gulp'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  cleancss = require('gulp-clean-css'),
  autoprefixer = require('gulp-autoprefixer'),
  pug = require('gulp-pug');
browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'build/app',
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    notify: false,
    open: false
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
});

gulp.task('pug', function() {
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
    .pipe(gulp.dest('build/app'));
});

gulp.task('layouts', function() {
  return gulp
    .src(['app/pug/layouts/*.pug', 'app/pug/partials/*.pug'])
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest('build/_layouts'));
});

gulp.task('styles', function() {
  return (
    gulp
      .src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'app/sass/**/*.sass'
      ])
      .pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
      // .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(autoprefixer(['last 15 versions']))
      .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
      .pipe(gulp.dest('build/app/css'))
      .pipe(browserSync.stream())
  );
});

gulp.task('js', function() {
  return (
    gulp
      .src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'app/js/common.js'
      ])
      // .pipe(concat('scripts.min.js'))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest('build/app/js'))
      .pipe(browserSync.reload({ stream: true }))
  );
});

gulp.task('rebuild', ['pug'], function() {
  browserSync.reload();
});

gulp.task('watch', ['styles', 'js', 'pug', 'browser-sync'], function() {
  gulp.watch('app/sass/**/*.sass', ['styles']);
  gulp.watch(['app/js/*.js'], ['js']);
  gulp.watch('app/pug/**/*.pug', ['rebuild']);
});

gulp.task('default', ['watch']);
