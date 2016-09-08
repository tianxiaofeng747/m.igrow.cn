/*
 *   学生老师
 *   
 */
define(function(require, exports, module) {
    var app = require('mainApp');
    var Utils = require('utils');

    app.register.controller('classTeacherController', ['$scope', 'mLoading','mNotice','resource',
        function($scope,mLoading,mNotice,resource) {
            var studentDao = resource('/school/student'),
                classTeacherDao = resource('/school/class/teacher'),
                IGrow = window['IGrow'],
                teacherTypeMap = IGrow.constant.TeacherType,
                noAvatar = IGrow['constant']['noAvatar'];

           
            function run(){
                mLoading.show('正在加载...');
                // 获取用户信息
                studentDao.get().then(function(result){
                    var student = result.data || {} ,classid = student.classid;

                    classTeacherDao.list({includeclassmaster:1,classid:classid,_relatedfields:'user.avatar'}).then(function(result){
                        var list = result.data || [];

                        list = IGrow.sortTeachers(list);

                        list = Utils.getNoRepeat(list,'id');
                        //
                        angular.forEach(list, function(teacher,i){
                            if(teacher.user!=null) {
                                teacher.avatar = teacher.user.avatar ? teacher.user.avatar + '!64' : noAvatar;
                            }
                            teacher._type = teacherTypeMap[teacher.type];
                        });
                     
                        $scope.teacherList = list;
 
                        mLoading.hide();

                    }, function(result){
                        mNotice(result.message,'error');
                        mLoading.hide();
                    })

                }, function(result){
                    mNotice(result.message,'error');
                    mLoading.hide();
                });
            }

            run();


        }
    ]);


    return app;
});