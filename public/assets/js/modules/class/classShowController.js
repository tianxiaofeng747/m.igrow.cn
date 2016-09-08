/*
    班级风采
    学生
    老师
 */
define(function(require, exports, module) {
    var Media = require('media');
    var app = require('mainApp');
    // var Utils = require('utils');

    app.register.controller('classShowController', ['$scope', '$q', '$routeParams','mLoading','mNotice','resource',
        function($scope, $q, $routeParams,mLoading,mNotice,resource) {
            var IGrow = window['IGrow'],
                user = IGrow['user'],
                student = IGrow['student'] || {},
                teacher = IGrow['teacher'] || {},
                semester = IGrow['semester'],
                log = IGrow.log,
                tab = $routeParams.tab,
                TeacherType = IGrow['constant']['TeacherType'],
                classid = IGrow.student?student.classid:$routeParams.classid,
                schoolid = user.schoolid,
                semesterid = semester.id,
                noAvatar = IGrow['constant']['noAvatar'],
                noCover = IGrow['constant']['noCover'],
                // 请求保留一小时
                _expire =1*60*60*1000 ;


            if($routeParams.classid){
                $scope.tab = {
                    info:'#/'+classid+'/class/show/info',
                    album:'#/'+classid+'/class/show/album',
                    work:'#/'+classid+'/class/show/work',
                    star:'#/'+classid+'/class/show/star'
                };
            }else {
                $scope.tab = {
                    info:'#/class/show/info',
                    album:'#/class/show/album',
                    work:'#/class/show/work',
                    star:'#/class/show/star'
                };
            }
            // 显示班级介绍
            $scope.showClassInfo = function(){
                var classProfileDao = resource('/yo/class/profile'),
                    classTeacherDao = resource('/school/class/classmaster'),
                    promiseClassTeacher,promiseProfile,classInfo = {};


                // 获取班级介绍
                promiseProfile = classProfileDao.get({ _expire:_expire,classid:classid,semesterid:semesterid },function(result){
                    var data = result.data || {};

                    classInfo._content = data.content || '暂无内容';

                },function(result){
                    mNotice(result.message,'error');
                });
                // 获取班级老师
                promiseClassTeacher = classTeacherDao.list({ _expire:_expire,classid:classid,semesterid:semesterid,includeclassmaster:1,_relatedfields:'user.avatar' },function(result){
                    var teacherList = result.data || [];

                    angular.forEach( teacherList, function(teacher,_) {
                        teacher._type = TeacherType[teacher.type] || '';
                        teacher.user = teacher.user || {};
                        teacher._avatar = teacher.user.avatar?teacher.user.avatar+'!72' : noAvatar;
                    });

                    classInfo._teacherList = IGrow.sortTeachers(teacherList);

                },function(result){
                    mNotice(result.message,'error');
                });

                mLoading.show();

                $q.all([promiseClassTeacher,promiseProfile]).then(function(){
                    mLoading.hide();

                    $scope.classInfo = classInfo;

                }, function(){
                    mLoading.hide();
                });
            };
            // 显示班级相册
            $scope.showClassAlbum = function(){
                var winWidth = window.innerWidth, width = Math.ceil((winWidth-60)/2),
                    classAlbumDao = resource('/yo/classalbum');

                mLoading.show();
                classAlbumDao.list({ _expire:_expire,classid:classid,_pagesize:1000 },function(result){
                    var list = result.data || [];

                    angular.forEach(list, function(item,_){
                        item._cover = item.url?item.url+'!square.150':noCover;
                        item._width = width+'px';
                        item._name = Utils.mb_cutstr(item.name,15,' ');
                    });

                    $scope.classAlbumList = list;

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });

            };

            $scope.studentWorkPage = 1;
            // 显示学生作品
            $scope.showStudentWork = function(options){
                var _page = $scope.studentWorkPage,
                    studentWorkDao = resource('/yo/fine/article');

                mLoading.show();
                studentWorkDao.list({ _expire:_expire,status:1,schoolid:schoolid,semesterid:semesterid,classid:classid,_page:_page,_pagesize:20,_relatedfields:'auther.id,auther.user' },function(result){
                    var list = result.data || [];

                    angular.forEach(list, function(item,_){
                        var attachmentMap = Utils.classifyAttachment(item.config);

                        item.author = item.author || '匿名';
                        item._time = Utils.formatNewsTime(item.publishtime*1000);
                        item.auther = item.auther || {};
                        item.auther.user = item.auther.user || {};
                        item._photos = attachmentMap.photos;
                        item._videos = attachmentMap.videos;
                        item._audios = attachmentMap.audios;
                        item._others = attachmentMap.others.concat( attachmentMap.docs );
                        item.auther._avatar = item.auther.user.avatar?item.auther.user.avatar+'!72':noAvatar;
                    });
                    if($scope.studentWorkList){
                        $scope.studentWorkList = $scope.studentWorkList.concat(list);
                    }else{
                        $scope.studentWorkList = list;
                    }


                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });
            };
            $scope.toStudentwokDetail = function($event,id){
                var target = $event.target;

                // 点击空白处跳转
                if($(target).hasClass('student-work-name') || $(target).hasClass('student-work-tips') || $(target).hasClass('student-work-content') ){
                    location.hash = '#/student/work/' + id;
                }

            };
            $scope.showMoreWork = function(){
                $scope.studentWorkPage++;
                $scope.showStudentWork();
            };

            // 显示班级明星
            $scope.showClassStar = function(){
                var classStarDao = resource('/yo/class/star');

                mLoading.show();
                classStarDao.list({ _expire:_expire,schoolid:schoolid,classid:classid,semesterid:semesterid,_pagesize:1000,_relatedfields:'student.id,student.name,publish.realname',status:1 },function(result){
                    var list = result.data || [];

                    angular.forEach(list, function(item,_){
                        var user = item.student.user || {};

                        item.student._avatar = user.avatar?user.avatar+'!72':noAvatar;
                    });
                    $scope.classStarList = list;

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });

            };

            showTab(tab);
            //console.log('tab',tab);

            function showClass(){
                var classDao = resource('/school/class');

                // 获取班级基本信息
                classDao.get({ _expire:_expire,id:classid,semesterid:semesterid,_relatedfields:'grade.name' },function(result){
                    var data = result.data || {};

                    classData = data;
                    classData._className = classData.name;
                    IGrow.classData = $scope.classData = classData;


                },function(result){
                    mNotice(result.message,'error');
                });
            }
            function showTab(tab){
                showClass();
                $('[data-tab="'+tab+'"]').addClass('active');
                switch(tab){
                    case 'info':
                        $scope.showClassInfo();
                        break;
                    case 'album':
                        $scope.showClassAlbum();
                        break;
                    case 'work':
                        $scope.showStudentWork();
                        break;
                    case 'star':
                        $scope.showClassStar();
                        break;
                }
            }
            // 显示班级介绍
            //$scope.showClassInfo();


        }
    ]);


    return app;
});
