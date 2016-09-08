'use strict';

/*  jquery ready  */
(function ($) {
    /* textarea insert content */
    $.fn.insertContent = function (newValue, t) {
        var $t = $(this)[0];
        if (document.selection) {
            //$t.focus();
            var sel = document.selection.createRange();
            sel.text = newValue;
            //$t.focus();
            sel.moveStart('character', -l);
            var wee = sel.text.length;
            if (arguments.length == 2) {
                var l = $t.value.length;
                sel.moveEnd('character', wee + t);
                t <= 0 ? sel.moveStart('character', wee - 2 * t - newValue.length) : sel.moveStart('character', wee - t - newValue.length);
                //sel.select();
            }
            $t.blur();
        } else if ($t.selectionStart || $t.selectionStart == '0') {
            var startPos = $t.selectionStart;
            var endPos = $t.selectionEnd;
            var scrollTop = $t.scrollTop;
            $t.value = $t.value.substring(0, startPos) + newValue + $t.value.substring(endPos, $t.value.length);
            //$t.focus();
            $t.selectionStart = startPos + newValue.length;
            $t.selectionEnd = startPos + newValue.length;
            $t.scrollTop = scrollTop;
            if (arguments.length == 2) {
                $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                //$t.focus();
            }
            $t.blur();
        }
        else {
            $t.value += newValue;
            //$t.focus();
            $t.blur();
        }
    };
})(jQuery);

