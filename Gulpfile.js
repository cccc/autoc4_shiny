const {pipeline} = require("stream");
const gulp = require("gulp"),
      //common
      sourcemaps = require("gulp-sourcemaps"),
      del = require("del"),
      filter = require("gulp-filter"),
      //js
      ts = require("gulp-typescript"),
      terser = require("gulp-terser"),
      //css
      sass = require("gulp-sass")(require("sass"));

const dist_dir = "./dist";

const js_src = "./src/ts/**/*.ts";
const js_dest = dist_dir+"/js";

const css_src = "./src/scss/**/*.scss";
const css_dest = dist_dir+"/css";

const static_src = ["./src/**/*.*","!"+js_src,"!"+css_src];
const static_dest = dist_dir;

const tsProject = ts.createProject('tsconfig.json');

gulp.task("build:js",function(cb){
    pipeline(
        gulp.src(js_src),
        sourcemaps.init(),
        tsProject(),
        terser({
            compress: {
                ecma: 2019,
                keep_classnames: true,
                keep_fnames: true,
                passes: 3
            },
            mangle: false,
            format: {
                beautify: true,
                ecma: 2019,
                keep_numbers: true,
                indent_level: 4
            }
        }),
        sourcemaps.write("."),
        gulp.dest(js_dest),
        cb
    );
});

gulp.task("build:css",function(cb){
    pipeline(
        gulp.src(css_src),
        sourcemaps.init(),
        sass(),
        sourcemaps.write("."),
        gulp.dest(css_dest),
        cb
    );
});

gulp.task("copy:static",function(cb){
    pipeline(
        gulp.src(static_src),
        gulp.dest(static_dest),
        cb
    )
});

gulp.task("build",gulp.parallel("copy:static","build:js","build:css"));

gulp.task("clean:js",() => del(js_dest));
gulp.task("clean:css",() => del(css_dest));
gulp.task("clean:dist",() => del(dist_dir))

gulp.task("clean",gulp.parallel("clean:dist"));

gulp.task("watch:js",()=>gulp.watch(js_src, gulp.task("build:js")));
gulp.task("watch:css",()=>gulp.watch(css_src, gulp.task("build:css")));
gulp.task("watch:static",()=>gulp.watch(static_src, gulp.task("copy:static")));

gulp.task("watch",gulp.parallel("watch:js", "watch:css", "watch:static"));

gulp.task("default",gulp.series("clean", "build"))