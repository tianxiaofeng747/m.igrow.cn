define(function(require, exports, module) {
    var Utils = require('utils');

    require('angular-core');

    var app = angular.module('redirectApp', ['angular-core']);

    app.controller('redirectController',['$scope','$q','resource','mNotice',function($scope,$q,resource,mNotice){
        var userDao = resource('/user'),
            schoolClassApi = resource('/school/class'),
            IGrow = window['IGrow'] || {},
            host = 'http://' + location.host + '/main';
        $scope.run = function(){
            var url = location.href, index = url.indexOf('#'), key;
            if(index>-1){
                url = url.substring(0,index);
            }
            index = url.indexOf('main/');
            key = url.substring(index+5);
            userDao.get({},function(result){
                var user = result.data || {};
                IGrow.user = user;
                if(isStudent(user)){
                    redirect(key);
                }else {
                    IGrow.teacher = {};
                    schoolClassApi.list({},function(result){
                        IGrow.teacher.classes = result.data || [];
                        redirect(key);
                    },function(result){
                        mNotice(result.message,'error');
                    });
                }
            },function(result){
                mNotice(result.message,'error');
            });
        };

        $scope.run();

        // typeid redirectHash = ['#profile','#schoolday','#exam','#homework','#behave'],
        function redirect(key){
            var key = key || '',user = IGrow.user,url;


            switch(key){
                case 'profile':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/profile');
                    }else {
                        url = host + '#/teacher/profile';
                        location.replace(url);
                    }
                    break;
                case 'schoolday':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/schoolday');
                    }else {
                        url = host + IGrow.parseClassRoute('schoolday');
                        location.replace(url);
                    }
                    break;
                case 'exam':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/score');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('exam'));
                    }
                    break;
                case 'homework':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/homework');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('homework'));
                    }
                    break;
                case 'behave':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/behave/list');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('behave'));
                    }
                    break;
                case 'tweet':
                    if( isStudent(user) ){
                        location.replace(host+'#/student/tweet/list');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('tweet'));
                    }
                    break;
                case 'show':
                    if( isStudent(user) ){
                        location.replace(host+'#/class/show/info');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('show'));
                    }
                    break;
                case 'interact':
                    if( isStudent(user) ){
                        var classid=IGrow.User.school.student.classid;
                        location.replace(host+'#/'+classid+'/class/interact');
                    }else {
                        location.replace(host+IGrow.parseClassRoute('interact'));
                    }
                    break;
                default:
                    break;
            }

        }

        function isStudent(user){
            return user.typeid==4?true:false;
        }


    }]);


    return app;
});
