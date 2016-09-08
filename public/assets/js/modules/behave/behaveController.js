/*
 *   日常表现
 *   包含老师的考评以及家长发布的动态
 *   
 */
define(function(require, exports, module) {
    var Media = require('media');
    var libEmotion = require('emotion');
    var Utils = require('utils');
    var app = require('mainApp');
    var IGrow = window['IGrow'];
    var User = user = IGrow.user;
    var semester = IGrow.semester;
    var _pagesize = 10;
    var noAvatar = IGrow['constant']['noAvatar'];

    var parseTweet = function(data,studentList,teacherList){
        var content = data.content || (data.content = {}),
            teacherid = content.teacherid || '',
            studentList = studentList || [],
            teacherList = teacherList || [],
            studentid = data.studentid, imageCount,student,teacher,avatar;

        
        content.images = content.images || [];
        content.videos = content.videos || [];
        content.text = content.text || '';
        content.text = libEmotion.replace_em(content.text);
        // 假如用户是学生
        if(IGrow.student){
            avatar = User.avatar?User.avatar+'!48':noAvatar;
            content._student = {
                name:User.realname,
                avatar:avatar
            };
            // 来自家长
            if( content.owner && content.owner == 4 ) {
                content._isOwner = true;
                content._author = {
                    name:User.realname+'家长'
                };
            }
            // 来自老师
            else {
                teacher = Utils.getItem(teacherList,{id:teacherid}) || { name:'老师',avatar:noAvatar };
                //teacher.user = teacher.user || {};
                //avatar = teacher.user.avatar?teacher.user.avatar+'!48':noAvatar;
                content._author = {
                    name:teacher.name
                };
            }
            
        }else if(IGrow.teacher){
            content._isTeacher = true;
            // 家长
            if( content.owner && content.owner == 4 ) {
                student = Utils.getItem(studentList,{id:studentid}) || {};
                student.user = student.user || {};
                avatar = student.user.avatar?student.user.avatar+'!48':noAvatar;
                content._author = {
                    name:student.name+'家长',
                    avatar:avatar
                };
                content._student = {
                    name:student.name,
                    avatar:avatar
                };
            }
            // 老师
            else {
                teacher = Utils.getItem(teacherList,{id:teacherid}) || { name:'班主任',avatar:noAvatar };
                
                content._author = {
                    name:teacher.name
                };
                if(studentid == 0) {
                    student = {name:'全班',avatar:noAvatar};
                    avatar = noAvatar;
                }else {
                    student = Utils.getItem(studentList,{id:studentid});
                    student.user = student.user || {};
                    avatar = student.user.avatar?student.user.avatar+'!48':noAvatar;
                }
                
                content._student = {
                    name:student.name,
                    avatar:avatar
                };
                if(IGrow.teacher.id == teacherid){
                    content._isOwner = true;
                }
            }
        }
            
        imageCount = content.images.length;
        angular.forEach(content.images, function(img,_){
            img.url = Utils.removePhotoSuffix(img.url);
            if(imageCount == 1){
                img._thumbnail = img.url + '!small.240';
            }else {
                img._thumbnail = img.url + '!square.75';
            }

        });

        return content;
            
        
    };

    // 学生日常表现列表
    app.register.controller('studentBehaveController', ['$scope', '$q', 'mLoading','mNotice','resource',
        function($scope, $q, mLoading,mNotice,resource) {
            var student = IGrow.student,
                classid = student.classid,
                teacherList = [],
                studentList = [],
                classTeacherDao = resource('/school/class/teacher'),
                reviewDao = resource('/yo/check/group/result'),
                newsDao = resource('/book/tweet');
            

            $scope.page = 1;
            
            // 获取学生动态以及老师表彰
            $scope.list = function(options){
                var opts = options || {},
                    page = opts.page || 1,
                    promiseReview,
                    promiseNews,
                    reviewList = [],
                    newsList = [],
                    reviewQueryData = {
                        schoolid:student.schoolid,
                        semesterid:semester.id,
                        studentid:student.id,
                        classid:student.classid,
                        _page:page,
                        _pagesize:_pagesize,
                        _relatedfields:'type.name,groupsurface.*,operator.realname,operator.avatar,operator.uid'
                    };

                mLoading.show();
                // 日常表现
                promiseReview = reviewDao.list( reviewQueryData ,function(result){
                    var list = reviewList = result.data || [];
                    
    
                    //IGrow.log('日常表现',list);

                    angular.forEach( list, function( item,_ ) {
                        var operator = item.operator || ( item.operator = {} ),avatar;

                        item._isTweet = false;
                        operator.realname = operator.realname || '匿名';
                        operator.avatar = operator.avatar?operator.avatar+'!48':noAvatar;
                        
    
                        avatar = IGrow.user.avatar?IGrow.user.avatar+'!48':noAvatar;
                        item._student = {
                            name:user.realname,
                            avatar:avatar
                        };
                        item._time = Utils.formatNewsTime(item.checktime*1000);
                    });
                    if($scope.reviewList){
                        $scope.reviewList = $scope.reviewList.concat(list);
                    }else{
                        $scope.reviewList = list;
                    }
                    
                    

                },function(result){
                    mNotice(result.message,'error');
                });
                // 学生动态
                promiseNews = newsDao.list( { studentid:student.id,semesterid:semester.id, _pagesize:_pagesize,_page:page } ,function(result){
                    var list = newsList = result.data || [];
                    
                    
                    //IGrow.log('学生动态',list);

                    angular.forEach( list, function( item,_ ) {
                        
                        item._isTweet = true;
                        item._time = Utils.formatNewsTime(item.createtime*1000);
                        item.content = parseTweet(item,studentList,teacherList);

                    });

                    if($scope.newsList){
                        $scope.newsList = $scope.newsList.concat(list);
                    }else{
                        $scope.newsList = list;
                    }

                },function(result){
                    
                });

                $q.all([ promiseReview, promiseNews ]).then(function(){
                    var ret = newsList.concat(reviewList);

                    ret.sort(function(x,y){
                        return x.createtime-y.createtime>0?-1:1
                    });

                    $scope.dataList = $scope.dataList?$scope.dataList.concat(ret):ret;
                    // 是否显示更多
                    if( newsList.length>0 || reviewList.length>0 ) {
                        $scope.flag = true;
                    }else {
                        $scope.flag = false;
                    }
            
                    mLoading.hide();

                }, function(){
                    mLoading.hide();
                });
            };
            // 删除学生动态
            $scope._delete = function(news){
                var list = $scope.dataList || [];

                mLoading.show();
                newsDao._delete({ id:news.id,semesterid:semester.id },function(){
                    Utils.removeItem(list,news,'id');

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });
            };
            $scope.toDeleteView = function(news) {
                Utils.confirm('确定删除吗?', function(){
                    $scope._delete(news);
                });
            };
            $scope.showMore = function(){
                var page = (++$scope.page);

                $scope.list( { page:page } );
            };
            

            $scope.run = function(){

                // 获取班级老师
                var promiseTeacher = classTeacherDao.list({
                    includeclassmaster:1,
                    classid:classid,
                    _relatedfields:'user.avatar',
                    _page:1,
                    _pagesize:100 
                },function(result){
                    var list = teacherList = result.data || [];
                },function(result){
                    teacherList = [];
                    mNotice(result.message,'error');
                });
                mLoading.show();
                $q.all([ promiseTeacher ]).then(function(){
                    
                    $scope.list();
                },function(){

                });
                
            };

            $scope.run();
            
           
        }
    ]);

    // 班级日常表现列表
    app.register.controller('classBehaveController', ['$scope', '$q', 'mLoading','mNotice','resource','$routeParams',
        function($scope, $q, mLoading,mNotice,resource,$routeParams) {
            var teacher = IGrow.teacher,
                schoolid = teacher.schoolid,
                classid = $routeParams.classid,
                studentList = [],
                teacherList = [],
                reviewDao = resource('/yo/check/group/result'),
                classStudentDao = resource('/school/student'),
                classTeacherDao = resource('/school/class/teacher'),
                newsDao = resource('/book/tweet');
            
            
            $scope.page = 1;
            $scope.classid = classid;
          
            // 获取学生动态以及老师表彰
            $scope.list = function(options){
                var opts = options || {},
                    page = opts.page || 1,
                    reviewList = [],
                    newsList = [],
                    reviewQueryData = {
                        schoolid:teacher.schoolid,
                        semesterid:semester.id,
                        classid:classid,
                        _page:page,
                        _pagesize:_pagesize,
                        _relatedfields:'type.name,groupsurface.*,operator.realname,operator.avatar,operator.uid'
                    };

                mLoading.show();
                
                // 日常表现
                var promiseReview = reviewDao.list( reviewQueryData ,function(result){
                    var list = reviewList = result.data || [];
                    
                    angular.forEach( list, function( item,_ ) {
                        var operator = item.operator || ( item.operator = {} ), student,avatar;

                        item._isTweet = false;
                        item._isOwner = operator.uid == user.uid?true:false;
                        operator.realname = operator.realname || '匿名';
                        operator.avatar = operator.avatar?operator.avatar+'!72':noAvatar;
                        student = Utils.getItem(studentList,{id:item.studentid}) || {};
                        student.user = student.user || {};
                        avatar = student.user.avatar?student.user.avatar+'!48':noAvatar;
                        item._student = {
                            name:student.name,
                            avatar:avatar
                        };
                        item._time = Utils.formatNewsTime(item.checktime*1000);
                    });
                    if($scope.reviewList){
                        $scope.reviewList = $scope.reviewList.concat(list);
                    }else{
                        $scope.reviewList = list;
                    }
                    
                    //IGrow.log('日常表现',list);

                },function(result){
                    mNotice(result.message,'error');
                });
                // 学生动态
                var promiseNews = newsDao.list( { schoolid:schoolid,classid:classid,semesterid:semester.id, _pagesize:_pagesize,_page:page } ,function(result){
                    var list = newsList = result.data || [];
                    
                    
                    //IGrow.log('学生动态',list);
                    angular.forEach( newsList, function( item,_ ) {
                        
                        item._isTweet = true;
                        item._time = Utils.formatNewsTime(item.createtime*1000);
                        item.content = parseTweet(item,studentList,teacherList);

                    });
                    if($scope.newsList){
                        $scope.newsList = $scope.newsList.concat(newsList);
                    }else{
                        $scope.newsList = newsList;
                    }

                    

                },function(result){
                    
                });

                $q.all([ promiseReview, promiseNews ]).then(function(){
                    var ret = newsList.concat(reviewList);

                    ret.sort(function(x,y){
                        return x.createtime-y.createtime>0?-1:1
                    });
                   
                    $scope.dataList = $scope.dataList?$scope.dataList.concat(ret):ret;
                    // 是否显示更多
                    if( newsList.length>0 || reviewList.length>0 ) {
                        $scope.flag = true;
                    }else {
                        $scope.flag = false;
                    }
            
                    mLoading.hide();

                }, function(){
                    mLoading.hide();
                });
            };

            $scope.run = function(){
                $(".behave-navbar").css({"display":"none"});
                // 获取班级老师
                var promiseTeacher = classTeacherDao.list({
                    includeclassmaster:1,
                    classid:classid,
                    _relatedfields:'user.avatar',
                    _page:1,
                    _pagesize:100 
                },function(result){
                    var list = teacherList = result.data || [];

                    //console.log('teacherList',list)
                },function(result){
                    teacherList = [];
                    mNotice(result.message,'error');
                });


                // 获取班级学生
                var promiseStudent = classStudentDao.list({
                    classid:classid,
                    _relatedfields:'user.avatar',
                    _page:1,
                    _pagesize:100,
                    status:0
                },function(result){
                    var list = studentList = result.data || [];

                    //console.log('studentList',list)

                },function(result){
                    studentList = [];
                    mNotice(result.message,'error');
                });
                mLoading.show();
                $q.all([ promiseTeacher,promiseStudent ]).then(function(){
                    $scope.isClassTeacher = IGrow.isClassTeacher(teacherList,teacher);
                    $scope.list();
                },function(){

                });
                
            };
            // 删除学生动态
            $scope._delete = function(news){
                var list = $scope.dataList || [];

                mLoading.show('正在删除');
                newsDao._delete({ id:news.id,semesterid:semester.id },function(){
                    Utils.removeItem(list,news,'id');

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });
            };
            $scope.toDeleteView = function(news) {
                Utils.confirm('确定删除吗?', function(){
                    $scope._delete(news);
                });
            };
            // 删除表彰
            $scope.toDeleteReview = function(data){
                var list = $scope.dataList || [];
                
                Utils.confirm('确定删除吗?', function(){
                    mLoading.show('正在删除');
                    reviewDao._delete({id:data.id},function(){
                        Utils.removeItem(list,data,'id');
                    },function(){
                        mNotice(result.message,'error');
                    },function(){
                        mLoading.hide();
                    });
                });
            };
            $scope.showMore = function(){
                var page = (++$scope.page);

                $scope.list( { page:page } );
            };
            $scope.run();
           
        }
    ]);


    return app;
});