/*
 *   日常表现
 *   包含老师的考评以及家长发布的动态
 *   content:{
 *       owner:4,// 若是家长发布
 *       teacherid:'', // 若是老师发布
 *       text:'',
 *       images:[]
 *       videos:[]
 *
 *   }
 *
 */
define(function (require, exports, module) {

    require('iscroll');
    var Utils = require('utils');
    var libEmotion = require('emotion');

    var app = require('mainApp');

    var IGrow = window['IGrow'];
    var noAvatar = IGrow.constant.noAvatar;
    var semester = IGrow.semester;
    var mLoading = Utils.mLoading;
    var mNotice = Utils.mNotice;
    var bookid = 0;

    // 学生家长发布日常表现
    app.register.controller('studentBehavePublishController', ['$scope', '$q', 'mLoading', 'mNotice', 'resource', '$timeout', function ($scope, $q, mLoading, mNotice, resource, $timeout) {
        var student = IGrow.student,
            tweetDao = resource('/book/tweet'),
            getBookId = resource('/book'),
            lastIndex = location.href.lastIndexOf('/'),
            _action = location.href.substring(lastIndex + 1),
            bookData = {};

        bookData.classid = student.classid;
        bookData.semesterid = semester.id;
        $scope.isAndroid = ~[4,5].indexOf(IGrow.User.typeid) && navigator.userAgent.match(/(?:Android);?[\s\/]+([\d.]+)?/);
        getBookId.get(bookData, function (ret) {
            bookid = ret.data.id;
        });

        var contentTimeout = setTimeout(function tofun() {
            if ($('textarea[name="content"]').length) {
                clearTimeout(contentTimeout);
                bindReplyTimer();
            } else {
                contentTimeout = setTimeout(tofun)
            }
        }, 10);

        // 若是发布照片
        if ('photo' === _action) {
            $scope.photoLimit = 9;
            $scope.photoList = [];

            bindPhotoUploader($scope, $timeout);

            $scope.send = function () {
                var data = {},
                    text = $('#content').val(),
                    photoList = getPhotoList();

                if (!photoList.length) {
                    mNotice('至少上传一张照片', 'error');
                    return;
                }
                if (photoList.length > $scope.photoLimit) {
                    mNotice('照片不允许超过' + $scope.photoLimit + '张', 'error');
                    return;
                }
                if (text && Utils.strlen(text) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }
                if ($scope.behavePhoto.uploading) {
                    mNotice('正在上传,请稍后', 'error');
                    return;
                }

                data = {
                    content: {
                        owner: 4,//表示家长
                        text: text,
                        images: photoList,
                        videos: []
                    }

                };

                publish(data);

            };

        } else if ('video' === _action) {
            $scope.videoList = [];

            bindVideoUploader($scope, $timeout);

            $scope.send = function () {
                var data = {},
                    text = $('#content').val(),
                    videoList = $scope.videoList || [];

                if (!videoList.length) {
                    mNotice('请上传视频', 'error');
                    return;
                }
                if (text && Utils.strlen(text) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }
                if ($scope.behaveVideo.uploading) {
                    mNotice('正在上传,请稍后', 'error');
                    return;
                }

                data = {
                    content: {
                        owner: 4,//表示家长
                        text: text,
                        images: [],
                        videos: videoList
                    }

                };

                publish(data);

            };

        } else if ('text' === _action) {
            $scope.send = function () {
                var data = {},
                    text = $('#content').val() || '';

                if (!text) {
                    mNotice('请填写内容', 'error');
                    return;
                }
                if (Utils.strlen(text) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }

                data = {
                    content: {
                        owner: 4,//表示家长
                        text: text
                    }

                };

                publish(data);

            };
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


        // 发布
        function publish(data) {
            data.studentid = student.id;
            data.semesterid = semester.id;
            data.bookid = bookid;
            mLoading.show('正在发布');
            tweetDao.create(data, function () {
                mLoading.success('发布成功!', function () {
                    history.go(-1);
                });

            }, function (result) {
                mLoading.hide();
                mNotice(result.message, 'error');

            }, function () {

            });
        }


    }]);

    // 老师发布日常表现
    app.register.controller('classBehavePublishController', ['$scope', '$q', 'mLoading', 'mNotice', 'resource', '$routeParams', '$timeout', function ($scope, $q, mLoading, mNotice, resource, $routeParams, $timeout) {
        var tweetDao = resource('/book/tweet'),
            classStudentDao = resource('/school/student'),
            getBookId = resource('/book'),
            teacher = IGrow.teacher,
            classid = $routeParams.classid,
            lastIndex = location.href.lastIndexOf('/'),
            _action = location.href.substring(lastIndex + 1),
            bookData = {},
            myscroll;
        $scope.showAddressBook = function () {
            $('.student-address-wrapper').addClass('address-wrapper-show');
        };
        $scope.hideAddressBook = function () {
            $('.student-address-wrapper').removeClass('address-wrapper-show');
        };
        $scope.addressSelected = function (data) {
            $scope.hideAddressBook();
            $scope.publishTarget = angular.copy(data);
        };
        $scope.removeTarget = function () {
            $scope.publishTarget = null;
        };

        bookData.classid = classid;
        bookData.semesterid = semester.id;

        getBookId.get(bookData, function (ret) {
            bookid = ret.data.id;
        });

        var contentTimeout = setTimeout(function tofun() {
            if ($('textarea[name="content"]').length) {
                clearTimeout(contentTimeout);
                bindReplyTimer();
            } else {
                contentTimeout = setTimeout(tofun)
            }
        }, 10);

        // 若是发布照片
        if ('photo' === _action) {
            $scope.photoLimit = 9;
            $scope.photoList = [];

            bindPhotoUploader($scope, $timeout);

            $scope.send = function () {
                var data = {},
                    text = $('#content').val(),
                    photoList = getPhotoList();

                if (!photoList.length) {
                    mNotice('至少上传一张照片', 'error');
                    return;
                }
                if (photoList.length > $scope.photoLimit) {
                    mNotice('照片不允许超过' + $scope.photoLimit + '张', 'error');
                    return;
                }
                if (text && Utils.strlen(text) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }
                if ($scope.behavePhoto.uploading) {
                    mNotice('正在上传,请稍后', 'error');
                    return;
                }

                data = {
                    content: {
                        teacherid: teacher.id,
                        text: text,
                        images: photoList,
                        videos: []
                    }

                };

                publish(data);

            };

        } else if ('video' === _action) {
            $scope.videoList = [];


            bindVideoUploader($scope, $timeout);

            $scope.send = function () {
                var data = {},
                    text = $('#content').val(),
                    videoList = $scope.videoList || [];

                if (!videoList.length) {
                    mNotice('请上传视频', 'error');
                    return;
                }
                if (text && Utils.strlen(text) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }
                if ($scope.behaveVideo.uploading) {
                    mNotice('正在上传,请稍后', 'error');
                    return;
                }

                data = {
                    content: {
                        teacherid: teacher.id,
                        text: text,
                        images: [],
                        videos: videoList
                    }

                };

                publish(data);

            };

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

        $scope.run = function () {
            $scope.publisthTarget = null;
            // 获取班级学生
            classStudentDao.list({
                classid: classid,
                _relatedfields: 'user.avatar',
                _page: 1,
                _pagesize: 100,
                status: 0
            }, function (result) {
                var list = result.data || [];

                angular.forEach(list, function (item, _) {
                    item.user = item.user || {};
                    item._avatar = item.user.avatar ? item.user.avatar + '!32' : noAvatar;
                });
                $scope.addressGroup = classifyBySpell(list);

                $scope.addressList = list;

                // 对通讯录绑定滚动

                setTimeout(function () {
                    myscroll = !Utils.env.isPC ? new iScroll("address") : null;
                }, 1000);



            }, function (result) {
                $scope.addressList = [];
                mNotice(result.message, 'error');
            });
        };

        $scope.run();

        // 发布
        function publish(data) {
            var student = $scope.publishTarget;

            if (!student) {
                mNotice('请选择学生', 'error');
                return;
            }
            data.classid = classid;
            data.studentid = student.id;
            data.semesterid = semester.id;
            data.bookid = bookid;
            mLoading.show('正在发布');
            tweetDao.create(data, function () {
                mLoading.success('发布成功!', function () {
                    history.go(-1);
                });

            }, function (result) {
                mNotice(result.message);
                mLoading.hide();
            }, function () {

            });
        }
    }]);

    // 回复字数检验
    function bindReplyTimer() {
        bindEmotion();
    }
    // 绑定表情
    function bindEmotion() {
        libEmotion.init({
            container: '.expreList',
            textarea: '#content'
        });
    }
    // 获取照片列表数据
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

    // 绑定视频上传
    function bindVideoUploader($scope, $timeout) {

        $scope.behaveVideo = {
            //定义配置
            options: {
                pick: {
                    multiple: true,
                    configkey: 'school_fsfile'
                },
                accept: {
                    extensions: 'MOV,MP4,3GP,MKV,RMVB,FLV,AVI,MPG',
                    mimeTypes: 'video/*'
                },
                fileNumLimit: 9,
                //fileSingleSizeLimit: undefined,
                thumb: false,
                compress: false
            },
            //指令事件
            events: {
                startUpload: function () {
                    $scope.behaveVideo.uploading = true;
                },
                uploadFinished: function () {
                    $scope.behaveVideo.uploading = false;
                },
                fileQueued: function (file) {
                    file._name = Utils.mb_cutstr(file.name, 15);
                    file._size = WebUploader.formatSize(file.size, 0);
                    file.statusText = '0%';
                },
                filesQueued: function () {
                    var stats = this.getStats();
                    stats.queueNum && mLoading.show('准备上传');
                },
                uploadProgress: function (file, progress) {
                    file.statusText = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
                    mLoading.show(file.statusText);
                },
                uploadSuccess: function (file) {
                    mLoading.hide();
                    file.status = 'success';
                    file.statusText = '成功';
                    $scope.videoList.push({ name: file.name, url: file.url });
                },
                uploadError: function (file) {
                    file.status = 'error';
                    file.statusText = '失败';
                    mNotice('上传失败', 'error');
                    mLoading.hide();
                },
                uploadComplete: function (file) {
                    file._complete = true;
                },
                error: function (type) {
                    mLoading.hide();
                    if (type === 'F_TYPE_INVALID') {
                        mNotice('视频格式错误', 'error');
                    }
                    if (type === 'ERROR_TOKEN_GET') {
                        mNotice('token获取失败', 'error');
                        this.reset();
                    }
                    return false;
                }
            }
        };

        $scope.removeVideo = function (video) {
            Utils.removeItem($scope.videoList || [], video, 'id');
        };

    }
    // 绑定照片上传
    function bindPhotoUploader($scope, $timeout) {

        $scope.behavePhoto = {
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
                    $scope.behavePhoto.uploading = true;
                },
                uploadFinished: function () {
                    $scope.behavePhoto.uploading = false;
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
                        $scope.photoList = [];
                        this.reset();
                    }
                }
            }
        };

        $scope.removePhoto = function (photo) {
            var photoList = $scope.photoList || [];
            Utils.removeItem(photoList, photo, 'id');
            $scope.behavePhoto.WebUploader && $scope.behavePhoto.WebUploader.removeFile(file.id);
        };

    }
    // 按字母分类
    function classifyBySpell(list) {
        var list = list || [], item, spell, map = {}, ret = [], firstLetter, data;

        map.others = [];
        for (var i = list.length - 1; i >= 0; i--) {
            item = list[i];
            spell = item.spell || '';
            firstLetter = spell.substring(0, 1);

            if (firstLetter) {
                firstLetter = firstLetter.toUpperCase();
                if (map[firstLetter]) {
                    map[firstLetter].push(item);
                } else {
                    map[firstLetter] = [];
                    map[firstLetter].push(item);
                }
            } else {
                map['others'].push(item);
            }
        };

        for (var key in map) {
            data = {
                name: key,
                list: map[key]
            };
            ret.push(data);
        }
        ret.sort(function (x, y) {
            return x.name > y.name ? 1 : -1;
        });

        return ret;
    }

    return app;

});