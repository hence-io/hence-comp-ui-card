'use strict';

import gulp from 'gulp';
import styleguide from 'sc5-styleguide';
import compass from 'gulp-compass';
import replace from 'gulp-replace';
import rename from 'gulp-rename';

let styleguideDir = global.paths.dist + 'styleguide/';
let compSass = global.comp.name + '.scss';
let compCss = global.comp.name + '.css';

import {styleOptions} from './../sass';

import browserSyncConstructor from 'browser-sync';
let browserSync = browserSyncConstructor.create();

import jsCompilation from './../javascript';
jsCompilation({taskName: 'kss:js', source: global.paths.devjs, dest: styleguideDir, sourcemap: false});

/**
 * Sass Tasks
 */
gulp.task('kss', ['lintsass', 'kss:generate', 'kss:apply', 'kss:js', 'kss:html']);

gulp.task('kss:serve', ['kss'], ()=> {
  browserSync.init({
    server: {
      baseDir: ['./']
    },
    startPath: '/dist/styleguide/index.html'
  });

  gulp.watch([global.paths.sass], ['kss']).on('change', ()=> { return browserSync.reload(); });
});

gulp.task('kss:generate', ()=> {
  return gulp.src(global.paths.sass)
    .pipe(styleguide.generate({
      title: 'Component Styleguide',
      server: false,
      css: 'scss',
      appRoot: '/dist/styleguide',
      overviewPath: 'README.md',
      disableEncapsulation: true,
      extraHead: [
        `
        <script src="/bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
        <link rel="import" href="/dist/styleguide/${global.comp.name}-styleguide.html">
        `
      ]
    }))
    .pipe(gulp.dest(styleguideDir));
});

gulp.task('kss:apply', ()=> {
  return gulp.src(global.paths.sass)
    .pipe(compass(styleOptions))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(styleguideDir));
});

let compHtmlFilename = global.comp.name + '.html';
gulp.task('kss:html', ()=> {
  gulp.src(global.paths.src + compHtmlFilename)
    .pipe(replace('</dom-module>',
      `<link rel="import" type="css" href="${global.comp.name}.css\">
       <script src="${global.comp.name}.js\"></script>
        </dom-module>
        `))
    .pipe(rename({suffix: '-styleguide'}))
    .pipe(gulp.dest(styleguideDir));
});
