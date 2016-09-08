/*
 班级互动
 */
define(function (require, exports, module) {
    var libEmotion = require('emotion');
    var app = require('mainApp');
    var Utils = require('utils');

    app.register.controller('classNewsController', ['$scope', '$q', '$routeParams', 'mLoading', 'mNotice', 'resource', '$timeout','$rootScope', '$window', '$location',
        function ($scope, $q, $routeParams, mLoading, mNotice, resource, $timeout,$rootScope, $window, $location) {
            var IGrow = window['IGrow'],
                user = IGrow['user'],
                student = IGrow['student'] || {},
                teacher = IGrow['teacher'] || {},
                semester = IGrow['semester'],
                log = IGrow.log,
                classid = $routeParams.classid,
                replyTimer,
                uuid,
                name,
                session,
                _page = 1,
                _pagesize = 5,
                noAvatar = IGrow['constant']['noAvatar'],
                noCover = IGrow['constant']['noCover'],
                commentNotificationDao = resource("/notification/comment"),
                classNotificationDao = resource('/notification', {}, {
                    'delete': { method: 'POST', params: {} },
                    praise: {method: 'POST', params: {}}
                }),
                replayNotificationDao = resource("/notification/msg/group", {}, {
                    reply: {method: 'POST', params: {}}

                });

            // 初始化表情
            libEmotion.init({
                select: '.expreSelect',
                container: '.expreList',
                textarea: '#replyContent'
            });
            // 监听回复字数
            replyTimer = setInterval(function () {
                if ($('#replyContent')[0]) {
                    Utils.strLenCalc($('#replyContent')[0], 'pText', 140);
                } else {
                    clearInterval(replyTimer);
                    replyTimer = null;
                }

            }, 1000);
            $scope.uid = IGrow.User.uid;
            $scope.classid = classid;

            //获取班级消息列表

            var slong = $scope.isLong = [];
            $scope.comments = [];
            /*mLoading.show('正在加载');*/
            function classNotificationList() {
                classNotificationDao.list({
                    type: "interact",
                    //module: "wx",
                    receiver: classid,
                    _relatedfields: "user.*",
                    _page: _page,
                    _pagesize: _pagesize
                }, function (result) {


                    var list = result.data || [];
                    angular.forEach(list, function (item, index) {
                        var message = JSON.parse(item.message);
                        item.content = message.content;
                        item.content = libEmotion.replace_em(item.content);
                        item._time = Utils.formatNewsTime(item.createtime * 1000);
                        item.author.avatar = item.author.avatar ? item.author.avatar + "!32" : noAvatar;
                        item.photos = message.pics;
                        //$scope.$watch
                        var checkHeight = setTimeout(function () {
                            slong[index] = ($(".news-text").eq(index).height() > 130);
                        }, 0)
                        //clearTimeout(checkHeight);
                        picsCount = message.pics.length;
                        angular.forEach(message.pics, function (img, _) {
                            img.url = Utils.removePhotoSuffix(img.url);
                            if (picsCount == 1) {
                                img._thumbnail = img.url + '!small.240';
                            } else {
                                img._thumbnail = img.url + '!square.75';
                            }
                        });
                        getChat(item, $scope.comments);

                    });
                    if ($scope.dataList) {
                        $scope.dataList = $scope.dataList.concat(list);
                    } else {
                        $scope.dataList = list;
                    }
                    if (result.extra.total > _page * _pagesize) {
                        $scope.flag = true;
                    }
                    else {
                        $scope.flag = false;
                    }

                }, function (result) {
                    mNotice(result.message, 'error');
                }, function () {
                    mLoading.hide();
                });
            }

            classNotificationList();
            //获取评论
            function getChat(item, obj) {

                commentNotificationDao.list({
                    session: item.session,
                    _relatedfields: "user.*"
                }, function (result) {
                    obj[item.session] = result.data || [];
                    angular.forEach(obj[item.session], function (chatitem, index) {
                        var message = JSON.parse(chatitem.message);
                        chatitem.content = message.content || '';
                        chatitem.content = libEmotion.replace_em(chatitem.content);
                        chatitem.author.avatar = chatitem.author.avatar ? chatitem.author.avatar + "!24" : noAvatar;
                        /*chatitem.parentRealname = message.to;*/


                    })


                }, function (result) {
                    mNotice(result.message, 'error');
                }, function () {
                    mLoading.hide();
                });
            }

            // 显示更多评论
            var all = $scope.isShowAll = [];
            var num = $scope.num = [];
            $scope.toMoreCommentView = function (index, len) {
                all[index] = !all[index];
                num[index] = all[index] ? 999 : 3;
            }

            //删除
            $scope.toDeleteView = function (session, index) {

                Utils.confirm('确认删除?', function () {
                    classNotificationDao['delete']({
                        type: "interact",
                        module: "wx",
                        sessions: session
                    }, function () {
                        mNotice('删除成功!', 'success', 1000);
                        // $scope.$apply();
                        $scope.dataList.splice(index, 1);

                    }, function (result) {
                        mNotice(result.message);

                    }, function () {
                        mLoading.hide();
                    });
                });
            };


            // 显示回复界面
            $scope.toReplyView = function (item) {

                /* if (chatitem) {

                 if (chatitem.parent.uuid == item.uuid) {
                 item = chatitem;
                 parentuuid = chatitem.parent.uuid;
                 chatitem = undefined;
                 }

                 else {
                 return;
                 }
                 }*/
                $("#replyContent").val("");
                name = item.author.realname;
                uuid = item.uuid;
                session = item.session;
                /*parentRealname = name;*/
                libEmotion.hide({
                    select: '.expreSelect',
                    container: '.expreList'
                });
                $scope.replyData = {
                    to: '回复:' + name
                };


                $('#replyModal').modal({
                    /*backdrop: 'static'*/
                });
            };
            // 回复
            $scope.reply = function () {
                var content = $.trim($('#replyContent').val()),

                    data = {
                        type: "interact",
                        module: "wx",
                        uuid: uuid,
                        groupid: classid,
                        message: JSON.stringify({
                            content: content
                            /*to: parentRealname*/
                        })

                    };
                if (!content) {
                    mNotice('内容必填', 'error');
                    return;
                }
                if (content && Utils.strlen(content) > 500) {
                    mNotice('字数不允许超过500字', 'error');
                    return;
                }
                mLoading.show();
                replayNotificationDao.reply(data, function (result) {
                    mNotice('回复成功!', 'success', 1000);
                    var replyData = {
                        author: {
                            avatar: IGrow.User.avatar || noAvatar,
                            realname: IGrow.User.realname
                        },
                        uuid: result.data.uuid,
                        session: session,
                        /*parentRealname:parentRealname,*/
                        content: libEmotion.replace_em(content),
                        parent: {
                            uuid: uuid
                        }

                    };

                    $scope.comments[session].unshift(replyData);
                }, function (result) {
                    mNotice(result.message);

                }, function () {
                    mLoading.hide();
                });
            };
            // 点赞
            var again = [];

            $scope.like = function (index, item) {


                item.praise += (item.ispraise ? again[index] : !again[index]) ? 1 : -1;

                classNotificationDao.praise({
                    uuid: item.uuid,
                    iscancel: (item.ispraise ? again[index] : !again[index]) ? 0 : 1

                }, function (result) {

                }, function (result) {
                    mNotice(result.message, 'error');
                }, function () {
                    mLoading.hide();
                });
                again[index] = !again[index];

            };


            // 是否显示全文
            var detail = $scope.isShowDetail = [];
            $scope.toggleNewsContent = function (index) {
                var element = $(".news-content-text").eq(index);
                detail[index] = !detail[index];
                detail[index] ? element.addClass("ellipsis") : element.removeClass("ellipsis");

            };
            $scope.showMore = function () {
                _page++;
                classNotificationList();

            }

            //路由切换

            $rootScope.$on('$locationChangeSuccess', function(event, current, last) {
                $(".modal-backdrop").remove();
            })

        }

    ]);


    return app;
});
