; (function (app) {
    app.controller('m.classaction.controller', ['$routeParams', '$scope', '$timeout', '$location', '$q', '$api', 'tips', 'mNotice','$sce','tools',
        function ($routeParams, $scope, $timeout, $location, $q, $api, tips, mNotice,$sce,tools) {

        document.title = '班级动态';

        var $me = this;

        $me.articleID = $routeParams.id || '';

        //删除数组中的元素
        Array.prototype.removeByValue = function(val) {
          for(var i=0; i<this.length; i++) {
            if(this[i] == val) {
              this.splice(i, 1);
              break;
            }
          }
        };

        if ($me.articleID) {

            sessionStorage.noticeAction = $me.action = $routeParams.action;

            var config = {
                    id: $me.articleID,
                    includestat: 1,
                    _relatedfields: 'publish.realname'
                },
                callback = function (result) {
                    result.data = result.data || {};
                    $me.contentData = result.data;
                    $me.contentData.isauth = result.data.publishid == IGrow.User.uid;
                    $me.contentData.remove = function (id) {
                        var classid = result.data.classid;
                        var modal = $('#del'), model;
                        modal.bind('hidden.bs.modal', function () {
                            modal.unbind('hidden.bs.modal');
                            if ($me.action == 'news') {
                                model = $api.yoClassNews;
                            } else if ($me.action == 'class') {
                                model = $api.yoClassNotice;
                            } else if ($me.action == 'school') {
                                model = $api.yoSchoolnotice;
                            }
                            model.remove({ id: $me.articleID }, function () {
                                sessionStorage.actionUpdate = sessionStorage.actionUpdate || '{}';
                                var oldData = JSON.parse(sessionStorage.actionUpdate);
                                oldData[classid] = true;
                                sessionStorage.actionUpdate = JSON.stringify(oldData);
                                history.back();
                            })
                        });
                        modal.modal('hide');
                    };

                    $me.contentData.content = $scope.content = $sce.trustAsHtml($me.contentData.content);
                    $timeout(function () {
                        var imgs = [],
                            content = $('.panel-body>.article-content'),
                            getExt = function (url) {
                                var arr = url.split('.');
                                return arr[arr.length - 1].toLowerCase()
                            },
                            exts = {
                                '7z': 'rar',
                                doc: 'doc',
                                docx: 'doc',
                                html: 'html',
                                mp3: 'mp3',
                                wav:'mp3',
                                mp4: 'mp4',
                                pdf: 'pdf',
                                ppt: 'ppt',
                                pptx: 'ppt',
                                rar: 'rar',
                                txt: 'txt',
                                wps: 'wps',
                                xls: 'xls',
                                xlsx: 'xls',
                                zip: 'rar'
                            },
                            isImg = function (ext) {
                                return !!~['bmp', 'gif', 'jpg', 'jpeg', 'png'].indexOf(ext)
                            };
                        angular.forEach($me.contentData.config, function (item) {
                            item.fileType=exts[getExt(item.url)];
                            if(item.fileType=='mp3'){item.playing=false;}
                            !item.type &&  isImg(getExt(item.url)) ? (item.type = 2):(item.type=1);
                            if(item.type == 1){
                                $me.contentData.hasAttachment = true;
                                item.icon = '/assets/img/attachment/' + (exts[getExt(item.url)] || 'unknow') + '.jpg'
                            }else if(item.type == 2){
                                imgs.push('<span class="article-content-span" data-img-src="' + item.url + '"></span>')
                            }
                        });
                        content.append(imgs.join(''));

                        $timeout(function () {

                            //加载图片
                            $('.article-content-span').each(function () {

                                var img = new Image(),
                                    span = this,
                                    ready = function () { span.parentNode.replaceChild(img, span) };

                                img.className = 'article-content-img';
                                img.src = $(span).attr('data-img-src') + '!fixwidth.320';

                                // 如果图片存在缓存
                                if (img.complete) {
                                    ready.apply(img);
                                    return;
                                };

                                // 加载错误后的事件
                                img.onerror = function () {
                                    $(span).remove();
                                    img = img.onload = img.onerror = null;
                                };

                                // 加载完成后的事件
                                img.onload = function () {
                                    ready.apply(img);
                                    //IE中 gif会循环执行onload
                                    img.onload = img.onerror = null;
                                };

                            });

                        });
                    });
                };

            if ($me.action == 'news') {
                $api.yoClassNews.get(config, callback)
            } else if ($me.action == 'class') {
                $api.yoClassNotice.get(config, callback)
            } else if ($me.action == 'school') {
                $api.yoSchoolnotice.get(config, callback)
            }
            $scope.playAudio= function (data) {
                var player=document.getElementById(data.url);
                !player.src && (player.src=data.url);
                if(!data.playing){
                    player.play();
                    data.playing=true;
                }else{
                    player.pause();
                    data.playing=false;
                }
            };
            $scope.showMedia = function(data){
                data[data.fileType] = true;
                $me.str ='video'+ Math.round(Math.random()*1000);
                document.getElementById("source"+data.name).src=data.url;
                $timeout(function(){
                    videojs.options.flash.swf = "/assets/js/plugins/videoJs/5.4.5/video-js.swf";
                    var myPlayer = videojs($me.str);
                    myPlayer.ready(function(){
                        myPlayer.play();
                    });
                });
            };

        } else {

            $me.classid = $routeParams.classid;
            $me.action = sessionStorage.noticeAction || 'class';
            delete sessionStorage.noticeAction;

            if ($me.classid === 'new') {
                $me.action = $me.classid;
                $me.isChooseClass = false;
                document.title = '发布动态';
            }

            $me.classactionData = { news: null };

            var data = {
                    status: 1,
                    _pagesize: 20,
                    _fields: 'id,title,content,createtime'
                },
                successBack = function (result, key) {
                    $me.classactionData[key] = result.data ? ($me.classactionData[key] instanceof Array ? $me.classactionData[key].concat(result.data) : result.data) : [];
                    $me.classactionData[key].extra = result.extra;
                    delete $me.classactionData[key].loading;
                    tools.setListIcon($me.classactionData[key]);
                },
                errorBack = function (key) { if (!$me.classactionData[key]) $me.classactionData[key] = [] },
            //获取班级动态
                newsList = function (page) {
                    data._page = page || 1;
                    $api.yoClassNews.list(data, function (result) {
                        $me.action = 'class';
                        successBack(result, 'news')
                    }, function () { errorBack('news') });
                },
            //加载班级数据
                loadClass = function (page) {
                    $api.schoolClass.list({
                        _page: page || 1,
                        _fields: 'id,name',
                        _pagesize: 100
                    }, function (result) {
                        if (1 == result.data.length) {
                            sessionStorage.newAuth = true;
                            $location.url('/m/classaction/' + result.data[0].id);
                            return;
                        }
                        sessionStorage.newAuth = false;
                        $me.classData = (result.data || []).concat($me.classData || []);
                        $me.classData.extra = result.extra;
                    }, function () {
                        $me.classData = []
                    })
                },
            //加载教师关联的班级数据
                loadTeacherClass = function () {
                    $api.schoolClass.list({
                        _orderby: 'id asc',
                        _page: 1,
                        _pagesize: 100
                    }, function (result) {
                        $me.classData = result.data || []
                        $timeout(function () {
                            $me.initWebUploader();
                            setTimeout(function(){ $('.form-photo-list').removeClass('ng-hide'); });
                            $me.posts.click('classes', sessionStorage.publishClassId)
                        });
                    }, function () {
                        $me.classData = []
                    })
                },
                getBusiness = function(callBack){
                    $api.yoBusiness.allow({},function(result){
                        $me.isBusiness  = result.data || {};
                        $me.isBusiness = $me.isBusiness.isallow == 'true'?true:false;
                        (callBack || angular.noop)();
                    });
                };
            $me.getChooseClass = function(){
                $me.isChooseClass = false;
                var chooseClasses;
                angular.forEach($me.posts.classes, function (bool, key) {
                    if(key != 'all'){
                        chooseClasses.push(parseInt(key));
                    };
                },chooseClasses = []);
                console.log(chooseClasses);
                angular.forEach($me.classData,function(item){
                    ~chooseClasses.indexOf(item.id) && $me.posts.chooseClassName.push(item.name);
                },$me.posts.chooseClassName =[]);
                $me.posts.chooseClassName = $me.posts.chooseClassName.toString();
                console.log($me.posts.chooseClassName);
            };
            //学生权限
            if (IGrow.User.school.student) {
                $me.action = 'class';
                setTimeout(function(){
                    document.querySelector('.new-publish') && (document.querySelector('.new-publish').style.display = 'none');
                    document.querySelector('.list-group-wrap') && (document.querySelector('.list-group-wrap').style.bottom = '0px');
                    console.log(document.querySelector('.list-group-wrap'));
                });
                if ($me.noTab) {
                    schoolList()
                } else {
                    data.classid = IGrow.User.school.student.classid;
                    newsList();
                }
            }

            //教师权限
            if (IGrow.User.school.teacher) {
                if (!$me.classid || $me.classid === 'new') {

                    var deferred = $q.defer(),
                        psm = deferred.promise;
                    //获取权限
                    $api.authitem.check({ authcodes: 'yo.classhome.classnews.C' }, function (result) {


                        try {
                            $me.auth = { C: !!result.data.hasauth };
                        } catch (ex) {
                            $me.auth = { C: false };
                        }


                        //是否拥有管理权限
                        if ($me.classid === 'new') {
                            var classes=[];
                            getBusiness();
                            $me.posts = {
                                type: ($me.schoolManager && !$me.auth.C) ? 3 : ($me.auth.C ? 2 : ($me.schoolManager ? 3 : 0)),
                                title: '',
                                content: '',
                                wxSend:true,
                                classes: { all: false },
                                click: function (key, id) {

                                    if (id === undefined) {                                         
                                        this[key].all = !this[key].all;
                                        if(this[key].all){
                                            $me.classes='全部班级';
                                        }else{
                                            $me.classes='';
                                        }

                                        if (key === 'classes') {
                                            angular.forEach($me.classData, function (item) {
                                                if (this[key].all) {
                                                    this[key][item.id] = true
                                                } else {
                                                    delete this[key][item.id]
                                                }
                                            }, this)
                                        }
                                    } else {
                                        this[key].all = true;
                                        if (key === 'classes') {
                                            if (this[key][id]) {
                                                angular.forEach($me.classData,function(item){
                                                    if(id==item.id){
                                                        classes.removeByValue(item.name);
                                                        $me.classes=classes;
                                                        $me.classes=$me.classes.join(',');
                                                    }
                                                });
                                                delete this[key][id];
                                            } else {
                                                this[key][id] = true;
                                                angular.forEach($me.classData,function(item){
                                                    if(id==item.id){
                                                        classes.push(item.name);
                                                        $me.classes=classes;
                                                        $me.classes=$me.classes.join(',');
                                                    }
                                                });
                                            }
                                            angular.forEach($me.classData, function (item) {
                                                if (!this[key][item.id]) {
                                                    this[key].all = false
                                                }
                                            }, this)
                                        }
                                    }
                                }
                            };
                        }

                        deferred.resolve();

                    });

                    $me.hide = function(){
                        $('.select-student,.publish-bgcolor,.btn-wrap,.wxsend').hide();
                        $('.list-item').show(200);
                    };

                    $me.show = function(){
                        $('.list-item').hide(100);
                        $('.select-student,.publish-bgcolor,.btn-wrap,.wxsend').show(100);
                    };

                    if ($me.classid === 'new') {

                        $timeout(function () {
                            psm.then(function () { loadTeacherClass() });
                        });

                        $me.imglist = [];

                        $me.imghashlist = [];

                        $me.initWebUploader=function(){

                            //定义对象
                            $me.photo = {
                                //装载上传对象，用于页面显示
                                queued: {},
                                list: [],
                                //删除文件
                                remove: function (file) {
                                    delete this.queued[file.id];
                                    this.list.splice(this.list.indexOf(file.id), 1);
                                    $me.imglist.splice($me.imglist.indexOf(file.url), 1);
                                    $me.imghashlist.splice($me.imghashlist.indexOf(file.urlhash), 1);
                                    //若this.WebUploader对象存在，则从队列中删除相关文件
                                    this.WebUploader && this.WebUploader.removeFile(file.id);
                                },
                                //以下配置针对WebUploader插件有效
                                //定义配置
                                options: {
                                    pick: {
                                        multiple: true,
                                        //设置上传仓库
                                        configkey: 'default_pic'
                                    },
                                    fileNumLimit: 9,
                                    fileSingleSizeLimit: 10 * 1024 * 1024,
                                    thumb: {
                                        width: 58,
                                        height: 58
                                    }
                                },
                                //指令事件
                                events: {
                                    startUpload: function () {
                                        $me.photo.uploading = true;
                                    },
                                    uploadFinished: function () {
                                        $me.photo.uploading = false;
                                    },
                                    fileQueued: function (file) {

                                        $me.photo.list.push(file.id);
                                        $me.photo.queued[file.id] = {
                                            id: file.id,
                                            ready: true
                                        };

                                        this.makeThumb(file, function (error, ret) {
                                            $timeout(function () {
                                                if (error) {
                                                    $me.photo.queued[file.id].name = file.name;
                                                } else {
                                                    $me.photo.queued[file.id].src = ret;
                                                }
                                            })
                                        });

                                    },
                                    uploadStart: function (file) {
                                        delete $me.photo.queued[file.id].ready;
                                        $me.photo.queued[file.id].progress = '0%';
                                    },
                                    uploadProgress: function (file, progress) {
                                        $me.photo.queued[file.id].progress = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
                                    },
                                    uploadSuccess: function (file, result) {
                                        if (file.url) {
                                            $me.photo.queued[file.id].progress = '100%';
                                            $me.photo.queued[file.id].url = file.url;
                                            $me.photo.queued[file.id].urlhash = file.urlhash;
                                            $me.imglist.push({ name: file.name, url: file.url });
                                            $me.imghashlist.push(file.urlhash);
                                        }
                                    },
                                    uploadError: function (file) {
                                        mNotice('上传失败', 'error');
                                        $me.photo.queued[file.id].error = true;
                                    },
                                    uploadComplete: function (file) {
                                        delete $me.photo.queued[file.id].progress;
                                    }
                                }
                            };
                        };

                        //上传图片预览
                        $me.previewPicture = function (imgData) {
                            var clientHeight = $(window).height() - 103,
                                clientWidth = $(window).width() - 50,
                                cssObj = null;

                            if (imgData.ready || imgData.progress) return;

                            if (imgData.error) {

                                cssObj = {
                                    'max-width': '95px'
                                }

                                imgData.url = '/assets/img/upload/loser.png';

                                $('#previewPictureModal').css({
                                    background: '#000',
                                    opacity: '.9'
                                });

                            } else {
                                cssObj = {
                                    'max-width': clientWidth,
                                    'max-height': clientHeight
                                }
                            }

                            $('#previewPictureModal').modal('show');

                            if (!/assets/.test(imgData.url)) {

                                var img = document.createElement('img'),
                                    wrap = $('#previewPictureModal').find('.modal-body')[0];


                                $('#previewPictureModal').find('.modal-body').children(0).css('display', 'block');

                                img.addEventListener('load', function () {
                                    wrap.children[0].style.cssText = 'display:none;';
                                    wrap.children[1].style.cssText = 'display:block;';
                                    $('#previewPictureModal').find('.modal-body').children(1).css(cssObj);
                                });


                                img.style.display = 'none';

                                if (wrap.children[1]) {
                                    wrap.replaceChild(img, wrap.children[1]);
                                } else {
                                    wrap.appendChild(img);
                                }

                                img.src = imgData.url;

                            } else {

                                var img = document.createElement('img'),
                                    wrap = $('#previewPictureModal').find('.modal-body')[0];

                                $('#previewPictureModal').find('.modal-body').children(0).css('display', 'none');

                                if (wrap.children[1]) {
                                    wrap.replaceChild(img, wrap.children[1]);
                                } else {
                                    wrap.appendChild(img);
                                }

                                img.src = imgData.url;

                            }

                            $('#previewPictureModal').find('.modal-body').children(1).css(cssObj);

                            $me.previewData = imgData;

                        };

                        //删除
                        $me.removePicture = function () {
                            $me.photo.remove($me.previewData);
                        };


                        $me.send = function () {

                            if (!$me.posts.title) {
                                tips.warning('请输入标题！');
                                return;
                            }

                            if (!$me.posts.content) {
                                tips.warning('请输入内容！');
                                return;
                            }

                            if ($me.posts.type !== 3 && Object.keys($me.posts.classes).length <= 1) {
                                tips.warning('请选择班级！');
                                return;
                            }

                            var postList = [],postClasses=[];

                            //班级动态
                            angular.forEach($me.posts.classes, function (bool, key) {
                                if(key != 'all'){
                                    postList.push($api.yoClassNews.create({
                                        classid: key,
                                        title: $me.posts.title,
                                        content: $me.posts.content,
                                        status: 1,
                                        config: $me.imglist
                                    }).$promise);
                                    postClasses.push(key);
                                };
                            });

                            postList.length && $q.all(postList).then(function (result){
                                if(result.length){
                                    var item = {
                                        id:result[0].data.id,
                                        classes : postClasses.toString() || ''
                                    },callback = function(){
                                        history.back();
                                    };
                                    if($me.isBusiness){
                                        $me.posts.wxSend ? $me.wxsend(item).finally(callback) : callback();
                                    }else{
                                        callback();
                                    }
                                    //callback();
                                };
                                sessionStorage.actionUpdate = JSON.stringify($me.posts.classes);
                            });

                        };
                        $me.wxsend = function (item){
                            return $api.wx.push({
                                key: 'CLASSDYNAMIC',
                                src: 'WEIXIN',
                                msgtype: 'WX_CLS_NEWS',
                                id: item.id,
                                objects: { classstudents: item.classes }
                            }).$promise;
                        };

                    } else {

                        $me.action = 'select';
                        loadClass();

                        $timeout(function () {
                            $('#classListGroup').scroll(function () {
                                if ((this.scrollTop + this.clientHeight >= this.scrollHeight) && $me.classData && $me.classData.length) {
                                    var $data = $me.classData, extra = $data.extra;
                                    if (!$data.loading && (extra.total - extra.page * extra.pagesize > 0)) {
                                        $data.loading = true;
                                        !$scope.$$phase && $scope.$apply();
                                        loadClass(extra.page + 1);
                                    }
                                }
                            })
                        });
                    }

                } else {
                    document.body.style.background = '#ededed';
                    $me.skipPublish = function(){
                        window.location = '/#/m/classaction/new';
                    };
                    sessionStorage.publishClassId = $routeParams.classid || 0;
                    $me.showSend = true;
                    $api.authitem.check({ authcodes: 'yo.classhome.classnews.C' }, function (result) {
                        try {
                            $me.auth = { C: !!result.data.hasauth };
                        } catch (ex) {
                            $me.auth = { C: false };
                        }
                    });
                    data.classid = $me.classid;
                    newsList();
                }
            }


            //滚动加载
            $timeout(function () {
                $('.action-class-list').scroll(function () {
                    if (this.id && (this.scrollTop + this.clientHeight >= this.scrollHeight)) {
                        var $data = $me.classactionData[this.id], extra = $data.extra;
                        if (!$data.loading && extra.total - extra.page * extra.pagesize > 0) {
                            $data.loading = true;
                            !$scope.$$phase && $scope.$apply();
                            eval(this.id + 'List(' + (extra.page + 1) + ')');
                        }
                    }
                })

            });

        }

    }]);


})(angular.module('m.classaction', []));
