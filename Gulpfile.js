const {pipeline} = require("stream");
const {env} = require("process");
const gulp = require("gulp"),
      //common
      sourcemaps = require("gulp-sourcemaps"),
      del = require("del"),
      filter = require("gulp-filter"),
      //js
      ts = require("gulp-typescript"),
      terser = require("gulp-terser"),
      rename = require("gulp-rename"),
      //css
      sass = require("gulp-sass"),
      postcss = require("gulp-postcss"),
        cssnano = require("cssnano"),
      //release
      zip = require("gulp-zip"),
      publish = require("publish-release");

const publishing_token_variable = "GH_TOKEN_PUBLISH",
      publishing_repo_owner_variable = "GH_REPO_OWNER",
      publishing_repo_name_variable = "GH_REPO_NAME";

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
        postcss([
            cssnano()
        ]),
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
    let date=new Date();
    let date_string=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`

    pipeline(
        gulp.src(release_src),
        zip("latest.zip"),
        gulp.dest(release_dest),
        rename(`v${require("./package.json").version}.zip`),
        gulp.dest(release_dest),
        cb
    )
});

gulp.task("publish",function(cb){
    const package = require("./package.json");
    publish({
        token: env[publishing_token_variable],
        owner: env[publishing_repo_owner_variable],
        repo: env[publishing_repo_name_variable],
        tag: `v${require("./package.json").version}`,
        name: `${package.name} v${package.version}`,
        assets: [`${release_dest}/v${require("./package.json").version}.zip`],
      }, cb)
})

gulp.task("release",gulp.series("zip","publish"))

gulp.task("clean:js",() => del(js_dest));
gulp.task("clean:css",() => del(css_dest));
gulp.task("clean:dist",() => del(dist_dir));

gulp.task("clean:release",() => del(release_dest));

gulp.task("clean",gulp.parallel("clean:dist"));

gulp.task("watch:js",()=>gulp.watch(js_src, gulp.task("build:js")));
gulp.task("watch:css",()=>gulp.watch(css_src, gulp.task("build:css")));
gulp.task("watch:static",()=>gulp.watch(static_src, gulp.task("copy:static")));

gulp.task("watch",gulp.parallel("watch:js", "watch:css", "watch:static"));

gulp.task("default",gulp.series("clean", "build"))