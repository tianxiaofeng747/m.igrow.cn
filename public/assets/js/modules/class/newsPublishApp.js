/*
 *   班级互动 发布主题
 *
 */
define(function (require, exports, module) {

    var Utils = require('utils');
    var libEmotion = require('emotion');
    var app = require('mainApp');

    app.register.controller('classNewsPublishController', ['$scope', '$q', 'mLoading', 'mNotice', 'resource', '$routeParams', '$timeout', function ($scope, $q, mLoading, mNotice, resource, $routeParams, $timeout) {
        var IGrow = window['IGrow'],
            semester = IGrow.semester,
            _pagesize = 10,
            classid = $routeParams.classid,
            newsDao = resource("/notification/msg/group", {}, { send: { method: 'POST', params: {} } });

        $scope.photoLimit = 9;
        $scope.photoList = [];
        $scope.isAndroid =  ~[4,5].indexOf(IGrow.User.typeid) && navigator.userAgent.match(/(?:Android);?[\s\/]+([\d.]+)?/);
        var contentTimeout = setTimeout(function tofun() {
            if ($('textarea[name="content"]').length) {
                clearTimeout(contentTimeout);
                bindEmotion();
            } else {
                contentTimeout = setTimeout(tofun)
            }
        }, 10);

        // 绑定照片上传
        $scope.newsPhoto = {
            //定义配置
            options: {
                pick: {
                    multiple: true,
                    configkey: 'school_classalbum'
                },
                fileNumLimit: 9,
                //fileSingleSizeLimit: undefined,
                thumb: {
                    width: 60,
                    height: 60
                }
            },
            //指令事件
            events: {
                startUpload: function () {
                    $scope.newsPhoto.uploading = true;
                },
                uploadFinished: function () {
                    $scope.newsPhoto.uploading = false;
                },
                fileQueued: function (file) {
                    file.statusText = '0%';
                    this.makeThumb(file, function (error, ret) {
                        $timeout(function () {
                            if (error) {
                                file.thumbnail = '/assets/img/public/no-cover-135.jpg';
                            } else {
                                file.thumbnail = ret;
                            }
                            $scope.photoList.push(file);
                        })
                    });
                },
                uploadProgress: function (file, progress) {
                    file.statusText = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
                },
                uploadSuccess: function (file) {
                    file.status = 'success';
                    file.statusText = '成功';
                },
                uploadError: function (file) {
                    file.status = 'error';
                    file.statusText = '失败';
                    mNotice('上传失败', 'error');
                },
                error: function (type) {
                    if (type === 'ERROR_TOKEN_GET') {
                        mNotice('服务器出错了', 'error');
                        $scope.photoList = [];
                        this.reset();
                    }
                }
            }
        };

        $scope.removePhoto = function (file) {
            Utils.removeItem($scope.photoList || [], file, 'id');
            $scope.newsPhoto.WebUploader && $scope.newsPhoto.WebUploader.removeFile(file.id);
        };

        // 绑定表情
        function bindEmotion() {
            libEmotion.init({
                container: '.expreList',
                textarea: '#content'
            });
        }

        //上传图片预览
        $scope.previewPicture = function (imgData) {
            var clientHeight = $(window).height() - 103,
                clientWidth = $(window).width() - 50,
                cssObj = null;

            if (!('success' == imgData.status || 'error' == imgData.status)) return;

            if ('error' == imgData.status || imgData.error) {

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

            $scope.previewData = imgData;

        };

        //删除
        $scope.removePicture = function () {
            $scope.removePhoto($scope.previewData);
        }

        $scope.goBack = function () {
            Utils.confirm('确定取消发布吗?', function () {
                history.go(-1);
            })
        };
        $scope.send = function () {
            var data = {},
                receiver = [],
                content = $.trim($('#content').val()),
                photoList = getPhotoList();

            if (!content && !photoList.length) {
                mNotice('内容必填', 'error');
                return;
            }
            if (photoList.length > $scope.photoLimit) {
                mNotice('照片不允许超过' + $scope.photoLimit + '张', 'error');
                return;
            }
            if (content && Utils.strlen(content) > 500) {
                mNotice('字数不允许超过500字', 'error');
                return;
            }
            if ($scope.newsPhoto.uploading) {
                mNotice('正在上传,请稍后', 'error');
                return;
            }
            /*receiver = [{type: 21,id: classid},{type: 22,id: classid}];*/
            data = {
                type: "interact",
                module: "wx",
                from: IGrow.User.uid,
                groupid: classid,
                /* receiver:JSON.stringify(receiver),*/
                message: JSON.stringify({
                    /*receiver:receiver,*/
                    to: classid,
                    content: content,
                    pics: photoList
                })

            };

            /*  mNotice('发布成功!','success',1000);
             setTimeout(function(){
             history.go(-1);
             },1100);*/
            mLoading.show();
            newsDao.send(data, function () {
                mNotice('发布成功!', 'success', 1000);
                setTimeout(function () {
                    history.go(-1);
                }, 1100);


            }, function (result) {
                mNotice(result.message);

            }, function () {
                mLoading.hide();
            });

        };

        function getPhotoList() {
            var photoList = [];

            $('.publish-photo-box').each(function (_, item) {
                var $item = $(item), $img = $item.find('.publish-photo-cut img'), url = $img.attr('data-original');

                if (url) {
                    photoList.push({ url: url });
                }

            });

            return photoList;
        }

    }]);

    return app;

});