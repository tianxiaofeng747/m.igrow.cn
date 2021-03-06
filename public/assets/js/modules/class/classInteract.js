/**
 * Created by IGrow on 01/08/2016.
 */
;
(function (app) {
    app.controller('m.classindex.interact.controller', ['$api', 'emotion', '$routeParams', 'mNotice', '$timeout', '$q',
        function ($api, emotion, $routeParams, mNotice, $timeout, $q) {
            var $this = this,
                hasAuth = !!(IGrow.User && IGrow.User.school && IGrow.User.school.teacher),
                studentClassId = IGrow.User && IGrow.User.school && IGrow.User.school.student && IGrow.User.school.student.classid,
                semester = IGrow['semester'],
                uuid,
                name,
                session,
                _page = 1,
                _pagesize = 5,
                noAvatar = '/assets/img/student/no-avatar1.png',
                Utils = {
                    strlen: function (str) {
                        return (/msie/.test(navigator.userAgent.toLowerCase()) && str.indexOf('\n') !== -1) ? str.replace(/\r?\n/g, '_').length : str.length;
                    },
                    // 返回发布时间
                    formatNewsTime: function (timeStamp) {
                        var now = new Date().valueOf();
                        var result = '';
                        var delta = (now - timeStamp) / 1000;
                        if (delta < 60) {
                            result = '刚刚';
                        } else if (delta < 60 * 60) {
                            result = Math.floor(delta / (60)) + '分钟前';
                        }
                        else if (delta < 24 * 60 * 60) {
                            result = Math.floor(delta / (60 * 60)) + '小时前';
                        } else if (delta < 30 * 24 * 60 * 60) {
                            result = Math.floor(delta / (24 * 60 * 60)) + '天前';
                        }
                        else if (delta < 12 * 30 * 24 * 60 * 60) {
                            result = Math.floor(delta / (30 * 24 * 60 * 60)) + '个月前';
                        } else if (delta >= 12 * 30 * 24 * 60 * 60) {
                            result = Math.floor(delta / (12 * 30 * 24 * 60 * 60)) + '年前';
                        }
                        return result;
                    },
                    removePhotoSuffix: function (url) {
                        var index, url = url || '';

                        index = url.lastIndexOf('!');
                        if (index > -1) {
                            url = url.substring(0, index);
                        }
                        return url;
                    }
                };
            $this.classid = $routeParams.classid || $routeParams.id || studentClassId;
            $this.action = $routeParams.action;
            $this.uid = IGrow.User.uid;
            $this.isAndroid = ~[4,5].indexOf(IGrow.User.typeid) && navigator.userAgent.match(/(?:Android);?[\s\/]+([\d.]+)?/);
            $this.hasAuth =  hasAuth;
            // 初始化表情
            $timeout(function () {
                emotion.init({
                    select: '.expreSelect',
                    container: '.expreList',
                    textarea: '.publish-textarea-field'
                });
            });
            function init() {
                if ($this.action == 'news') {

                    // 绑定照片上传
                    $this.photo = {

                        //装载上传对象，用于页面显示
                        queued: {},
                        list: [],
                        //删除文件
                        remove: function (file) {
                            delete this.queued[file.id];
                            this.list.splice(this.list.indexOf(file.id), 1);
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
                                $this.photo.uploading = true;
                            },
                            uploadFinished: function () {
                                $this.photo.uploading = false;
                            },
                            fileQueued: function (file) {
                                $this.photo.list.push(file.id);
                                $this.photo.queued[file.id] = {
                                    id: file.id,
                                    ready: true
                                };
                                this.makeThumb(file, function (error, ret) {
                                    $timeout(function () {
                                        if (error) {
                                            $this.photo.queued[file.id].name = file.name;
                                        } else {
                                            $this.photo.queued[file.id].src = ret;
                                        }
                                    })
                                });
                            },
                            uploadStart: function (file) {
                                delete $this.photo.queued[file.id].ready;
                                $this.photo.queued[file.id].progress = '0%';
                            },
                            uploadProgress: function (file, progress) {
                                $this.photo.queued[file.id].progress = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
                            },
                            uploadSuccess: function (file, result) {
                                angular.extend($this.photo.queued[file.id], {
                                    progress: '100%',
                                    name: file.name,
                                    url: file.url,
                                    urlhash: file.urlhash
                                })
                            },
                            uploadError: function (file) {
                                mNotice('上传失败', 'error');
                                $this.photo.queued[file.id].error = true;
                            },
                            uploadComplete: function (file) {
                                delete $this.photo.queued[file.id].progress;
                            }
                        }

                    };
                    $this.photoLimit = 9;
                    //上传图片预览
                    $this.previewPicture = function (imgData) {
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

                        $this.previewData = imgData;

                    };

                    //删除
                    $this.removePicture = function () {
                        $this.photo.remove($this.previewData);
                    };


                    $this.goBack = function () {
                        history.go(-1);
                    };
                    $this.send = function () {
                        var data,
                            content = $.trim($this.textLen),
                            photoList;
                        angular.forEach($this.photo.queued, function (item) {
                            !item.error && this.push({
                                //type : 2 , //图片
                                name: item.name,
                                url: item.url,
                                //urlhash: item.urlhash
                            })
                        }, photoList = []);

                        if (!content && !photoList.length) {
                            mNotice('内容必填', 'error');
                            return;
                        }
                        if (photoList.length > $this.photoLimit) {
                            mNotice('照片不允许超过' + $this.photoLimit + '张', 'error');
                            return;
                        }
                        if (content && Utils.strlen(content) > 500) {
                            mNotice('字数不允许超过500字', 'error');
                            return;
                        }
                        if ($this.photo.uploading) {
                            mNotice('正在上传,请稍后', 'error');
                            return;
                        }
                        data = {
                            type: "interact",
                            module: "wx",
                            from: IGrow.User.uid,
                            groupid: $this.classid,
                            message: JSON.stringify({
                                to: $this.classid,
                                content: content,
                                pics: photoList
                            })
                        };
                        $api.interact.send(data, function () {
                            mNotice('发布成功!', 'error', 1000);
                            setTimeout(function () {
                                history.go(-1);
                            }, 1100);
                        }, function (result) {
                            mNotice(result.message);
                        });
                    };
                } else {
                    //获取班级消息列表
                    var slong = $this.isLong = [];
                    $this.comments = [];
                    function classNotificationList() {
                        $api.interact.list({
                            type: "interact",
                            module: "wx",
                            receiver: $this.classid,
                            _relatedfields: "user.*",
                            _page: _page,
                            _pagesize: _pagesize
                        }, function (result) {
                            var list = result.data || [];
                            angular.forEach(list, function (item, index) {
                                var message = JSON.parse(item.message);
                                item.content = emotion.replace_em(message.content);
                                item._time = Utils.formatNewsTime(item.createtime * 1000);
                                item.author.avatar = item.author.avatar ? item.author.avatar + "!48" : noAvatar;
                                item.photos = message.pics;
                                picsCount = message.pics.length;
                                angular.forEach(message.pics, function (img, _) {
                                    img.url = Utils.removePhotoSuffix(img.url);
                                    if (picsCount == 1) {
                                        img._thumbnail = img.url + '!small.240';
                                    } else {
                                        img._thumbnail = img.url + '!square.75';
                                    }
                                });
                                getChat(item, $this.comments);

                            });
                            $this.dataList = $this.dataList ? $this.dataList.concat(list) : list;
                            $this.flag = result.extra.total > _page * _pagesize ? true : false;
                        }, function (result) {
                            mNotice(result.message, 'error');
                        });
                    };
                    classNotificationList();
                    //获取评论
                    function getChat(item, obj) {
                        $api.interact.commentList({
                            session: item.session,
                            _relatedfields: "user.*"
                        }, function (result) {
                            obj[item.session] = result.data || [];
                            angular.forEach(obj[item.session], function (chatitem, index) {
                                var message = JSON.parse(chatitem.message);
                                chatitem.content = message.content || '';
                                chatitem.content = emotion.replace_em(chatitem.content);
                                chatitem.author.avatar = chatitem.author.avatar ? chatitem.author.avatar + "!24" : noAvatar;
                                /*chatitem.parentRealname = message.to;*/
                            })
                        }, function (result) {
                            mNotice(result.message, 'error');
                        });
                    }

                    // 显示更多评论
                    var all = $this.isShowAll = [];
                    var num = $this.num = [];
                    $this.toMoreCommentView = function (index, len) {
                        all[index] = !all[index];
                        num[index] = all[index] ? 999 : 3;
                    };
                    //删除
                    $this.toDeleteView = function (session, index) {
                        console.log(session, index);
                        if (session && '' + index) {
                            $this.deleteTopic = {
                                session: session,
                                index: index
                            };
                        } else if ($this.deleteTopic) {
                            $api.interact['delete']({
                                type: "interact",
                                module: "wx",
                                sessions: $this.deleteTopic.session
                            }, function () {
                                mNotice('删除成功!', 'error');
                                $this.dataList.splice($this.deleteTopic.index, 1);
                                $this.deleteInteract = null;
                            }, function (result) {
                                mNotice(result.message, 'error');
                            });
                        }
                    };
                    // 显示回复界面
                    $this.toReplyView = function (item) {
                        name = item.author.realname;
                        uuid = item.uuid;
                        session = item.session;
                        emotion.hide({
                            select: '.expreSelect',
                            container: '.expreList'
                        });
                        $this.replyData = {
                            to: '回复:' + name
                        };
                        $('#replyModal').modal('show');
                    };
                    // 回复
                    $this.reply = function () {
                        var content = $.trim($this.replyData.content || ''),
                            data = {
                                type: "interact",
                                module: "wx",
                                uuid: uuid,
                                groupid: $this.classid,
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
                        $api.interact.reply(data, function (result) {
                            mNotice('回复成功!', 'error', 1000);
                            var replyData = {
                                author: {
                                    avatar: IGrow.User.avatar || noAvatar,
                                    realname: IGrow.User.realname
                                },
                                uuid: result.data.uuid,
                                session: session,
                                /*parentRealname:parentRealname,*/
                                content: emotion.replace_em(content),
                                parent: {
                                    uuid: uuid
                                }
                            };
                            $this.comments[session].unshift(replyData);
                        }, function (result) {
                            mNotice(result.message);

                        });
                    };
                    // 点赞
                    var again = [];
                    $this.like = function (index, item) {
                        item.praise += (item.ispraise ? again[index] : !again[index]) ? 1 : -1;
                        $api.interact.praise({
                            uuid: item.uuid,
                            iscancel: (item.ispraise ? again[index] : !again[index]) ? 0 : 1
                        }, function (result) {
                        }, function (result) {
                            mNotice(result.message, 'error');
                        });
                        again[index] = !again[index];
                    };
                    // 是否显示全文
                    var detail = $this.isShowDetail = [];
                    $this.toggleNewsContent = function (index) {
                        var element = $(".news-content-text").eq(index);
                        detail[index] = !detail[index];
                        detail[index] ? element.addClass("ellipsis") : element.removeClass("ellipsis");
                    };
                    $this.showMore = function () {
                        _page++;
                        classNotificationList();
                    }
                }
            };
            function getClassList() {
                var defer = $q.defer();
                $api.schoolClass.list({_pagesize: 1000}, function (result) {
                    $this.classList = result.data || [];
                    defer.resolve($this.classList);
                }, function (result) {
                    defer.reject(result);
                });
                return defer.promise;
            };
            !function (classid) {
                (!classid && hasAuth) ? getClassList().then(init) : init();
            }($this.classid);

        }]);
})(angular.module('m.classindex.interact', []));