/*  app  */
(function (app) {

    /*   default config   */
    var defaults = {
        redirect: 'school/public',
        rootPath: location.protocol + '//' + location.host,
        timestamp: Date.parse(new Date()) / 1000,
        automask: false,
        autotips: false, /*[true:all,1:success,2:error]*/
        app: { code: '', dir: '', dashboard: '', schoolmanager: '', styles: [], scripts: [], modules: [] },
        map: [{ path: '', view: '', viewUrl: null, styles: null, scripts: null, modules: null }],
        menu: [{ code: '', name: '', icon: '' }],
        service: { /* $resource actions */ },
        eachpath: function (list, ext) { angular.forEach(list, function (path) { this.push(defaults.extpath(path, ext)) }, list = []); return list },
        extpath: function (path, ext) {
            var filedir = defaults.rootPath + '/dist/' + (ext === 'html' ? 'views' : ext) + '/' + defaults.app.dir,
                fileext = '.' + ext,
                nofirst = !/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(path),
                noparam = !new RegExp('\\.' + ext + '\\?', 'i').test(path),
                nullext = !new RegExp('(\\.' + ext + '$)|(\\.' + ext + '\\?)', 'i').test(path);
            if (nofirst) path = filedir + path;
            if (nullext) path = path + fileext;
            if (nofirst && noparam) path = path + '?t=' + defaults.timestamp;
            return path;
        },
        browser: (function (ua) {
            var ret = {},
                weixin = ua.match(/MicroMessenger\/([\d.]+)/);
            weixin && (ret.weixin = parseFloat(weixin[1]));
            return ret;
        }(navigator.userAgent)),
        os: (function (ua) {
            var ret = {},
                android = ua.match(/(?:Android);?[\s\/]+([\d.]+)?/),
                ios = ua.match(/(?:iPad|iPod|iPhone).*OS\s([\d_]+)/);
            android && (ret.android = parseFloat(android[1]));
            ios && (ret.ios = parseFloat(ios[1].replace(/_/g, '.')));
            return ret;
        }(navigator.userAgent))
    },

    mimetypes = (function () {
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

    /*  extend config  */
    IGrow.Config && angular.forEach(defaults, function (item, name, config) { if ((config = IGrow.Config[name]) && item instanceof Array) { defaults[name] = config } else if (typeof item === 'object') { angular.extend(item, config) } else if (config !== undefined) { defaults[name] = config } });

    /*  config  */
    app.config(['$animateProvider', '$compileProvider', '$controllerProvider', '$filterProvider', '$httpProvider', '$locationProvider', '$routeProvider', '$provide', function ($animateProvider, $compileProvider, $controllerProvider, $filterProvider, $httpProvider, $locationProvider, $routeProvider, $provide) {

        /*  HTML5 mode  */
        $locationProvider.html5Mode(true);//.hashPrefix('!');

        /*  clear unsafe  */
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);

        /*  register the interceptor via an anonymous factory  */
        $httpProvider.interceptors.push(['$q', 'tips', 'viewMask', function ($q, tips, viewMask) {
            return {
                request: function (request) {
                    if (request.url && /\/api\/1.1b\//i.test(request.url) && request.method) {
                        var reset = function (data) {
                            angular.forEach(['automask', 'autotips'], function (key) {
                                request[key] = data[key] === undefined ? defaults[key] : data[key];
                                delete data[key];
                            });
                            delete data._api_action;
                            if (IGrow.User) {
                                if (IGrow.User.schoolid && !/\/api\/1.1b\/school\/(student|teacher|parent|people)\/get/i.test(request.url)) {
                                    data.schoolid = data.schoolid || IGrow.User.schoolid
                                }
                                if (IGrow.User.semesterid && !/\/api\/1.1b\/auth\//i.test(request.url)) {
                                    data.semesterid = data.semesterid || IGrow.User.semesterid
                                }
                            }
                            return data
                        };
                        if (request.method.toUpperCase() === 'GET') {
                            request.params = reset(request.params || {});
                        } else {
                            request.data = reset(request.data || {});
                            request.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                            request.transformRequest = [function (data) { return angular.isObject(data) ? $.param(angular.forEach(data, function (item, key) { data[key] = (angular.isArray(item) || angular.isObject(item)) ? JSON.stringify(item) : item })) : data }];
                        }
                        request.automask && viewMask.open();
                        request.url = decodeURIComponent(request.url);
                    }
                    return request
                },
                requestError: function (request) { return $q.reject(request) },
                response: function (response) {
                    if (response.config) {
                        response.config.automask && viewMask.close();
                        response.data.message && (response.config.autotips === true || response.config.autotips === 1) && tips.success(response.data.message);
                    }
                    return response
                },
                responseError: function (response) {
                    if (response.config) {
                        response.config.automask && viewMask.close();
                        response.data.message && (response.config.autotips === true || response.config.autotips === 2) && tips.error(response.data.message);
                    }
                    if (response.data.code == '10020002') { location.href = 'http://auth.igrow.cn/auth/login?go=' + encodeURIComponent(location.href); }
                    return $q.reject(response)
                }
            }
        }]);

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

        /*  module injector  */
        $provide.factory('moduleInjector', ['$injector', '$log', function ($injector, $log) {
            var $injected = {},
                invokeQueue = [],
                runBlocks = [],
                providers = {
                    $animateProvider: $animateProvider,
                    $compileProvider: $compileProvider,
                    $controllerProvider: $controllerProvider,
                    $filterProvider: $filterProvider,
                    $provide: $provide
                };
            return function (modules) {
                modules && angular.forEach(modules instanceof Array ? modules : [modules], function (item, module) {
                    try {
                        if (!$injected[item] && (module = angular.module(item))) {
                            invokeQueue = invokeQueue.concat(module._invokeQueue);
                            runBlocks = runBlocks.concat(module._runBlocks);
                            $injected[item] = true;
                        }
                    } catch (ex) {
                        if (ex.message) {
                            ex.message += ' from ' + item;
                            $log.error(ex.message);
                        }
                        throw ex
                    }
                });
                angular.forEach(invokeQueue, function (item, provide) {
                    try {
                        item.length > 2 && providers.hasOwnProperty(item[0]) && (provide = providers[item[0]]) && provide[item[1]].apply(provide, item[2])
                    } catch (ex) {
                        if (ex.message) {
                            ex.message += ' from ' + JSON.stringify(item);
                            $log.error(ex.message);
                        }
                        throw ex
                    }
                });
                angular.forEach(runBlocks, function (item) { $injector.invoke(item) });
                invokeQueue.length = 0;
                runBlocks.length = 0;
            }
        }]);

        /*  route apply  */
        $provide.factory('routeApply', ['$q', '$location', 'moduleInjector', 'loadScript', function ($q, $location, moduleInjector, loadScript) {
            var defer = {};
            return function (routes) {
                angular.forEach(routes, function (route) {
                    if (route.view || route.viewUrl) {
                        angular.forEach(route.scripts ? (route.scripts instanceof Array ? route.scripts : [route.scripts]) : [], function (path) { this.push(defaults.extpath(path, 'js')) }, route.scripts = []);
                        angular.forEach(route.path instanceof Array ? route.path : [route.path], function (path) {
                            this.when('/m/' + path, {
                                template: route.viewUrl ? undefined : route.view,
                                templateUrl: route.viewUrl ? defaults.extpath(route.viewUrl, 'html') : undefined,
                                resolve: {
                                    promise: function () {
                                        if (!defer[path]) {
                                            if (!IGrow.User && !/^\/m\/school|aboutSchool\/.+/.test($location.url())) {
                                                setTimeout(function () {
                                                    defer[path].reject();
                                                    $location.path('/m/' + defaults.redirect);
                                                    $location.replace();
                                                })
                                            } else {
                                                $('body>section').css({ visibility: 'hidden' });
                                                loadScript(route.scripts, function () {
                                                    moduleInjector(route.modules);
                                                    defer[path].resolve();
                                                    setTimeout(function () { $('body>section').css({ visibility: 'visible' }) });
                                                })
                                            }
                                        }
                                        return (defer[path] = defer[path] || $q.defer()).promise;
                                    }
                                }
                            })
                        }, $routeProvider)
                    }
                });
                $routeProvider.otherwise({ redirectTo: '/m/' + defaults.redirect });
            }
        }]);

        /*  api service  */
        /*  
         * $resource(url, [paramDefaults], [actions], options);
         *
         * config:
         * $api.apply({
         *  name1 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         *  name2 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         *  name3 : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null],
         * });
         * 
         * use:
         * $api.name1.action([parameters], [success], [error])
         * $api.name2.action([parameters], postData, [success], [error])
         */
        $provide.service('$api', ['$resource', function ($resource) {

            var fullUrl = function (url, bool) { return (/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url) ? url : (location.protocol + '//' + location.host + '/api/1.1b/' + url)) + (bool ? '/:_api_action' : '') };

            this.$apply = function (items, clear) {

                clear && angular.forEach(this, function (item, name) {

                    if (name !== '$apply') {
                        delete this[name]
                    }

                }, this);

                angular.forEach(items, function (item, name) {

                    if (item instanceof Array) {

                        var url = item[0],
                            paramDefaults = item[1],
                            actions = item[2],
                            options = item[3];

                        if (url) {

                            actions = angular.forEach(angular.extend({
                                get: { method: 'GET' },
                                list: { method: 'GET' },
                                search: { method: 'GET' },
                                set: { method: 'POST' },
                                create: { method: 'POST' },
                                update: { method: 'POST' },
                                remove: { method: 'POST' },
                                'delete': { method: 'POST' }
                            }, actions), function (action, name) {
                                action = action || {};
                                if (action.url) { action.url = fullUrl(action.url) }
                                action.method = action.method || 'GET';
                                action.params = angular.extend(action.url ? {} : { _api_action: name === 'remove' ? 'delete' : name }, action.params);
                            });

                            this[name] = $resource(fullUrl(url, true), paramDefaults, actions, options);

                        }

                    }

                }, this);

                return this;

            }

        }]);

        /*  tips  */
        $provide.factory('tips', function () {
            var zIndex = 1050, dialog, dialogId = 'dialog' + Date.parse(new Date()) / 1000,
                tip = function (content, config) {
                    if (content) {
                        config = angular.extend({ clas: 'modal-primary', icon: 'fa fa-question-circle', timeout: 2000 }, config);
                        var timer, modal, modalId = 'modal' + new Date().getTime(),
                            remove = function () {
                                modal.animate({ marginTop: 0, opacity: 0 }, 200, function () {
                                    $(this).remove();
                                    config.callback instanceof Function && setTimeout(config.callback);
                                    !dialog.children('.modal-content').length && dialog.parent().remove()
                                })
                            };
                        if (!document.getElementById(dialogId)) {
                            $('body>section>div[ng-view]').children().each(function (i) { if (!!parseInt($(this).css('zIndex'))) zIndex = parseInt($(this).css('zIndex')) + 1 });
                            $('body>section>div[ng-view]').append('<div class="modal modal-tips" style="z-index:' + zIndex + '" id="' + dialogId + '"><div class="modal-mask"></div><div class="modal-dialog"></div></div>');
                            dialog = $('#' + dialogId + '>.modal-dialog');
                        }
                        dialog.append(['<div id="' + modalId + '" class="modal-content ' + config.clas + '">', '<i class="' + config.icon + '"></i>', '<a href="javascript:void(0)" class="iconfont icon-close"></a>', '<div class="modal-body">', content, '</div>', '</div>'].join(''));
                        modal = $('#' + modalId).animate({ marginTop: 15, opacity: 1 }, 200).mouseenter(function () { timer && clearTimeout(timer) }).mouseleave(function () { if (config.timeout) timer = setTimeout(remove, config.timeout) });
                        modal.children('a').click(remove);
                        if (config.timeout) timer = setTimeout(remove, config.timeout);
                    }
                    return tip
                };
            tip.extend = function () {
                var $this = this, conf, config = arguments[0] || [], i = 0;
                if (!(config instanceof Array)) { config = [config] }
                for (; i < config.length; i++) {
                    (conf = config[i]) && typeof conf === 'object' && (function (conf) {
                        $this[conf.name] = function (content, config) {
                            if (typeof config === 'number') { config = { timeout: config } }
                            if (typeof config === 'function') { config = { callback: config } }
                            return tip(content, angular.extend(angular.copy(conf), config))
                        }
                    })(conf)
                }
                return $this
            };
            return tip.extend([
                { name: 'alert', clas: 'modal-primary', icon: 'iconfont icon-questionfill' },
                { name: 'success', clas: 'modal-success', icon: 'iconfont icon-roundcheck' },
                { name: 'info', clas: 'modal-info', icon: 'iconfont icon-infofill' },
                { name: 'warning', clas: 'modal-warning', icon: 'iconfont icon-warnfill' },
                { name: 'error', clas: 'modal-danger', icon: 'iconfont icon-infofill', timeout: 0 }
            ])
        });

        /*  view mask  */
        $provide.service('viewMask', function () {
            var count = 0,
                viewmask = $('body>div.view-mask').hide(),
                mask = function (callback, bool, closeAll) {
                    if (bool) {
                        count++;
                        !$('.modal-backdrop').length && viewmask.show();
                    } else {
                        if (closeAll) { count = 0 }
                        else { count-- }
                        !count && viewmask.hide()
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

    /*  weixin uploader for weixin plugin  */
    app.directive('weixinUploader', ['$api', '$timeout', function ($api, $timeout) {
        /*
        //针对微信定义的配置
        weixin: {
            //设置上传仓库
            configkey: 'default_pic',
            //目标对应事件
            image: {
                choose: function (list) {
                    angular.forEach(list, function (item) {
                        if ($me.photo.list.length < 9) {
                            $me.photo.list.push(item.id);
                            $me.photo.queued[item.id] = {
                                id: item.id,
                                ready: true
                            };
                        } else {
                            item.cancel = true;
                        }
                    })
                },
                upload: function (data) {
                    $me.photo.uploading = true;
                    delete $me.photo.queued[data.id].ready;
                    $me.photo.queued[data.id].progress = true;
                },
                success: function (data) {
                    delete $me.photo.queued[data.id].progress;
                    $me.photo.queued[data.id].src = data.url + '!square.75';
                    $me.photo.queued[data.id].url = data.url;
                    $me.photo.queued[data.id].urlhash = data.urlhash;
                    $me.imglist.push(data.url);
                    $me.imghashlist.push(data.urlhash);
                },
                error: function (data) {
                    delete $me.photo.queued[data.id].progress;
                    $me.photo.queued[data.id].error = true;
                },
                complete: function () {
                    $me.photo.uploading = false;
                }
            }
        },
        */
        /*
        $api.$apply({
            _m_wx: ['wx', , { sdkencrypt: { method: 'POST' } }],
            _m_media: ['file/upload/media', , { get: { method: 'GET' } }]
        });
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {

                if (attrs.weixinUploader) {

                    //定义变量
                    var $opts = {},
                        $event,
                        wx = window.jWeixin,
                        jsApiList = [],
                        isRequest = false;

                    //定义全局变量，因eval操作得不到当前作用域，用完后清除变量占用
                    window._temp_$scope_weixinUploader = scope;
                    $opts = eval('window._temp_$scope_weixinUploader.' + attrs.weixinUploader);
                    delete window._temp_$scope_weixinUploader;
                    $opts = $opts.options;

                    //设置上传仓库
                    $opts.configkey = $opts.configkey || 'default_asset';

                    //事件只能实现其一，多配置优先执行图片上传事件（微信jssdk暂且只支持 图片，音频 的上传接口）
                    if ($opts.image) {
                        //检查图片相关的API列表
                        jsApiList = jsApiList.concat([
                            'chooseImage',
                            'uploadImage',
                            'previewImage'
                        ])
                    } else if ($opts.voice) {
                        //检查音频相关的API列表
                        jsApiList = jsApiList.concat([
                            'startRecord',
                            'stopRecord',
                            'onVoiceRecordEnd',
                            'playVoice',
                            'pauseVoice',
                            'stopVoice',
                            'onVoicePlayEnd',
                            'uploadVoice'
                        ])
                    }

                    element.click(function () {

                        if (isRequest) return;
                        isRequest = true;

                        //获取sdkencrypt
                        $api._m_wx.sdkencrypt({
                            schoolid: IGrow && IGrow.User && IGrow.User.schoolid || 0,
                            url: window.location.href.split('#')[0]
                        }, function (result) {

                            //初始化配置
                            wx.config(angular.extend({
                                debug: false,            // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                appId: '',              // 必填，公众号的唯一标识
                                timestamp: '',          // 必填，生成签名的时间戳
                                nonceStr: '',           // 必填，生成签名的随机串
                                signature: '',          // 必填，签名，见附录1
                                jsApiList: jsApiList    // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                            }, result.data));

                            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                            wx.ready(function () {

                                //接口事件项
                                //success：接口调用成功时执行的回调函数。
                                //fail：接口调用失败时执行的回调函数。
                                //complete：接口调用完成时执行的回调函数，无论成功或失败都会执行。
                                //cancel：用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到。
                                //trigger: 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口。

                                if ($opts.image) {

                                    //获取事件
                                    $event = $opts.image;

                                    wx.chooseImage({
                                        success: function (res) {

                                            // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                                            angular.forEach(res.localIds || [], function (val) {
                                                this.push({
                                                    id: new Date().valueOf() + parseInt(Math.random() * 1000),
                                                    localId: val
                                                })
                                            }, res.localIds = []);

                                            var index = 0,
                                                localIds = res.localIds,
                                                upload = function (item) {
                                                    $timeout(function () {
                                                        index++;
                                                        if (item.cancel) {
                                                            index > 1 && $event.complete && $event.complete();
                                                        } else {

                                                            //上传前执行事件
                                                            $event.upload && $event.upload(item);

                                                            var success = function (result) {
                                                                result.data.id = item.id;
                                                                $event.success && $event.success(result.data);
                                                                complete();
                                                            },
                                                            error = function () {
                                                                $event.error && $event.error({
                                                                    id: item.id,
                                                                    error: arguments
                                                                });
                                                                alert(JSON.stringify(arguments));
                                                                complete();
                                                            },
                                                            complete = function () {
                                                                //微信接口不支持并发上传，只能按序上传
                                                                if (index < localIds.length) {
                                                                    upload(localIds[index])
                                                                } else {
                                                                    $event.complete && $event.complete()
                                                                }
                                                            };

                                                            //开始上传
                                                            wx.uploadImage({
                                                                localId: item.localId,  // 需要上传的图片的本地ID，由chooseImage接口获得
                                                                isShowProgressTips: 0,  // 默认为1，显示进度提示
                                                                success: function (result) {
                                                                    // 返回图片的服务器端ID
                                                                    $api._m_media.get({
                                                                        automask: false,
                                                                        configkey: $opts.configkey,
                                                                        schoolid: IGrow && IGrow.User && IGrow.User.schoolid || 0,
                                                                        media_id: result.serverId
                                                                    }, success, error)
                                                                },
                                                                fail: error
                                                            })

                                                        }
                                                    })
                                                };

                                            //响应选择事件
                                            $timeout(function () {

                                                $event.choose && $event.choose(localIds);

                                                //微信接口不支持并发上传，只能按序上传
                                                upload(localIds[index]);

                                            });

                                        },
                                        complete: function () {
                                            isRequest = false
                                        }
                                    })

                                } else if ($opts.voice) {
                                    //执行UI层初始化及相关事件绑定
                                    return;
                                    wx.startRecord();
                                    wx.stopRecord({
                                        success: function (res) {
                                            var localId = res.localId;
                                            wx.playVoice({
                                                localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
                                            });
                                            wx.pauseVoice({
                                                localId: localId // 需要暂停的音频的本地ID，由stopRecord接口获得
                                            });
                                            wx.stopVoice({
                                                localId: localId // 需要停止的音频的本地ID，由stopRecord接口获得
                                            });
                                            wx.onVoicePlayEnd({
                                                success: function (res) {
                                                    var localId = res.localId; // 返回音频的本地ID
                                                }
                                            });
                                            wx.uploadVoice({
                                                localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                                                isShowProgressTips: 1, // 默认为1，显示进度提示
                                                success: function (res) {
                                                    // 返回音频的服务器端ID
                                                    $api._m_media.get({
                                                        configkey: $opts.configkey,
                                                        schoolid: IGrow && IGrow.User && IGrow.User.schoolid || 0,
                                                        media_id: res.serverId
                                                    }, function (result) {
                                                        $opts.voice(result.data)
                                                    })
                                                }
                                            });
                                        }
                                    });
                                    wx.onVoiceRecordEnd({
                                        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                                        complete: function (res) {
                                            var localId = res.localId;
                                        }
                                    });
                                }

                            });

                            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                            wx.error(function () {
                                isRequest = false
                            });

                        }, function () {
                            isRequest = false
                        })

                    })

                }

            }
        }
        */
    }]);

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

    /*  datetimepicker  */
    app.directive('datetimepicker', ['$parse','$q', '$timeout', 'loadScript', 'loadStyle', function ($parse,$q, $timeout, loadScript, loadStyle) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                var exist = !!$.fn.datetimepicker;
                $q.all([
                    exist ? null : loadScript(['http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.0/js/bootstrap-datetimepicker.min.js',
                    'http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.3.4/js/locales/bootstrap-datetimepicker.zh-CN.js'])
                ]).then(function () {
                    // get component element
                    var component = element.parent().addClass('date'),

                    // get picker element
                        picker = component.datetimepicker(angular.extend({
                            autoclose: true,
                            format: 'yyyy-mm-dd',
                            language: 'zh-CN',
                            pickerPosition: 'bottom-left'
                        }, element.data() || {})).data('datetimepicker').picker;

                    // replace the arrow icon
                    picker.find('.icon-arrow-left').replaceWith('<i class="icon-chevron-left"></i>');
                    picker.find('.icon-arrow-right').replaceWith('<i class="icon-chevron-right"></i>');

                    //fix iphone bug
                    !function(isIphone){
                        isIphone && $(document).on('click touchstart',function(event){
                            if ($(event.target).closest('.datetimepicker').length === 0) {
                                component.datetimepicker('hide');
                            }
                        });
                        isIphone && element.on('touchstart', function(event) {
                            component.datetimepicker('show');
                            $(this).blur();
                            return false;
                        });

                    }(navigator.userAgent.match(/iPhone/i));
                    // execute the init event
                    attrs.eventInit && $parse(attrs.eventInit, null, true)(scope, { $event: null });
                    delete attrs.eventInit;

                    // execute the plugin event
                    angular.forEach(attrs, function (item, key, name) {
                        if (/^event/.test(key)) {
                            name = key.replace(/^event/, '').replace(/^\w/, function (v) { return v.toLowerCase() });
                            component.on(name, function (event) { $timeout(function () { $parse(attrs[key], null, true)(scope, { $event: event }) }) });
                        }
                    });
                })
            }
        }
    }]);

    /*  modal confirm  */
    app.directive('modalConfirm', ['$parse', function ($parse) {
        var dialog, $scope, $fn, $event, $confirm, $cancel;
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                //attrs.modalContent
                //attrs.modalConfirm
                //attrs.modalCancel
                if (!$('div[ng-view]>.modal-confirm').length) {
                    var tmpl = [];
                    tmpl.push('<div class="modal modal-confirm">');
                    tmpl.push('<div class="modal-dialog">');
                    tmpl.push('<div class="modal-content">');
                    tmpl.push('<div class="modal-body"></div>');
                    tmpl.push('<div class="modal-footer">');
                    tmpl.push('<button type="button" class="btn btn-danger">确定</button>');
                    tmpl.push('<button type="button" class="btn btn-default">取消</button>');
                    tmpl.push('</div>');
                    tmpl.push('</div>');
                    tmpl.push('</div>');
                    tmpl.push('</div>');
                    $('body>section>div[ng-view]').append(dialog = $(tmpl.join('')));
                    dialog.find('button.btn-danger').click(function (event) {
                        $event = event;
                        $fn = $confirm;
                        dialog.modal('hide');
                    });
                    dialog.find('button.btn-default').click(function (event) {
                        $event = event;
                        $fn = $cancel;
                        dialog.modal('hide');
                    });
                    dialog.on('hidden.bs.modal', function (e) {
                        $event && $scope.$apply(function () {
                            $fn && $fn($scope, { $event: $event });
                            $event = null;
                        })
                    });
                }
                element.click(function (event) {
                    $scope = scope;
                    $confirm = attrs.modalConfirm && $parse(attrs.modalConfirm);
                    $cancel = attrs.modalCancel && $parse(attrs.modalCancel);
                    dialog.modal('show').find('div.modal-body').html('<b>' + (attrs.modalContent || '确认要删除吗？') + '</b>');
                });
            }
        }
    }]);

    /*  modal preview  */
    app.directive('modalPreview', ['$parse', '$q', '$rootScope', 'loadScript', function ($parse, $q, $rootScope, loadScript) {
        var dialog, $scope, $event, $remove,
            $ua = navigator.userAgent,
            showGroup = [];//jquery.touchSwipe.min.js
        //$rootScope.$on('$routeChangeSuccess', function () { showGroup = [] });
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                //attrs.modalPreview
                //attrs.modalRemove
                $q.all([
                    loadScript('http://assets.haoyuyuan.com/vendor/plugins/jquery/touchSwipe/1.6.9/jquery.touchSwipe.min.js')
                ]).then(function () {
                    if (!$('div[ng-view]>.modal-preview').length) {
                        var tmpl = [];
                        tmpl.push('<div class="modal modal-preview">');
                        tmpl.push('<div class="modal-dialog">');
                        tmpl.push('<div class="modal-content">');
                        tmpl.push('<div class="modal-body"></div>');
                        tmpl.push('<div class="modal-footer">');
                        tmpl.push('<a href="javascript:void(0)" class="glyphicon glyphicon-trash" data-dismiss="modal"></a>');
                        tmpl.push('</div>');
                        tmpl.push('</div>');
                        tmpl.push('</div>');
                        tmpl.push('</div>');
                        $('body>section>div[ng-view]').append(dialog = $(tmpl.join('')));
                        dialog.find('.glyphicon-trash').click(function () {
                            if ($remove) {
                                $scope.$apply(function () {
                                    $remove($scope, { $event: $event });
                                    $scope = null;
                                    $event = null;
                                })
                            } else {
                                $scope = null;
                                $event = null;
                            }
                        });
                        dialog.find('.modal-body').swipe({
                            //Generic swipe handler for all directions
                            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                                console.log('event', event, 'direction', direction, 'distance', distance, 'duration', duration, 'fingerCount', fingerCount, 'fingerData', fingerData);
                            },
                            pinchStatus: function (event, direction, distance, duration, fingerCount, zoom, fingerData) {
                                if (event.touches && event.touches[0] && event.touches[0].pageX && event.touches[0].pageY) {
                                    console.log('direction', direction, 'pinchStatus', event, 'pageX', event.touches[0].pageX, 'pageY', event.touches[0].pageY)
                                } else {
                                    console.log('direction', direction)
                                }
                                //console.log('event', event, 'direction', direction, 'distance', distance, 'duration', duration, 'fingerCount', fingerCount, 'zoom', zoom, 'fingerData', fingerData);
                            }
                        });
                    }
                    element.click(function (event) {

                        dialog.find('.modal-body').html('<img src="/assets/img/public/loader.gif" />');

                        if (attrs.modalPreview) {

                            $scope = scope;
                            $event = event;

                            if (attrs.modalRemove) {
                                $remove = $parse(attrs.modalRemove)
                            } else {
                                $remove = null
                            }

                            var imgData = $parse(attrs.modalPreview)($scope, { $event: $event });
                            if (angular.isObject(imgData)) {
                                if (imgData.ready || imgData.progress) return;
                                if (imgData.error) {
                                    dialog.find('.modal-body').html('<img src="/assets/img/upload/loser.png" />');
                                    return;
                                }
                            } else if (typeof imgData === 'string') {
                                imgData = { url: imgData }
                            } else {
                                dialog.find('.modal-body').html('<img src="/assets/img/public/img-error.png" />');
                                return;
                            }

                            attrs.modalRemove ? dialog.removeClass('onlyview') : dialog.addClass('onlyview');
                            dialog.modal('show');

                            var img = document.createElement('img');
                            img.onload = function () {
                                dialog.find('.modal-body').html(img)
                            };
                            img.onerror = function () {
                                dialog.find('.modal-body').html('<img src="/assets/img/public/img-error.png" />')
                            };
                            img.src = imgData.url;

                        }

                    });
                })
            }
        }
    }]);

    /*  clear ios input shadow  */
    app.directive('clearIosShadow', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                //清除iOS中input阴影样式
                if (/(?:iPad|iPod|iPhone).*OS\s([\d_]+)/i.test(navigator.userAgent)) {
                    element.addClass('clear-ios-shadow')
                }
            }
        }
    }]);

    /*  asynchronous load img  */
    app.directive('loadUrl', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ctrl) {
                if (element[0].tagName === 'IMG') {

                    element.attr('src', '/assets/img/public/loader.gif');

                    if (attrs.loadUrl) {

                        var img = document.createElement('img');

                        img.onload = function () {
                            element.attr('src', this.src);
                            img = null;
                        };

                        img.onerror = function () {
                            element.attr('src', '/assets/img/public/img-error.png');
                            img = null;
                        };

                        img.src = attrs.loadUrl;

                    }

                }
            }
        }
    }]);

    /*  html5 audio,video  */ //暂不启用
    app.directive('html5media', ['$q', 'loadScript', 'loadStyle', function ($q, loadScript, loadStyle) {
        return {
            restrict: 'E',
            link: function (scope, element, attrs, ctrl) {
                return;
                $q.all([
                    loadStyle('http://assets.haoyuyuan.com/vendor/plugins/video-js/4.12.7/video-js.min.css', true),
                    loadScript('http://assets.haoyuyuan.com/vendor/plugins/video-js/4.12.7/' + (defaults.os.ios ? 'video.novtt.js' : 'video.js'))
                ]).then(function () {

                    if (!defaults.os.ios) videojs.options.flash.swf = 'http://assets.haoyuyuan.com/vendor/plugins/video-js/4.12.7/video-js.swf';

                    //audio
                    if (/\.mp3$/i.test(attrs.src)) {
                        console.log('audio', attrs.src)
                    }

                    //video
                    if (/(\.mp4|\.mov)$/i.test(attrs.src)) {
                        var width = element.parent().width(),
                            type = mimetypes[attrs.src.match(/(\w+)$/gi)[0].toLowerCase()] || 'video/mp4',
                            elem = [];
                        elem.push('<video class="video-js" width="' + width + 'px" height="' + parseInt(width / 16 * 9) + 'px" controls preload="none" data-setup="{}">');
                        elem.push('<source src="' + attrs.src + '" type="' + type + '" />');
                        elem.push('</video>');
                        element.replaceWith(elem.join(''));
                    }

                })

            }
        }
    }]);

    /*  embed convert for youku.com  */
    app.directive('embed', [function () {
        return {
            restrict: 'E',
            link: function (scope, element, attrs, ctrl) {
                //if (defaults.os.android || defaults.os.ios) {
                if (/^http\:\/\/player\.youku\.com/i.test(attrs.src)) {
                    var width = attrs.width || '100%',
                        height = attrs.height || 300,
                        code = (/player\.php\/sid\/(.+)\/v.swf$/i.exec(attrs.src) || [])[1] || '';
                    code && element.replaceWith('<iframe width="' + width + '" height="' + height + '" src="http://player.youku.com/embed/' + code + '" frameborder="0" allowfullscreen></iframe>')
                }
                //}
            }
        }
    }]);

    /*过滤图片，视频内容指令*/
    /*<div ng-bind-html="content" youku-ad-remove="content" data-width="500px" data-height="300px"></div>*/
    app.directive('youkuAdRemove',['$timeout','loadScript',function($timeout,loadScript){
        return {
            restrict:'A',
            link:function(scope,element,attrs,ctrl){
                var renderMovie = function(data) {
                    $timeout(function(){
                        var embed = element.find("embed"),
                            img = element.find("img");
                        embed.length && angular.forEach(embed, function (item, index){
                            if (/^http\:\/\/player\.youku\.com/i.test(item.src)) {
                                var code = (/player\.php\/sid\/(.+)\/v.swf$/i.exec(item.src) || [])[1] || '',
                                    width = attrs.width || '100%',
                                    height = attrs.height || 250;
                                code && $(item).replaceWith('<iframe width="' + width + '" height="' + height + '" src="http://player.youku.com/embed/' + code + '" frameborder="0" allowfullscreen></iframe>');
                            }
                        });
                        img.length && angular.forEach(img,function(item){
                            $(item).css("max-width","100%");
                        });
                    });
                };
                scope.$watch(attrs.youkuAdRemove,renderMovie);
            }
        }
    }]);

    /*  app controller  */
    app.controller(app.name + '.controller', ['$rootScope', '$location', '$route', '$q', '$api', 'routeApply', 'viewMask', function ($rootScope, $location, $route, $q, $api, routeApply, viewMask) {

        if (/^\/m\/school\/public\/\w\/\w\/\d/.test($location.url())) {
            delete IGrow.User;
        }
        if (!IGrow.User && !/^\/m\/school|aboutSchool\/.+/.test($location.url())) {
            $location.path('/m/' + defaults.redirect);
            $location.replace();
        }

        $api.$apply(angular.extend(defaults.service || {}, {
            _m_role: ['auth/user/role', , { check: {} }],
            _m_semester: ['school/semester'],
            _m_school: ['school']
        }));

        $q.all([
            IGrow.User ? $api._m_role.check({ uid: IGrow.User.uid, rolecodes: defaults.app.schoolmanager }).$promise : null,
            IGrow.User ? $api._m_semester.list({ _orderby: 'starttime desc' }).$promise : null,
            IGrow.User ? $api._m_school.get().$promise : null
        ]).then(function (result) {
            result[0] && result[0].data && (function (result) {
                if (result.roles && result.roles.length) {
                    IGrow.User.school.manager = {};
                    angular.forEach(result.roles, function (item) {
                        if (item = item.replace('school.', '')) {
                            IGrow.User.school.manager[item] = true
                        }
                    })
                }
            })(result[0].data);
            result[1] && result[1].data && (function (data) {
                var before, after;
                angular.forEach(data, function (item) {
                    if (!IGrow.User.semesterData.current) {
                        if (item.status === 1) {
                            IGrow.User.semesterData.current = item
                        }
                        if (item.status === 2 && !before) {
                            before = item
                        }
                        if (item.status === 0) {
                            after = item
                        }
                    }
                });
                if (!IGrow.User.semesterData.current && (before || after)) {
                    IGrow.User.semesterData.current = before || after
                }
                IGrow.User.semesterid = IGrow.User.semesterData.current && IGrow.User.semesterData.current.id || 0;
            })(IGrow.User.semesterData = result[1].data || []);
            result[2] && result[2].data && (function (result) {
                IGrow.User.school = angular.extend(result || {}, IGrow.User.school || {});
            })(result[2].data);
            setTimeout(function () {

                routeApply(defaults.map);
                $route.reload();

                //#1
                $rootScope.$on('$routeChangeStart', function (event, next, current) {
                    document.title = '';
                    $('body>.modal-backdrop').remove();
                    viewMask.open();
                });
                //#2
                $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl, newState, oldState) {
                    if (/\/main\//.test(newUrl)) {
                        event.preventDefault && event.preventDefault();
                        location.href = decodeURIComponent(newUrl);
                    }
                });
                //#3
                $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl, newState, oldState) { });
                //#4
                $rootScope.$on('$routeChangeSuccess', function (event, current, previous) { viewMask.close() });

            });
        });

    }]);

    /*  angular rendering  */
    angular.element(document).ready(function () {
        var rootCtrl = $(document.body).attr('ng-controller', app.name + '.controller');
        IGrow.User && rootCtrl.attr('class', IGrow.User.school.student ? 'm-app-student' : 'm-app-teacher');
        angular.bootstrap(document, [app.name]);
    });

}(angular.module('m.app', ['ngResource', 'ngRoute', 'ngSanitize'])));