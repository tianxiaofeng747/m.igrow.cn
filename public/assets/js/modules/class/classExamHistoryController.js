/*
 *   班级历史成绩
    /yo/class/course/ 班级科目的配置
    "config"       :  {
        "优秀" : {
           "start" : 90,
           "end"   : 100
        },
        "良好" : {
           "start" : 80,
           "end"   : 90
        },
        "及格" : {
           "start" : 60,
           "end"   : 80
        },
        "不及格" : {
           "start" : 0,
           "end"   : 60
        },
    }
 */
define(function(require, exports, module) {

    var Utils = require('utils');
    var app = require('mainApp');

    app.register.controller('classExamHistoryController', ['$scope', '$q', 'mLoading','mNotice','resource','$routeParams',
        function($scope, $q, mLoading,mNotice,resource,$routeParams) {
            var IGrow = window['IGrow'],
                user = IGrow.user,
                semester = IGrow.semester,
                semesterid = semester.id,
                schoolid = user.schoolid,
                classCourseDao = resource('/yo/class/course'),
                classExamCheckDao = resource('/yo/class/exam/check'),
                classid = $routeParams.classid,
                _expire = 1*60*60*1000;

            // 跳转到班级考试结果 /:classid/class/exam/result/:examid/:courseid
            $scope.redirectToExamResult = function(data){
                var examid = data.id,course = $scope.course, courseid = course.id;

                location.hash = '#/' + classid + '/class/exam/result/' + examid + '/' + courseid;
            };
            // 判断平均分属于哪个分类
            $scope.checkScore = function(score){
                /*var course = $scope.course, config = course._config, klass = '';

                if(score==config['A']){
                    klass = 'exam-score-A';
                }else if(score>=config['B']){
                    klass = 'exam-score-B';
                }else if(score>=config['C']){
                    klass = 'exam-score-C';
                }else if(score>=config['D']){
                    klass = 'exam-score-D';
                }

                return klass;*/
            };
            // 科目变化
            $scope.courseChange = function(course){
                var courseid = course.id, gradeid,courseList = $scope.courseList, examList;

                $scope.course = course;
                angular.forEach(courseList, function(item,_){
                    item._active = false;
                });
                course._active = true;

                mLoading.show();

                // 获取班级历次考试统计
                var promiseExam = classExamCheckDao.list({ _expire:_expire,semesterid:semesterid,schoolid:schoolid,classid:classid,courseid:courseid,_relatedfields:'exam.*' },function(result){
                    examList = result.data || [];

                    $scope.examList = examList;

                },function(result){
                    mNotice(result.message,'error');
                },function(){

                });


                $q.all([promiseExam]).then(function(){
                    mLoading.hide();
                }, function(){
                    mLoading.hide();
                });
            };

            $scope.run = function(){
                classCourseDao.list({ _expire:_expire,classid:classid, semesterid:semesterid, schoolid:schoolid,_relatedfields:'course.*' },function(result){
                    var list = result.data || [] ,course = list[0]?list[0]['course']:null, courseList = [];

                    angular.forEach(list, function(item, _){
                        var config = item.config || {};
                        config.score = config.score || 100;
                        config['优秀'] = config['优秀'] || {};
                        config['良好'] = config['良好'] || {};
                        config['及格'] = config['及格'] || {};

                        item._config = {};
                        item._config['A'] = config.score;
                        item._config['B'] = config['优秀']['start'] || 90;
                        item._config['C'] = config['良好']['start'] || 80;
                        item._config['D'] = config['及格']['start'] || 60;
                        courseList.push(item.course);
                    });

                    $scope.courseList = courseList;

                    if(!course){
                        mNotice('没有课程','error');
                        return;
                    }

                    $scope.courseChange(course);


                },function(result){
                    mNotice(result.message,'error');
                });
            };

            $scope.run();




        }
    ]);


    return app;
});
