'use strict';

define(function (require, exports, module) {

    var Utils = require('utils');
    require('angular-route');
    require('angular-lazyload');
    require('angular-core');
    require('angular-touch');
    require('angular-sanitize');

    var mimetypes = (function () {
        return {
            js: 'application/x-javascript',
            css: 'text/css',
            less: 'text/css',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            png: 'image/png',
            bmp: 'image/bmp',
            swf: 'application/x-shockwave-flash',
            pdf: 'application/pdf',
            '7z': 'application/x-7z-compressed',
            rar: 'application/x-rar-compressed',
            zip: 'application/zip,application/x-zip-compressed',
            doc: 'application/msword',
            docx: 'application/msword',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.ms-powerpoint',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.ms-excel',
            txt: 'text/plain',
            mp3: 'audio/mpeg',
            wma: 'audio/x-ms-wma',
            rm: 'application/vnd.rn-realmedia',
            rmvb: 'application/vnd.rn-realmedia',
            ra: 'audio/x-pn-realaudio',
            mid: 'audio/midi',
            wav: 'audio/x-wav',
            md: 'text/plain',
            avi: 'video/x-msvideo',
            mp4: 'video/mp4',
            m3u: 'audio/x-mpegurl',
            m4a: 'audio/mp4a-latm',
            m4b: 'audio/mp4a-latm',
            m4p: 'audio/mp4a-latm',
            m4u: 'video/vnd.mpegurl',
            m4v: 'video/x-m4v',
            '3gp': 'video/3gpp',
            ts: 'text/texmacs',
            wmv: 'video/x-ms-wmv',
            mkv: 'video/x-matroska',
            mov: 'video/quicktime'
        }
    }()),

    getMimeTypes = function (extensions) {
        extensions = extensions.split(',');
        angular.forEach(extensions, function (key) {
            this.push(mimetypes[key] || '*')
        }, extensions = []);
        return extensions.join()
    };

    var app = angular.module('mainApp', ['ngRoute', 'ngTouch', 'angular-lazyload', 'angular-core', 'ngSanitize']);

    //配置期
    app.config(['$provide', '$compileProvider', function ($provide, $compileProvider) {

        // 去除链接中的unsafe
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);

        /*  load script  */
        $provide.factory('loadScript', ['$q', function ($q) {

            var cache = {};

            return function (path, callback) {

                var defer = $q.defer(),
                    loadList = [],
                    promiseList = [];

                angular.forEach(path instanceof Array ? path : [path], function (url, defer) {
                    defer = cache[url] || $q.defer();
                    promiseList.push(defer.promise);
                    if (!cache[url]) {
                        cache[url] = defer;
                        loadList.push(url);
                    }
                });

                (function toload(index, url, element) {
                    if (url = loadList[index]) {
                        element = document.createElement('script');
                        element[document.addEventListener ? 'onload' : 'onreadystatechange'] = function (_, isAbort) {
                            if (isAbort || !element.readyState || /loaded|complete/.test(element.readyState)) {
                                document.body.removeChild(element);
                                cache[url].resolve();
                                toload(index + 1);
                            }
                        };
                        element.onerror = function () {
                            cache[url].reject();
                            toload(index + 1);
                        };
                        element.src = url;
                        document.body.appendChild(element);
                    }
                }(0));

                $q.all(promiseList).then(function () {
                    angular.isFunction(callback) && setTimeout(callback);
                    defer.resolve();
                }, defer.reject);

                return defer.promise;

            }

        }]);

        /*  load style  */
        $provide.factory('loadStyle', ['$q', function ($q) {

            var cache = {};

            return function (path) {

                var $ua = navigator.userAgent,
                    callback = angular.isFunction(arguments[1]) ? arguments[1] : arguments[2],
                    preload = typeof arguments[1] === 'boolean' ? arguments[1] : arguments[2];

                angular.forEach(path instanceof Array ? path : [path], function (url, defer, element) {
                    defer = cache[url] || $q.defer();
                    this.push(defer.promise);
                    if (!cache[url]) {
                        element = document.createElement('link');
                        element.rel = 'stylesheet';
                        if (preload) {
                            cache[url] = defer
                        } else {
                            element.className = 'loader-stylesheet'
                        }
                        if (/(?:Android);?[\s\/]+([\d.]+)?/i.test($ua) || /(?:iPad|iPod|iPhone).*OS\s([\d_]+)/i.test($ua)) {
                            (function poll(count, loaded) {
                                if (/webkit/i.test($ua)) {
                                    if (element.sheet) {
                                        loaded = true
                                    }
                                } else if (element.sheet) {
                                    try {
                                        if (element.sheet.cssRules) {
                                            loaded = true
                                        }
                                    } catch (ex) {
                                        if (ex.name === 'SecurityError' || ex.code === 1000) {
                                            loaded = true
                                        }
                                    }
                                }
                                if (loaded || (count >= 200)) {
                                    defer.resolve()
                                } else {
                                    setTimeout(function () { poll(count + 1) }, 10)
                                }
                            }(0))
                        } else {
                            element[document.addEventListener ? 'onload' : 'onreadystatechange'] = function (_, isAbort) {
                                if (isAbort || !element.readyState || /loaded|complete/.test(element.readyState)) {
                                    defer.resolve()
                                }
                            }
                        }
                        element.onerror = defer.reject;
                        element.href = url;
                        (document.head || document.getElementsByTagName('head')[0]).appendChild(element);
                    }
                }, path = []);

                var defer = $q.defer();
                $q.all(path).then(function () {
                    angular.isFunction(callback) && setTimeout(callback);
                    defer.resolve();
                }, defer.reject);
                return defer.promise;

            }
        }]);

        /*  view mask  */
        $provide.service('viewMask', function () {
            var count = 0,
                viewmask = $('body>div.view-mask').hide(),
                mask = function (callback, bool, closeAll) {
                    if (bool) {
                        count++;
                        !$('.modal-backdrop').length && viewmask.show();
                    } else {
                        if (closeAll) { count = 0; }
                        else { count-- }
                        !count && viewmask.hide();
                    }
                    callback instanceof Function && setTimeout(callback)
                };
            this.open = function () { mask(arguments[0], true) };
            this.close = function () {
                var callback = arguments[0],
                    closeAll = arguments[1];
                if (!(callback instanceof Function)) {
                    callback = null;
                    closeAll = arguments[0];
                }
                mask(callback, false, closeAll)
            };
        });

    }]);

    // 若图片加载不出来 example:<img imgError >
    app.directive('imgError', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr, ngModelCtrl) {
                var imgError = '/assets/img/public/img-error.jpg',
                    oriUrl = attr.original,
                    retry = 0;
                element[0].onerror = function () {
                    if (retry > 5 || !oriUrl) {
                        this.src = imgError;
                        this.setAttribute('data-original', imgError);
                        return;
                    }
                    retry++;
                    setTimeout(function () {
                        if (retry === 4) { oriUrl = oriUrl.replace('pfupv.igrow.cn', 'pic0.haoyuyuan.com') }
                        element[0].src = oriUrl + (~oriUrl.indexOf('?') ? '?' : '&') + 'r=' + Math.random()
                    }, 10);
                };
            }
        };
    });

    /*  mix uploader for WebUploader plugin  */
    app.directive('webUploader', ['$timeout', 'loadScript', 'viewMask', function ($timeout, loadScript, viewMask) {

        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                scope.$watch(attrs.webUploader, function (opts) {
                    opts && loadScript('http://assets.haoyuyuan.com/vendor/plugins/igrow/webuploader/0.1.7/webuploader.igrow.min.js', function () {

                        if (!WebUploader.Uploader.support()) {
                            alert('您的浏览器不支持上传功能！');
                            throw new Error('WebUploader does not support the browser you are using.');
                        }

                        //调整file控件位置
                        var resetInput = function () {
                            $timeout(function () {
                                var input = element.find('input[type=file]').first(),
                                    parent = input.parent(),
                                    keepclick = false;

                                element.append(input);
                                parent.remove();

                                //避免频繁点击操作
                                input.click(function (e) {
                                    if (keepclick) {
                                        e.stopPropagation();
                                        return false;
                                    }
                                    keepclick = true;
                                    $timeout(function () { keepclick = false }, 1000);
                                });
                            });
                        };

                        //如果对象已存在，则添加按钮，不再重新初始化
                        if (opts.WebUploader) {
                            opts.WebUploader.addButton({ id: element });
                            resetInput();
                            return;
                        }

                        //默认配置
                        var config = {
                            pick: {
                                id: element,
                                multiple: true,
                                capture: 'camera',
                                configkey: 'default_img'
                            },
                            accept: {
                                //默认限制图片格式，可自定义格式
                                extensions: 'bmp,gif,jpg,jpeg,png'
                            },
                            auto: true,
                            disableGlobalDnd: true,
                            prepareNextFile: true,
                            chunked: true,
                            chunkRetry: 0,
                            threads: 5,
                            fileNumLimit: 12,
                            fileSingleSizeLimit: 10 * 1024 * 1024,
                            duplicate: true,
                            thumb: {
                                width: 58,
                                height: 58,
                                // 图片质量，只有type为`image/jpeg`的时候才有效。
                                quality: 80,
                                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                                allowMagnify: false,
                                // 是否允许裁剪。
                                crop: true,
                                // 为空的话则保留原有图片格式。
                                // 否则强制转换成指定的类型。
                                type: 'image/jpeg'
                            },
                            compress: {
                                width: 800,
                                height: 800,
                                // 图片质量，只有type为`image/jpeg`的时候才有效。
                                quality: 80,
                                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                                allowMagnify: false,
                                // 是否允许裁剪。
                                crop: false,
                                // 是否保留头部meta信息。
                                preserveHeaders: true,
                                // 如果发现压缩后文件大小比原来还大，则使用原来图片
                                // 此属性可能会影响图片自动纠正功能
                                noCompressIfLarger: false,
                                // 单位字节，如果图片大小小于此值，不会采用压缩。
                                compressSize: 200 * 1024
                            }
                        };

                        //先将config中object键值提出来，以免后面的extend将其覆盖，因为该函数无法实现递归覆盖
                        angular.forEach(config, function (value, key) {
                            if (angular.isObject(value) && angular.isObject(this[key])) {
                                this[key] = angular.extend(value, this[key])
                            }
                        }, opts.options = opts.options || {});

                        //应用配置
                        config = angular.extend(config, opts.options);

                        //设置mimeTypes参数
                        if (config.accept.extensions && !config.accept.mimeTypes) {
                            config.accept.mimeTypes = getMimeTypes(config.accept.extensions)
                        }

                        //针对安卓平台的优化
                        if (WebUploader.os.android) {
                            delete config.pick.capture;
                            config.compress.width = Math.min(config.compress.width, 800);
                            config.compress.height = Math.min(config.compress.height, 800);
                        }

                        //上传插件对象由 this.WebUploader 获得
                        opts.WebUploader = WebUploader.create(config);

                        //遍历并绑定上传事件
                        angular.forEach(opts.events, function (fn, key) {
                            this.on(key, function () {
                                var _this = this, _arguments = arguments;
                                $timeout(function () { fn.apply(_this, _arguments) });
                            })
                        }, opts.WebUploader);

                        //针对安卓平台的优化
                        if (WebUploader.os.android) {
                            opts.WebUploader.on('startUpload', function () { viewMask.open() });
                            opts.WebUploader.on('uploadFinished', function () { viewMask.close() });
                        }

                        resetInput();

                    })
                })
            }
        }

    }]);

    /*
        获取用户信息
        获取当前学期
        获取当前学生或者老师
     */
    // 入口
    app.controller('mainController', ['$scope', '$q', '$route', '$timeout', 'routeConfig', 'resource', 'mLoading', 'mNotice', '$routeParams', function ($scope, $q, $route, $timeout, routeConfig, resource, mLoading, mNotice, $routeParams) {
        var userDao = resource('/user'),
            semesterDao = resource('/school/semester'),
            teacherDao = resource('/school/teacher'),
            teacherClassDao = resource('/school/teacher/class'),
            gradeDao = resource('/school/grade'),
            IGrow = window['IGrow'] || {},
            semesterPromise,
            userPromise,
            errors = 0,
            failCallback = function (result) {
                errors++;
                if (result && result.message) {
                    mNotice(result.message, 'error');
                }
                $('.hello-everyone').html('sorry,进入失败');
            };

        var mode = Utils.getQuery('mode');
        if (mode && mode == 'demo') {
            window.API.mode = 'demo';
        }


        // 正式进入
        $('body').append('<div class="hello-everyone" style="text-align:center;padding:15px;">正在进入...</div>');

        // 获取当前学期
        semesterPromise = semesterDao.list({}, function (result) {
            var semesterList = result.data || [];

            IGrow.semester = IGrow.getCurrentSemester(semesterList);
            IGrow.User.semesterid = IGrow.semester.id || 0;
            if (!IGrow.semester) {
                mNotice('当前学期不存在', 'error');
                errors++;
            }


        }, function (result) {
            failCallback(result);
        });
        // 获取当前用户
        userPromise = userDao.get({}, function (result) {
            var user = result.data || {};

            $scope.user = IGrow.user = user;


        }, function (result) {
            failCallback(result);
        });

        $q.all([semesterPromise, userPromise]).then(function () {
            var studentDao, teacherDao, schoolClassDao;

            if (errors > 0) {
                failCallback();
                return;
            }
            // 若是学生
            if (isStudent(IGrow.user)) {
                $('body').attr('role', 'student');
                studentDao = resource('/school/student');
                studentDao.get({ _relatedfields: 'class.name,class.id,grade.id,grade.name' }).then(function (result) {
                    var student = result.data || {};

                    IGrow.student = student;
                    initRouteConifg();

                }, function (result) {
                    failCallback(result);
                });

            } else {
                $('body').attr('role', 'teacher');
                teacherDao = resource('/school/teacher');
                gradeDao = resource('/school/grade');
                schoolClassDao = resource('/school/class');
                var gradeList, classList;
                teacherDao.get({}).then(function (result) {

                    var teacher = result.data || {};

                    IGrow.teacher = teacher;

                    var promiseGrade = gradeDao.list({}, function (result) {
                        gradeList = result.data || [];

                    }, function (result) {
                        failCallback(result);
                    });

                    var promiseClass = schoolClassDao.list({ _pagesize: 100 }, function (result) {
                        classList = result.data || [];
                    }, function (result) {
                        failCallback(result);
                    });

                    $q.all([promiseGrade, promiseClass]).then(function () {

                        angular.forEach(classList, function (item, _) {
                            var gradeid = item.gradeid, grade = Utils.getItem(gradeList, { id: gradeid });

                            if (grade) {
                                item._name = grade.name + item.name;
                            }
                        });
                        IGrow.teacher.classes = classList.sort(function (x, y) {
                            return (x.gradeid - y.gradeid) > 0 ? 1 : -1;
                        });
                        // init route
                        initRouteConifg();

                    }, function () {

                    });


                }, function (result) {
                    failCallback(result);
                });
            }



        }, function () {

        });

        function isStudent(user) {
            return user.typeid == 4 ? true : false;
        }
        function initRouteConifg() {
            // 绑定图片预览
            Utils.bindPreviewPhoto();
            // 假如没有路由 则显现完整菜单
            if (!location.hash) {
                $scope.flag = true;
                $('.intro').show();
            }

            $('.hello-everyone').remove();
            // 配置路由
            routeConfig(IGrow.modules);
            $route.reload();

        }

    }]);

    //运行期
    app.run(['$lazyload', function ($lazyload) {
        //Step5: init lazyload & hold refs
        $lazyload.init(app);
        app.register = $lazyload.register;
    }]);

    module.exports = app;

});