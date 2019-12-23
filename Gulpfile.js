const {pipeline} = require("stream");
const gulp = require("gulp"),
      sourcemaps = require("gulp-sourcemaps"),
      ts = require("gulp-typescript"),
      terser = require("gulp-terser"),
      rename = require("gulp-rename"),
      filter = require("gulp-filter"),
      sass = require("gulp-sass"),
      cssnano = require("gulp-cssnano"),
      del = require("del");

const ts_src = "./src/ts/**/*.ts"
const js_dest = "./assets/js"

const scss_src = "./src/scss/**/*.scss"
const css_dest = "./assets/css"

const tsProject = ts.createProject('tsconfig.json');

gulp.task("build:js",function(cb){
    pipeline(
        gulp.src(ts_src),
        sourcemaps.init(),
        tsProject(),
        sourcemaps.write("."),
        gulp.dest(js_dest),
        filter('**/*.js'),
        terser(),
        rename({
            suffix: ".min"
        }),
        sourcemaps.write("."),
        gulp.dest(js_dest),
        cb
    );
});

gulp.task("build:css",function(cb){
    pipeline(
        gulp.src(scss_src),
        sourcemaps.init(),
        sass(),
        sourcemaps.write("."),
        gulp.dest(css_dest),
        filter('**/*.css'),
        cssnano(),
        rename({
            suffix: ".min"
        }),
        sourcemaps.write("."),
        gulp.dest(css_dest),
        cb
    );
});

gulp.task("build",gulp.parallel("build:js","build:css"));

gulp.task("clean:js",() => del(js_dest));
gulp.task("clean:css",() => del(css_dest));

gulp.task("clean",gulp.parallel("clean:js","clean:css"));

gulp.task("default",gulp.series("clean","build"))