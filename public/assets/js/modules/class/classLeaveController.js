/*
 *   班级请假
 */
define(function(require, exports, module) {

    var Utils = require('utils');
    var app = require('mainApp');
    var IGrow = window['IGrow'];
    var user = IGrow.user;
    var semesterid = IGrow.semester.id;
    var schoolid = user.schoolid;
    var _expire = 1*60*60*1000;
    var _pagesize = 10;

    var checkStatusMap = {
        0:'已批假',
        1:'未审批',
        2:'已拒绝',
        3:'已销假'
    };
    var checkStatusClassMap = {
        0:'leave-bg-D',
        1:'leave-bg-B',
        2:'leave-bg-B',
        3:'leave-bg-E'
    };
    var typeMap = {
        '事假':'leave-bg-A',
        '病假':'leave-bg-B',
        '其他':'leave-bg-C'
    };
    // 班级请假列表
    app.register.controller('classLeaveController', ['$scope', '$q', 'mLoading','mNotice','resource','$routeParams',
        function($scope, $q, mLoading,mNotice,resource,$routeParams) {
            var classid = $routeParams.classid,
                leaveDao = resource('/yo/student/absent');

            document.title = "学生假条";
            $scope.classid = classid;
            $scope.toDetailView = function(hash){
                location.hash = hash;
            };
            $scope.list = function(options){
                var opts = options || {},
                    _page = opts._page || 1,
                    _pagesize = opts._pagesize || 10;

                mLoading.show();
                leaveDao.list({
                    _page:_page,
                    _pagesize:_pagesize,
                    schoolid:schoolid,
                    semesterid:semesterid,
                    classids:classid,
                    _relatedfields:'type.*,student.name'

                },function(result){
                    var list = result.data || [];

                    angular.forEach(list, function(item,_){
                        var checkstatus = item.checkstatus,typename = item.type.name;
                        item._checkstatus = checkStatusMap[checkstatus];
                        item._checkstatusClass = checkStatusClassMap[checkstatus];
                        item._typeClass = typeMap[typename]?typeMap[typename]:typeMap['其他'];
                    });
                    $scope.dataList = $scope.dataList?$scope.dataList.concat(list):list;

                    $scope.flag = list.length?true:false;

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });
            };
            $scope.showMore = function(){
                $scope.page = $scope.page?($scope.page+1):2;
                $scope.list({_page:$scope.page});
            };
            $scope.run = function(){
                $scope.list();
            };

            $scope.run();


        }
    ]);
    // 班级请假详情
    app.register.controller('classLeaveDetailController', ['$scope', '$q', 'mLoading','mNotice','resource','$routeParams','$timeout',
        function($scope, $q, mLoading,mNotice,resource,$routeParams,$timeout) {
            var leaveDao = resource('/yo/student/absent');
            var classMasterDao = resource('/school/class/classmaster');
            var id = $routeParams.id;
            var classid = $routeParams.classid;
            var checkStatusClassMap = {
                0:'leave-color-D',
                1:'leave-color-B',
                2:'leave-color-B',
                3:'leave-color-E'
            };
            document.title = "请假管理";
            // 更新假条审核状态
            $scope.updateCheckStatus = function(checkstatus){
                mLoading.show('正在保存');
                leaveDao.update({
                    id:id,
                    checkstatus:checkstatus
                },function(result){
                    mLoading.success(function(){
                        history.go(-1);
                    });
                },function(result){
                    mLoading.hide();
                    mNotice(result.message,'error');
                },function(){

                });
            };

            $scope.get = function(options){

                $scope.show = false;
                mLoading.show();
                leaveDao.get({
                    id:id,
                    schoolid:schoolid,
                    semesterid:semesterid,
                    _relatedfields:'type.*,student.name'

                },function(result){
                    var data = result.data || {};
                    var checkstatus = data.checkstatus,typename = data.type.name;

                    data._starttime = Utils.formatDate(new Date(data.starttime*1000),'yyyy-MM-dd hh:mm' );
                    data._endtime = Utils.formatDate(new Date(data.endtime*1000),'yyyy-MM-dd hh:mm' );
                    data._checkstatus = checkStatusMap[checkstatus];
                    data._checkstatusClass = checkStatusClassMap[checkstatus];
                    data._typeClass = typeMap[typename]?typeMap[typename]:typeMap['其他'];


                    $scope.data = data;
                    $scope.show = true;

                },function(result){
                    mNotice(result.message,'error');
                },function(){
                    mLoading.hide();
                });

                classMasterDao.list({classid:classid},function(result){
                    var list = result.data || [];

                    for(var i=0; i<list.length;i++){
                        if(list[i]['id'] == IGrow.teacher.id){
                            $scope.isClassMaster = true;
                            break;
                        }
                    }
                },function(result){
                    mNotice(result.message,'error');
                });
            };

            $scope.run = function(){
                $scope.get();
            };

            $scope.run();


        }
    ]);


    return app;
});
