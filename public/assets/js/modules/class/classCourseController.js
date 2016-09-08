/*
 *   班级课程
 *   data.config = {    
 *       //  第一节课
 *       1:{
 *           // 周一
 *           1:{
 *               course:{
 *                   name:''   
 *               },
 *               time:{
 *                   start:'',
 *                   end:''
 *               },
 *               teacher:{
 *                   name:''
 *               }
 *               
 *           },
 *           2:{},
 *           ...
 *           7:{}
 *       },
 *       2:{},
 *       ...
 *       10:{}
 *       
 *   
 *   }
 */
define(function(require, exports, module) {

    var Utils = require('utils');
    var app = require('mainApp');

    app.register.controller('classCourseController', ['$scope', '$q', 'mLoading','mNotice','resource',
        function($scope, $q, mLoading,mNotice,resource) {
            var IGrow = window['IGrow'],
                user = IGrow.user,
                student = IGrow.student,
                teacher = IGrow.teacher,
                semester = IGrow.semester,
                semesterid = semester.id,
                schoolid = user.schoolid,
                classCourseDao = resource('/yo/syllabus'),
                postData = {},classes,classid;

            $scope.formData = {};
            // 日期改變
            $scope.weekDayChange = function(day) {
                $scope.activeDay = day;
                console.log('day',day)
            };
            // 班級切換
            $scope.classChange = function(classid){
                var formData = $scope.formData || {}, classid = classid || formData.classid || '';

                if(!classid){
                    return;
                }
                postData = {
                    classid:classid,
                    schoolid:schoolid,
                    semesterid:semesterid
                };
                mLoading.show();
                classCourseDao.get(postData).then(function(result){
                    var data = result.data || {},classCourseData = data.config;
                    mLoading.hide();
                    if(classCourseData){
                        handleData(classCourseData);
                    }else{
                        $scope.classCourseData = {};
                        //mNotice('班级课程不存在','error');
                    }

                }, function(result){
                    $scope.classCourseData = {};
                    mLoading.hide();
                    mNotice(result.message,'error');
                });

            };
            // 假如用户是老师
            if(teacher) {
                classes = teacher.classes || [];
                classid = classes[0]?classes[0]['id']:'';
                $scope.teacher = angular.copy(teacher);
                $scope.formData.classid = classid;
                if(classid){
                    $scope.classChange(classid);
                }else {
                    mNotice('您没有绑定任何班级','error');
                }
                
                

            }
            // 若用户是学生
            else {
                classid = student.classid;
                $scope.classChange(classid);
            }
            

            // 整理班级课程数据 周一到周日 
            /*
                {
                    '周一':{
                        1:{
    
                        },
                        2:{
    
                        }
                    }
                }

             */
            function handleData(classCourseData){
                var classCourseData = classCourseData || {}, 
                    courseMap = {
                        1:'第一节课',
                        2:'第二节课',
                        3:'第三节课',
                        4:'第四节课',
                        5:'第五节课',
                        6:'第六节课',
                        7:'第七节课',
                        8:'第八节课',
                        9:'第九节课',
                        10:'第十节课'
                    },
                    data = {
                        '1':[],
                        '2':[],
                        '3':[],
                        '4':[],
                        '5':[],
                        '6':[],
                        '7':[]
                    };

                angular.forEach(data, function(courses,weekNumber){
                    
                    angular.forEach(classCourseData, function(weekData,courseNumber){
                        // 早自习不算
                        if(-1 != courseNumber){
                            weekData[weekNumber] = weekData[weekNumber] || {};
                            weekData[weekNumber]['_name'] = courseMap[courseNumber];
                            courses.push(weekData[weekNumber]);
                        }
                        
                    });


                });

                $scope.classCourseData = data;
                console.log('classCourseData',data);
                // 默认显示周一
                $scope.activeDay = 1;

            }




        }
    ]);


    return app;
});