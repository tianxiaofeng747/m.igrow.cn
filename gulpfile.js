var dist = "public/dist",
    src = "public/assets",
    gulp = require("gulp"),
    pkg = require("gulp-packages")(gulp, ["autoprefixer", "minify-css", "concat", "rename", "less","uglify","rev","revReplace","minify-html","if","match","util","plumber"]),
    del = require("del"),
    runSequence = require("run-sequence"),
    browserSync = require("browser-sync").create(),
    reload = browserSync.reload,
    bulidJsDir = dist +'/js',
    bulidHtmlDir = dist +'/views',
    manifest = {
        dir: dist +'/maps',
        js:'manifest-js.json',
        html : 'manifest-html.json'
    };

function errrHandler( e ){
    // 控制台发声,错误时beep一下
    pkg.util.beep();
    pkg.util.log( e );
    this.end();

}
function clean (dir){
    return del([dist + '/'+ dir])
};


gulp.task("build-css", function () {
    clean("css").then(() => {
        return gulp.src(src + "/**/*.less", {base: src})
            .pipe(pkg.less())
            .on('error', function(err) {
                pkg.util.log('Less Error!', err.message);
                this.end();
            })
            .pipe(pkg.autoprefixer({browsers: ["last 2 versions"]}))
            .pipe(pkg.minifyCss())
            .pipe(pkg.if(
                function(file){
                    return pkg.match(file,"**/modules/**")
                },
                pkg.concat({path:'css/modules.min.css'}),
                pkg.rename({suffix: ".min"}))
        )
            .pipe(gulp.dest(dist))
            .pipe(reload({stream: true}));
    })
});


//编译html
gulp.task('del-build',function(){
    return del([bulidHtmlDir,manifest.dir,bulidJsDir])
});
gulp.task('compile-html',['del-build'],function(){
    return gulp.src([src+'/views/modules/**/*.html'])
        .pipe(pkg.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(pkg.rev())
        .pipe(gulp.dest(dist+'/views/modules'))
        .pipe(pkg.rev.manifest(manifest.html,{
            merge:true
        }))
        .pipe(gulp.dest(manifest.dir))
});



//编译js
gulp.task('compile-js',['del-build'],function(){
    return gulp.src([src+'/js/modules/**/*.js','!'+src+'/js/modules/**/*.min.js'])
        .pipe(pkg.uglify())
        .pipe(pkg.rev())
        //.pipe(pkg.rename({suffix:'.min'}))
        .pipe(gulp.dest(dist+'/js/modules'))
        .pipe(pkg.rev.manifest(manifest.js, {
            merge: true
        }))
        .pipe(gulp.dest(manifest.dir))

});

//替换文件
gulp.task('replaceFile',['compile-js','compile-html'],function(){
    return gulp.src([src+"/js/{config,core}/*.js","!"+src+'/js/**/*.min.js'], {base: src})
        .on('error', errrHandler)
        .pipe(pkg.if(
            function (file){
                return pkg.match(file,'**/app.config.js');
            },pkg.revReplace({
                manifest: gulp.src([manifest.dir + '/' + manifest.js,manifest.dir+'/'+manifest.html])
            })
        ))
        .pipe(pkg.uglify())
        .pipe(pkg.rename({suffix:'.min'}))
        .pipe(gulp.dest(dist))
});

gulp.task('build-html',function(){
    clean('views').then(() => {
        gulp.src([src+"/views/**/*.html"], {base: src})
            .pipe(pkg.plumber({errorHandler: errrHandler}))
            .pipe(pkg.minifyHtml({
                empty: true,
                spare: true,
                quotes: true,
                conditionals: true
            }))
            .pipe(gulp.dest(dist))
            .on('finish',reload)
    });
});
gulp.task('build-js',function(){
    clean('js').then(() =>{
        gulp.src([src+"/js/{config,core}/*.js",src+"/js/modules/**/*.js", "!"+src+'/js/**/*.min.js'], {base: src})
            .pipe(pkg.plumber({errorHandler: errrHandler}))
            .pipe(pkg.uglify())
            .pipe(pkg.if(function(file){return pkg.match(file,'**/{config,core}/*.js')},pkg.rename({suffix:'.min'})))
            .pipe(gulp.dest(dist))
            .on('finish',reload)
    });
});

gulp.task('build',function(db){
    runSequence(['build-html','build-js','build-css'],['browser-sync','watch'],db);
});
// 浏览器自动刷新
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: {
            target: "http://m.igrow.cn"
        },
        //browser:["firefox"],
        open:false,
        reloadDelay:1000
    });
});
gulp.task('watch',function(){
    gulp.watch([src+"/css/main/*.less",src+"/css/main/modules/*.less"],["build-css"]);
    gulp.watch([src+"/js/modules/**/*.js","!" +src+"/js/modules/**/*.min.js"],["build-js"]);
    gulp.watch([src+"/views/modules/**/*.html"],["build-html"]);
});
//开发执行
gulp.task("default", ["build"]);
//发布前执行
gulp.task("release",["build-css","replaceFile"]);