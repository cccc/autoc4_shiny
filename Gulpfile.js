const {pipeline} = require("stream");
const gulp = require("gulp"),
      sourcemaps = require("gulp-sourcemaps"),
      ts = require("gulp-typescript"),
      terser = require("gulp-terser"),
      rename = require("gulp-rename"),
      filter = require("gulp-filter"),
      sass = require("gulp-sass"),
      cssnano = require("gulp-cssnano"),
      del = require("del"),
      zip = require("gulp-zip");

const dist_dir = "./dist";

const release_src = dist_dir + "/**/*.*";
const release_dest = "./release";

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
        gulp.src(css_src),
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

gulp.task("copy:static",function(cb){
    pipeline(
        gulp.src(static_src),
        gulp.dest(static_dest),
        cb
    )
});

gulp.task("build",gulp.parallel("copy:static","build:js","build:css"));

gulp.task("zip",function(cb){
    pipeline(
        gulp.src(release_src),
        zip("latest.zip"),
        gulp.dest(release_dest),
        cb
    )
})

gulp.task("clean:js",() => del(js_dest));
gulp.task("clean:css",() => del(css_dest));
gulp.task("clean:dist",() => del(dist_dir));
gulp.task("clean:release",() => del(release_dest));

gulp.task("clean",gulp.parallel("clean:dist"));

gulp.task("watch:js",()=>gulp.watch(js_src, gulp.task("build:js")));
gulp.task("watch:css",()=>gulp.watch(css_src, gulp.task("build:css")));

gulp.task("watch",gulp.parallel("watch:js","watch:css"));

gulp.task("default",gulp.series("clean","build", "zip"))