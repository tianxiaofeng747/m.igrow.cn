/*
 *   班级考试结果
 *   route:'/:classid/class/exam/result/:examid/:courseid'
 */
define(function(require, exports, module) {

    var Utils = require('utils');
    var app = require('mainApp');

    app.register.controller('classExamResultController', ['$scope', '$q', 'mLoading','mNotice','resource','$routeParams',
        function($scope, $q, mLoading,mNotice,resource,$routeParams) {
            var IGrow = window['IGrow'],
                user = IGrow.user,
                semester = IGrow.semester,
                semesterid = semester.id,
                courseid = $routeParams.courseid,
                examid = $routeParams.examid,
                classid = $routeParams.classid,
                classExamCheckDao = resource('/yo/class/exam/check'),
                scoreDao = resource('/yo/score'),
                _expire = 1*60*60*1000;

            $scope.run = function(){
                mLoading.show();
                scoreDao.list({_expire:_expire,semesterid:semesterid, examid:examid, classid:classid, courseid:courseid, _relatedfields:'student.name,student.id'},function(result){
                    var list = result.data || [];

                    list.sort(function(x,y){
                        return x.score-y.score
                    });
                    $scope.dataList = list;

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });

                classExamCheckDao.get({_expire:_expire, id:examid, _relatedfields:'exam.name'},function(result){
                    var data = result.data || {} ,examName = data.exam.name;

                    document.title = examName;

                },function(result){
                    mNotice(result.message,'error');
                });
            };

            

            $scope.run();
                

            

        }
    ]);


    return app;
});