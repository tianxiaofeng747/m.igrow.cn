/*
*  全局配置
*  IGrow = { api:'ajax前缀',dir:'网站根目录',modules = [] }
*/

(function () {

    // 过滤微信跳转的hash参数
    var hash = location.hash || '';
    if (hash = hash.match(/^(.*)(\#wechat_redirect|\%23wechat_redirect)/)) {
        location.hash = hash[1]
    }

    // 老师班级路由跳转
    var classRouteMap = {
        exam: {
            route: '#/{classid}/class/exam/history',
            title: '成绩表彰'
        },
        homework: {
            route: '#/{classid}/class/homework/list',
            title: '作业辅助'
        },
        behave: {
            route: '#/{classid}/class/behave/list',
            title: '日常表现'
        },
        tweet: {
            route: '#/{classid}/class/tweet/list',
            title: '宝宝动态'
        },
        schoolday: {
            //route: '#/{classid}/class/leave',
            route: '#/{classid}/class/schoolday',
            title: '请假考勤'
        },
        show: {
            route: '#/{classid}/class/show/info',
            title: '班级风采'
        },
        interact: {
            route: '#/{classid}/class/interact',
            title: '班级互动'
        }

    };

    var IGrow = window['IGrow'] = {
        host: 'http://' + location.host + '/main',
        classRouteMap: classRouteMap,
        version: '/api/1.1b',
        page: '_page',
        pagesize: '_pagesize',
        log: function () {
            console.log.apply(console, arguments);
        },
        constant: {
            // 考勤状态
            checkstatus: {
                0: '缺勤',
                1: '未打卡',
                2: '正常',//正常考勤
                3: '正常',//正常刷卡
                4: '迟到',
                5: '早退',
                6: '请假',
                7: '旷课',
                8: '其他'
            },
            sexList: [{ id: 1, name: '男' }, { id: 2, name: '女' }],
            noCover: '/assets/img/public/no-cover-135.jpg',
            noAvatar: '/assets/img/public/avatar-80.png',
            TeacherType: {
                0: '任课老师',
                1: '班主任',
                2: '副班主任',
                3: '代班主任'
            },
            attachment: {
                'doc': '/assets/img/attachment/doc.jpg',
                'wps': '/assets/img/attachment/wps.jpg',
                'html': '/assets/img/attachment/html.jpg',
                'mp3': '/assets/img/attachment/mp3.jpg',
                'mp4': '/assets/img/attachment/mp4.jpg',
                'xls': '/assets/img/attachment/xls.jpg',
                'xlsx': '/assets/img/attachment/xls.jpg',
                'ppt': '/assets/img/attachment/ppt.jpg',
                'pptx': '/assets/img/attachment/ppt.jpg',
                'txt': '/assets/img/attachment/txt.jpg',
                'zip': '/assets/img/attachment/rar.jpg',
                'rar': '/assets/img/attachment/rar.jpg',
                'pdf': '/assets/img/attachment/pdf.jpg',
                'unknow': '/assets/img/attachment/unknow.jpg'
            }
        },
        modules: [
            // 幼儿园宝宝动态
            {
                body: 'page',
                route: '/student/tweet/list',
                controller: 'studentTweetController',
                title: '宝宝动态',
                controllerUrl: 'modules/baby/tweetController.js',
                templateUrl: 'modules/behave/studentBehave.html',
                dependency: []
            },
            {
                body: 'page',
                route: ['/:classid/class/tweet/list', '/:classid/class/tweet'],
                controller: 'classTweetController',
                title: '宝宝动态',
                controllerUrl: 'modules/baby/tweetController.js',
                templateUrl: 'modules/behave/classBehave.html',
                dependency: []
            },
            /* 公共 */
            /*{
                redirectTo:'/error'
            },*/
            /*出错*/
            {
                body: '',
                route: '/error',
                title: 'error',
                template: '<div style=" text-align:center;padding:15px;">error</div>',
                dependency: []
            },
            // 班级课程
            {
                route: '/class/course',
                controller: 'classCourseController',
                title: '班级课程',
                controllerUrl: 'modules/class/classCourseController.js',
                templateUrl: 'modules/class/classCourse.html',
                dependency: []
            },
            // 密码修改
            {
                route: '/user/password',
                controller: 'userPasswordController',
                title: '密码修改',
                controllerUrl: 'modules/user/userPasswordController.js',
                templateUrl: 'modules/user/userPassword.html',
                dependency: []
            },
            // 个人相册
            {
                route: ['/user/album', '/:uid/user/album'],
                controller: 'userAlbumController',
                title: ['我的相册', '相册'],
                controllerUrl: 'modules/user/userAlbumController.js',
                templateUrl: 'modules/user/userAlbum.html',
                dependency: []
            },
            {
                body: 'page',
                route: ['/user/album/:albumid', '/:uid/user/album/:albumid'],
                controller: 'userPhotoController',
                title: ['我的照片', '照片'],
                controllerUrl: 'modules/user/userPhotoController.js',
                templateUrl: 'modules/user/userPhoto.html',
                dependency: []
            },
            // 班级风采
            {
                body: '',
                route: ['/class/show/:tab', '/:classid/class/show/:tab'],
                controller: 'classShowController',
                title: '班级风采',
                controllerUrl: 'modules/class/classShowController.js',
                templateUrl: 'modules/class/classShow.html',
                dependency: []
            },
            {
                body: '',
                route: '/class/show/album/:albumid',
                controller: 'classPhotoController',
                name: 'classShow',
                title: '班级照片',
                controllerUrl: 'modules/class/classPhotoController.js',
                templateUrl: 'modules/class/classPhoto.html',
                dependency: []
            },
            {
                body: '',
                route: '/student/work/:id',
                controller: 'studentWorkController',
                title: '学生作品',
                controllerUrl: 'modules/student/studentWorkController.js',
                templateUrl: 'modules/student/studentWork.html',
                dependency: []
            },

            // 根据用户跳转
            {
                body: '',
                route: '/homework/detail/:homeworkid',
                title: '作业详情',
                controller: function ($scope, $routeParams, $location) {
                    var IGrow = window['IGrow'], user = IGrow.user, homeworkid = $routeParams.homeworkid, host = IGrow.host;

                    if (user.typeid == 4) {
                        location.replace(host + '#/student/homework/detail/' + homeworkid);
                    } else {
                        location.replace(host + '#/class/homework/detail/' + homeworkid);
                    }

                },
                template: '',
                dependency: [],
                description: '作业详情-跳转'
            },


            /* 学生版 */
            // 我的资料
            {
                body: 'page',
                route: '/student/profile',
                controller: 'studentProfileController',
                title: '我的资料',
                controllerUrl: 'modules/student/studentProfileController.js',
                templateUrl: 'modules/student/studentProfile.html',
                dependency: ['bootstrap'],
                description: '学生个人资料'
            },
            {
                body: 'page',
                route: '/:studentid/student/profile',
                controller: 'studentProfileController1',
                title: '学生信息',
                controllerUrl: 'modules/student/studentProfileController.js',
                templateUrl: 'modules/student/studentProfile.html',
                dependency: ['bootstrap'],
                description: '他人查看学生个人资料'
            },
            {
                body: 'page',
                route: '/student/parent',
                controller: 'studentParentController',
                title: '我的亲属',
                controllerUrl: 'modules/student/studentParentController.js',
                templateUrl: 'modules/student/studentParent.html',
                dependency: [],
                description: '学生父母'
            },
            {
                body: 'page',
                route: ['/student/club:action','/student/club'],
                controller: 'studentClubController',
                title: '我的社团',
                controllerUrl: 'modules/student/studentClubController.js',
                templateUrl: 'modules/student/studentClub.html',
                dependency: [],
                description: '学生社团'
            },
            {
                route: '/class/teacher',
                controller: 'classTeacherController',
                title: '我的老师',
                controllerUrl: 'modules/class/classTeacherController.js',
                templateUrl: 'modules/class/classTeacher.html',
                dependency: [],
                description: '学生老师'
            },
            // 请假考勤
            {
                body: 'page',
                route: ['/student/attendance', '/:studentid/student/attendance'],
                controller: 'studentAttendanceController',
                title: ['我的考勤', '学生考勤'],
                controllerUrl: 'modules/student/studentAttendanceController.js',
                templateUrl: 'modules/student/studentAttendance.html',
                dependency: []
            },
            {
                body: 'page',
                route: '/student/schoolday',
                controller: 'studentSchoolDayController',
                title: '请假考勤',
                controllerUrl: 'modules/student/studentSchoolDayController.js',
                templateUrl: 'modules/student/studentSchoolday.html',
                dependency: []
            },
            {
                body: 'page',
                route: '/student/askforleave',
                controller: 'studentAskForLeaveController',
                name: 'studentAskForLeaveApp',
                title: '我要请假',
                controllerUrl: 'modules/student/studentAskForLeaveController.js',
                templateUrl: 'modules/student/studentAskForLeave.html',
                dependency: []
            },
            {
                body: 'page',
                route: '/student/leave',
                controller: 'studentLeaveController',
                title: '我的假条',
                controllerUrl: 'modules/student/studentLeaveController.js',
                templateUrl: 'modules/student/studentLeave.html',
                dependency: []
            },
            {
                body: 'page',
                route: ['/student/leave/detail/:id', '/student/absence/:id'],
                controller: 'studentLeaveDetailController',
                title: '我的假条',
                controllerUrl: 'modules/student/studentLeaveController.js',
                templateUrl: 'modules/student/studentLeaveDetail.html',
                dependency: []
            },
            // 作业辅助
            {
                body: 'page',
                route: '/student/homework',
                controller: 'studentHomeworkController',
                title: '我的作业',
                controllerUrl: 'modules/homework/studentHomeworkController.js',
                templateUrl: 'modules/homework/studentHomework.html',
                dependency: []
            },
            {
                route: ['/student/homework/:homeworkid', '/student/homework/detail/:homeworkid'],
                controller: 'studentHomeworkDetailController',
                title: '我的作业',
                controllerUrl: 'modules/homework/homeworkDetailController.js',
                templateUrl: 'modules/homework/studentHomeworkDetail.html',
                dependency: []
            },
            {
                body: '',
                route: '/student/homework/submit/:homeworkid',
                controller: 'studentHomeworkSubmitController',
                title: '提交作业',
                controllerUrl: 'modules/homework/studentHomeworkSubmitController.js',
                templateUrl: 'modules/homework/studentHomeworkSubmit.html',
                dependency: []
            },
            // 日常表现
            {
                body: 'page',
                route: '/student/behave/list',
                controller: 'studentBehaveController',
                title: '日常表现',
                controllerUrl: 'modules/behave/behaveController.js',
                templateUrl: 'modules/behave/studentBehave.html',
                dependency: []
            },
            {
                body: 'page',
                wrapper: ['page-publish-text', 'page-publish-photo', 'page-publish-video'],
                route: ['/student/behave/publish/text', '/student/behave/publish/photo', '/student/behave/publish/video'],
                controller: 'studentBehavePublishController',
                title: ['发布文字', '发布照片', '发布视频'],
                controllerUrl: 'modules/behave/behavePublishController.js',
                templateUrl: 'modules/behave/studentBehavePublish.html',
                dependency: []
            },
            // 成绩表彰
            {
                body: '',
                route: ['/student/score', '/:studentid/student/exam/history/:courseid'],
                controller: ['scoreController', 'scoreController2'],
                title: ['成绩表彰', '学生成绩'],
                controllerUrl: 'modules/student/studentExamHistoryController.js',
                templateUrl: 'modules/student/studentExamHistory.html',
                dependency: []
            },

            /* 老师版 */
            // 班级路由
            {
                body: 'page',
                route: ['/teacher/class/route/:action', '/teacher/class/route'],
                controller: 'teacherClassRouteController',
                title: '老师任课班级',
                controllerUrl: 'modules/teacher/teacherClassRouteController.js',
                templateUrl: 'modules/teacher/teacherClassRoute.html',
                dependency: ['bootstrap']
            },
            // 请假考勤
            {
                body: 'page',
                route: '/:classid/class/schoolday',
                controller: 'classSchooldayController',
                title: '请假考勤',
                controllerUrl: 'modules/class/classSchooldayController.js',
                templateUrl: 'modules/class/classSchoolday.html',
                dependency: [],
                description: '班级请假考勤主页'
            },
            {
                body: 'page',
                route: '/:classid/class/leave',
                controller: 'classLeaveController',
                title: '学生请假',
                controllerUrl: 'modules/class/classLeaveController.js',
                templateUrl: 'modules/class/classLeave.html',
                dependency: []
            },
            {
                body: 'page',
                route: '/:classid/class/leave/detail/:id',
                controller: 'classLeaveDetailController',
                title: '学生请假详情',
                controllerUrl: 'modules/class/classLeaveController.js',
                templateUrl: 'modules/class/classLeaveDetail.html',
                dependency: []
            },
            // 我的资料
            {
                body: 'page',
                route: '/teacher/profile',
                controller: 'teacherProfileController',
                title: '我的资料',
                controllerUrl: 'modules/teacher/teacherProfileController.js',
                templateUrl: 'modules/teacher/teacherProfile.html',
                dependency: ['bootstrap']
            },
            // 成绩表彰
            {
                body: 'page',
                route: '/:classid/class/exam/history',
                controller: 'classExamHistoryController',
                title: '成绩表彰',
                controllerUrl: 'modules/class/classExamHistoryController.js',
                templateUrl: 'modules/class/classExamHistory.html',
                dependency: ['bootstrap']
            },
            {
                body: '',
                route: '/:classid/class/exam/result/:examid/:courseid',
                controller: 'classExamResultController',
                title: '班级考试结果',
                controllerUrl: 'modules/class/classExamResultController.js',
                templateUrl: 'modules/class/classExamResult.html',
                dependency: ['bootstrap']
            },
            // 作业辅助
            {
                body: 'page',
                route: '/:classid/class/homework/list',
                controller: 'classHomeworkController',
                title: '作业辅助',
                controllerUrl: 'modules/homework/classHomeworkController.js',
                templateUrl: 'modules/homework/classHomework.html',
                dependency: []
            },
            {
                route: '/class/homework/detail/:homeworkid',
                controller: 'classHomeworkDetailController',
                name: 'homeworkDetailApp',
                title: '作业辅助',
                controllerUrl: 'modules/homework/homeworkDetailController.js',
                templateUrl: 'modules/homework/classHomeworkDetail.html',
                dependency: []
            },
            {
                body: '',
                route: ['/:classid/homework/publish', '/homework/publish'],
                controller: 'homeworkPublishController',
                title: '发布作业',
                controllerUrl: 'modules/homework/homeworkPublishController.js',
                templateUrl: 'modules/homework/homeworkPublish.html',
                description: '发布作业',
                dependency: []
            },
            // 日常表现
            {
                body: 'page',
                route: '/:classid/class/behave/list',
                controller: 'classBehaveController',
                title: '日常表现',
                controllerUrl: 'modules/behave/behaveController.js',
                templateUrl: 'modules/behave/classBehave.html',
                dependency: []
            },
            {
                body: 'page',
                wrapper: ['page-publish-photo', 'page-publish-video'],
                route: ['/:classid/class/behave/publish/photo', '/:classid/class/behave/publish/video'],
                controller: 'classBehavePublishController',
                title: ['发布照片', '发布视频'],
                controllerUrl: 'modules/behave/behavePublishController.js',
                templateUrl: 'modules/behave/classBehavePublish.html',
                dependency: []
            },

            // 班级互动
            {
                body: 'page',
                route: ['/:classid/class/interact'],
                controller: 'classNewsController',
                name: 'classNewsController',
                title: '班级互动',
                controllerUrl: 'modules/class/newsApp.js',
                templateUrl: 'modules/class/classNews.html',
                dependency: []
            },
            {
                body: '',
                wrapper: 'page-class-news',
                route: ['/class/news/publish', '/:classid/news/publish'],
                controller: 'classNewsPublishController',
                title: '发布话题',
                controllerUrl: 'modules/class/newsPublishApp.js',
                templateUrl: 'modules/news/newsPublish.html',
                dependency: []
            },
            //
            {
                route: '/test',
                controller: 'testController',
                title: '测试',
                controllerUrl: 'modules/test/testApp.js',
                templateUrl: 'modules/test/test.html',
                dependency: []
            }

        ]
    };

    IGrow.dir = getRootPath().replace('/assets', '');// 网站根目录
    // 替换多余的前缀
    IGrow.dir = getRootPath().replace('/main', '');

    IGrow.getCurrentSemester = getCurrentSemester;
    IGrow.sortTeachers = sortTeachers;
    IGrow.getSexName = getSexName;
    IGrow.parseClassRoute = parseClassRoute;
    IGrow.formatAttachment = formatAttachment;
    IGrow.isClassMaster = isClassMaster;
    IGrow.isClassTeacher = isClassTeacher;

    // 是否是班级老师
    function isClassTeacher(teacherList, teacher) {
        var target = null, item;

        for (var i = teacherList.length - 1; i >= 0; i--) {
            item = teacherList[i];
            if (item.id == teacher.id) {
                return true;
            }
        };
        return false;
    }

    // 是否是班主任 正副临时班主任都可以 type 1,2,3 teacherList 为某个班级的老师 teacher为当前老师
    function isClassMaster(teacherList, teacher) {
        var target = null, item;

        for (var i = teacherList.length - 1; i >= 0; i--) {
            item = teacherList[i];
            if (item.id == teacher.id) {
                target = item;
                break;
            }
        };
        // type 1 2 3
        if (target && target.type >= 1) {
            return true;
        } else {
            return false;
        }
    }
    // 文件类型 type 1, 图片类型 type 2,视频文件 type 4,音频文件 type 6
    function formatAttachment(attachment) {
        var name = attachment.name || '',
            url = attachment.url,
            attachmentMap = IGrow.constant.attachment,
            ext,
            Utils = window.Utils,
            imageTypes = Utils.photoTypes,
            videoTypes = Utils.videoTypes,
            audioTypes = Utils.audioTypes;

        ext = Utils.getFileExt(name);
        attachment._name = Utils.mb_cutstr(attachment.name, 25);
        attachment._link = attachment.url;
        if (imageTypes.indexOf(ext) > -1) {
            attachment._link = 'javascript:void(0);';
            attachment.type = 2;
            attachment._thumb = url + '!square.75';
        } else if (videoTypes.indexOf(ext) > -1) {
            attachment.type = 4
            attachment._thumb = attachmentMap['mp4'];
        } else if (audioTypes.indexOf(ext) > -1) {
            attachment.type = 6
            attachment._thumb = attachmentMap['mp3'];
        } else {
            attachment.type = 1;
            attachment._thumb = attachmentMap[ext] ? attachmentMap[ext] : attachmentMap['unknow'];
        }

        return attachment;
    }


    // 老师班级路由
    function parseClassRoute(action) {
        var IGrow = window['IGrow'],
            teacher = IGrow.teacher,
            classes = teacher.classes || [],
            myclass = classes[0] || {},
            classid = myclass.id,
            route = 'javascript:void(0)';
        //console.log(classes);
        if (classes.length === 1) {
            //if ('schoolday' === action) return '#' + classid + '/class/leave';
            return classRouteMap[action]['route'].replace('{classid}', classid);
        } else {
            return '#/teacher/class/route/' + action;
        }
    }

    // 获取站点根目录
    function getRootPath() {
        var strFullPath = window.document.location.href;
        var strPath = window.document.location.pathname;
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
        var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
        return (prePath + postPath);
    }
    // 返回当前正在使用的学期 正在使用的或者放假中的
    function getCurrentSemester(semesterList) {
        var semesterList = semesterList || [], semester, archived, archivetime,
            isEditable = false, now = new Date().valueOf(),
            // 归档30天后仍可编辑
            d = 30 * 24 * 60 * 60 * 1000;

        for (var i = 0; i < semesterList.length; i++) {
            semester = semesterList[i];
            archived = semester.archived;
            archivetime = semester.archivetime ? semester.archivetime * 1000 : 0;
            if (archivetime) {
                isEditable = (now - archivetime - d) > 0 ? false : true;
            }
            if (0 != semester.status && (1 == semester.status || 2 == semester.status || 0 == semester.archived || isEditable)) {

                return semester;
            }
        }

        semester = semesterList.length ? semesterList[0] : null;

        return semester;
    }

    //对老师排序 正 副 临时 班主任
    function sortTeachers(list) {
        var list = list || [], ret = [], a, b, c, others = [], masters = [];

        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i].type == 0) {
                others.push(list[i]);
            } else {
                masters.push(list[i]);
            }
        };
        masters.sort(function (a, b) {
            return a.type - b.type;
        });

        ret = masters.concat(others);
        return ret;

    }
    // 获取性别
    function getSexName(sex) {
        return (0 == sex) ? '未知' : (1 == sex) ? '男' : '女';
    }

})();

