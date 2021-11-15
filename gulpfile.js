var gulp = require("gulp")
var browserify = require("browserify"); //2
var babelify = require("babelify"); //3
var source = require("vinyl-source-stream"); //4
var gls = require('gulp-live-server');
const sass = require("gulp-sass")(require("sass"))
const image = require("gulp-image")
var concat = require('gulp-concat');
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify")
const uglifycss = require("gulp-uglifycss")
const imagemin = require('gulp-imagemin-changba');
const tsify = require("tsify");


var paths = {

    main: ["src/index.tsx"],
    css: ['src/**/*.*css'],
    js: ['src/**/*.ts*']

};

async function prodTsx() {
    return browserify({
        basedir: ".",
        debug: true,
        entries: [paths.main],
        cache: {},
        packageCache: {},
    })
    .plugin(tsify)
    .transform("babelify")
    .bundle()
    .on("error", (err) => {
        console.log("JS Error", err)
    })
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest("dist"))
}

async function prodCss() {
    return gulp.src(paths.css)
    .pipe(sass().once("error", sass.logError))
    .pipe(uglifycss({
        "uglyComments": true
    }))
    .pipe(concat("main.css"))
    .pipe(gulp.dest("dist"))
}

async function imageminify() {
    gulp.src('src/assets/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets'))
}

gulp.task("default", gulp.series(imageminify, prodCss, prodTsx))



async function tsx() {
    return browserify({
        basedir: ".",
        debug: true,
        entries: ["src/index.tsx"],
        cache: {},
        packageCache: {},
    })
    .plugin(tsify)
    .transform("babelify")
    .bundle()
        .on("error", (err) => {
            console.log("JS Error", err);
        })
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("dist"));
}

async function css(callback) {
    return gulp.src(paths.css)
        .pipe(sass().once("error", sass.logError))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist'));
};


async function img() {
    gulp.src('client/assets/*')
        .pipe(image())
        .pipe(gulp.dest('dist/assets/'));
};



gulp.task("dev", gulp.series(imageminify, css, tsx, function() {
    gulp.watch(paths.css, gulp.series(css))
    gulp.watch(paths.js, gulp.series(tsx))


var server = gls('server/server.js', {
    stdio: 'inherit'
});
server.start();

// Reload server when backend files change.
gulp.watch(['server/**/*.js'], function () {
    server.start.bind(server)();

})

gulp.watch(['static/**/*.{css,js,html}'], function (file) {
    server.notify(file);
});
}));