/*
*
*  seajs 配置
*
*/
(function (seajs) {
    if (!seajs) {
        console.log('seajs missing');
        return;
    }
    var dir = window['IGrow']['dir'],
        modules = window['IGrow']['modules'] || [],
        js = dir + '/assets/js/',
        css = dir + '/assets/css/',
        alias, module;

    // 设置别名
    alias = {
        //项目样式
        'common.css': css + 'public/common.css',
        'main.css': css + 'main/main.css',
        // 库
        //'webuploader.js': 'http://assets.haoyuyuan.com/vendor/plugins/igrow/webuploader/0.1.6/webuploader.igrow.min.js?v=20150512',
        //'webuploader.css': 'http://assets.haoyuyuan.com/vendor/plugins/igrow/webuploader/0.1.6/webuploader.min.css',
        'datetimepicker.css': 'http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.0/css/datetimepicker.css',
        'datetimepicker.js': 'http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.0/js/bootstrap-datetimepicker.min.js',
        'bootstrap.css': 'http://assets.haoyuyuan.com/vendor/libs/bootstrap/3.0.0/css/bootstrap.min.css',
        'bootstrap': 'http://assets.haoyuyuan.com/vendor/libs/bootstrap/3.0.0/js/bootstrap.min.js',
        'jquery': 'http://assets.haoyuyuan.com/vendor/libs/jquery/jquery-2.0.0.min.js',
        'angular': 'http://assets.haoyuyuan.com/vendor/libs/angularjs/1.2.14/angular.min.js',
        'angular-sanitize': 'http://assets.haoyuyuan.com/vendor/libs/angularjs/1.2.14/angular-sanitize.min.js',
        'angular-route': 'http://assets.haoyuyuan.com/vendor/libs/angularjs/1.2.14/angular-route.min.js',
        'angular-touch': 'http://assets.haoyuyuan.com/vendor/libs/angularjs/1.2.14/angular-touch.min.js',

        // 插件
        'iscroll': js + 'plugins/iscroll/iscroll-4.2.5.js',
        'mediaelement.js': js + 'plugins/mediaelement/2.13.1/mediaelement-and-player.min.js',
        'mediaelement.css': js + 'plugins/mediaelement/2.13.1/mediaelementplayer.min.css',
        // 公共
        'WeixinApi': js + 'public/WeixinApi.js',
        'datetimepickerDirective': js + 'public/datetimepickerDirective.js',
        'angular-core': js + 'core/angular-core.js',
        'angular-lazyload': js + 'core/angular-lazyload.js',
        'media': js + 'public/media.js',
        'utils': js + 'public/utils.min.js',
        'scroll': js + 'public/scroll.js',
        'emotion': js + 'public/emotion.js',
        'photoLayout': js + 'public/photoLayout.js',
        'imageview': js + 'public/imageview.js',
        'touch': js + 'public/touch.js',
        'redirectApp': js + 'core/redirectApp.js',
        'mainApp': js + 'core/mainApp.js'
    };

    // 将业务的js载入
    /*for( var i = 0; i < modules.length; i++ ) {
        module = modules[i];
        alias[module.name] = js + module.path;
    };*/

    // console.log('alias',alias)
    seajs.config({
        alias: alias,
        charset: 'utf-8',
        map: [
            //[ /^(.*\.(?:css|js))(.*)$/i, '$1?'+new Date().valueOf() ]
            // modules下的业务js不缓存
            [/(modules\/\w+\/\w+)(\.js)/i, '$1$2?' + new Date().valueOf()],
            [/(mainApp\.min\.js)/i, '$1?' + new Date().valueOf()]
        ]
    });

    seajs.on('error', function (module) {
        if (module && module.status != 5) {
            console.error('seajs error: ', module);
        }
    });

})(window.seajs);
