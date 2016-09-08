//'use strict';

(function (app) {

    app.controller('m.attendance.controller', ['$location', '$routeParams', '$api', '$anchorScroll', '$filter','$q','$filter','tips','$timeout',
        function ($location, $routeParams, $api, $anchorScroll, $filter,$q,$filter,tips,$timeout) {

        !
            function(exports) {

                /**
                 *  **exports**
                 *  0.加载用户权限
                 *  1.class
                 *  班级考勤 -2
                 *  20.ios no shadow
                 *  scroll event -3
                 *  studentDetail  -4
                 */
                var module = arguments[1],
                    slice = module.slice = [].slice,
                    isIphone = navigator.userAgent.match(/iPhone/i);
                var	require, studentid;

                module.classid = -1;
                module.location = '/m/attendance/';
                sessionStorage.cache = sessionStorage.cache || JSON.stringify({action:{},classinfo:{},teacherlist:{}});
                module.UId = IGrow.User && IGrow.User.uid || 0;
                module.hasAuth = !!(IGrow.User && IGrow.User.school && IGrow.User.school.teacher);
                module.studentId = IGrow.User && IGrow.User.school && IGrow.User.school.student && IGrow.User.school.student.id;
                module.noop = function(){};
                module.nowDate =  $filter('date')(new Date().getTime(),'yyyy/MM/dd');
                module.isIphone = !!isIphone;

                Object.defineProperty(module, 'cache', {
                    get:function(){
                        return JSON.parse(sessionStorage.cache);
                    },
                    set:function(val){
                        sessionStorage.cache = JSON.stringify(val);
                    }
                });

                require = module.require = function(index){
                    return exports[index].apply(module, slice.call(arguments, 1));
                };

                module.params = $routeParams;
                if(studentid = module.params.studentid || module.studentId){
                    //学生考勤详情
                    if(module.params.classid=='allteacher'){
                        module.params.action = 'teacher';
                        require(6);
                        require(3);
                    }else{
                        module.params.action = 'student';
                        require(4);
                        require(3);
                    }
                }else if(module.classid = module.params.classid){
                    //班级考勤
                    module.classid = Number(module.classid);
                    require(1);
                }
                else{
                    require(1);
                }

            }

                /* api */
            ([
                //加载用户权限
                function loadrole (){
                    var module = this,
                        defer = $q.defer();
                    module.roleType ? $timeout(function () { defer.resolve(); }) : $api.userRole.list({ uid: IGrow.User.uid }, function (result) {
                        module.roleType = result.data || [];
                        var isAdmin = false;
                        angular.forEach(module.roleType, function (item) {
                            if (!isAdmin) {
                                if (['school.admin', 'school.master', 'school.vice_master'].indexOf(item.code) != -1) {
                                    isAdmin = true;
                                }
                            }
                        });
                        defer.resolve(isAdmin);
                    },function(error){
                        defer.reject(error);
                    });
                    return defer.promise;
                },
                //入口 class -1
                function() {
                    var module = this,
                        nowDate =  $filter('date')(new Date().getTime(),'yyyy-MM-dd'),
                        getClassList = function(isAdmin,callback) {
                            var data = {
                                _orderby: 'id asc',
                                _fields: 'id,name,gradeid',
                                _page: 1,
                                _pagesize: 100
                            };
                            !isAdmin && (data.teacherid = module.hasAuth.id);
                            $api[isAdmin ? 'schoolClass' : 'schoolTeacherClass'].list(data, function (ret) {
                                module.classes = ret.data || [];
                                isAdmin && module.classes.unshift({id:'all',name:'全校'},{id:'allteacher',name:'全体教师'});
                                (callback || $.noop)();
                            }, function () {
                                module.classes = [];
                                (callback || $.noop)();
                            });
                        },getGradeid = function(classid){
                            var id = 0;
                            module.classes.length && angular.forEach(module.classes,function(item){
                                item.id == classid && (id = item.gradeid);
                            });
                            return id ;
                        },getSchoolTotal = function(data){
                            var defer = $q.defer();
                            $api.yoAttend.schooltotal(data,function(result){
                                if(data.type=='student'){
                                    module.schoolTotalList = result.data || [];
                                    angular.forEach(module.schoolTotalList,function(item){
                                        item.hasLater = item.hasOwnProperty('latercount')?true:false;
                                        this.push(item);
                                    },module.schoolTotalList = []);
                                    module.studentTotle="全部学生";
                                }else{
                                    module.schoolTeacherTotalList = result.data || [];
                                    angular.forEach(module.schoolTeacherTotalList,function(item){
                                        item.hasLater = item.hasOwnProperty('latercount')?true:false;
                                        this.push(item);
                                    },module.schoolTeacherTotalList = []);
                                    module.teacherTotle="全部教师";
                                }
                                defer.resolve(result.data);

                            },function(error){
                                defer.reject(error);
                            });
                            return defer.promise ;
                        };
                    module.changeClass = function(){
                        var data = angular.extend({starttime: nowDate},module.searchData);
                        if(data.classid){
                            module.require(2);
                            //sessionStorage.classid = data.classid ;
                            if(data.classid == 'all'){
                                module.params.router = 'total';
                                module.isAdmin && getSchoolTotal({
                                    type : 'student',
                                    starttime : module.searchData.starttime || nowDate ,
                                    endtime : module.searchData.starttime || nowDate
                                }) && getSchoolTotal({
                                    type : 'teacher',
                                    starttime : module.searchData.starttime || nowDate ,
                                    endtime : module.searchData.starttime || nowDate
                                });
                            }else if(data.classid == 'allteacher'){
                                module.params.router = 'teacher';
                                module.getAttendanceList(data);
                            }else{
                                module.params.router = 'class';
                                data.gradeid = getGradeid(data.classid);
                                module.getAttendanceList(data);
                            }
                        }else{
                            module.params.router = 'none';
                        }

                    };
                    document.title="考勤管理";
                    if(module.hasAuth){
                        //教师
                        module.searchData = {};
                        module.require(0).then(function(isAdmin){
                            getClassList(module.isAdmin = isAdmin,function(){
                                module.searchData.classid = module.classid ? module.classid: module.classes.length?module.classes[0].id:null;
                                module.changeClass();
                                module.params.action = 'total';
                            });
                            /*isAdmin && getSchoolTotal({
                                type : 'student',
                                starttime : module.searchData.starttime || nowDate ,
                                endtime : module.searchData.starttime || nowDate
                            });*/
                        })
                    }else{
                        module.classid = IGrow.User.student && IGrow.User.student.classid;
                        //家长
                        window.location.pathname = '/' + module.classid +'/' + module.studentId;
                    };

                },

                //班级/教师考勤 -2
                function() {
                    var module = this,
                        id = module.params.id || module.studentClassId,
                        bindSwipeEvent = function (){
                            var tabNum = module.attendListData.countData ? module.attendListData.countData.length:0,
                                tabs = $(".tabs:first-child"),
                                box = tabs.find(".tabs-flex"),
                                TABWIDTH = 120,
                                maxMove,
                                nowNum = 0;
                            module.isMove = tabs.width() < TABWIDTH*tabNum ? function (num){
                                maxMove =  Math.ceil((TABWIDTH*tabNum - tabs.width())/TABWIDTH);
                                nowNum = Math.min(Math.max(num-1,0),maxMove) ;
                                box.animate({
                                    'marginLeft':-nowNum*TABWIDTH
                                });
                            }:angular.noop;
                        };
                        module.getAttendanceList = function(data){
                        var data = angular.extend({
                            type : data.classid=='allteacher'? 'teacher' : 'student',
                            _page : 1,
                            endtime : data.starttime
                        },data);
                        $api.yoAttend.total(data,function(result){
                            var timeArr = [];
                            module.attendListData =  result.data ||{};
                            module.attendListData.list = module.attendListData.list || [];
                            module.attendListData.count = module.attendListData.count || {};
                            module.attendListData.sum = module.attendListData.count.sum  || 0;
                            delete module.attendListData.count.sum ;
                            angular.forEach(module.attendListData.list,function(item){
                                item.atoms.length&&angular.forEach(item.atoms,function(note){
                                    note.checktime = note.checktime? $filter('date')(note.checktime+'000','HH:mm'):'--:--';
                                })
                            });
                            angular.forEach(module.attendListData.count,function(item,index){
                                item.key = index ;
                                if( item.hasOwnProperty('latercount') ){
                                    item.unusual = item.latercount;
                                    item.isLater = true ;
                                }else{
                                    item.unusual = item.earlycount;
                                    item.isLater = false;
                                };
                                timeArr.push(index);
                                this.push(item);
                            },module.attendListData.countData=[]);
                            bindSwipeEvent();
                            module.attendListData.checked = timeArr[0];
                            //切换选项卡更新数据
                            module.attendListData.getData = function(key,index){
                                var data = {list:[] };
                                if(key){
                                    module.attendListData.checked = key ;
                                    angular.forEach(module.attendListData.count,function(item,index){
                                        index == key && (data.count = item);
                                    });
                                    angular.forEach(module.attendListData.list,function(item){
                                        angular.forEach(item.atoms,function(sun){
                                            sun.code == key &&  (item.attend = sun);
                                        },item.attend == null);
                                        data.list.push(item);
                                    });
                                    module.attendListData.data = data;
                                }else{
                                    module.attendListData.data = {list:[] };
                                };
                                module.isMove(index);
                            };
                            module.attendListData.getData(module.attendListData.checked);

                            /*angular.forEach(module.attendListData.count,function(item,name){
                                if( item.hasOwnProperty('latercount') ){
                                    latercount = item.latercount;
                                    item.isLater = true ;
                                }else{
                                    latercount = item.earlycount;
                                    item.isLater = false;
                                }
                                item.tealname = name ;
                                item.dayPercentage = Math.round(item.daycount/module.attendListData.sum *100);
                                item.laterPercentage = Math.round(latercount/module.attendListData.sum*100);
                                item.absentPercentage = Math.round(item.absentcount/module.attendListData.sum*100);
                                this.push(item);
                            },module.attendListData.countData=[]);*/
                        });
                    };

                },
                //scroll event -3
                function(){
                    var module = this ;
                    function testScrollHeight (scrollTop,num,nowTop){
                        var dl = $(".record_list");
                        num = num || 0;
                        nowTop = nowTop || 0;
                        if(nowTop < scrollTop && num < dl.length){
                            nowTop +=  dl.eq(num).outerHeight(true);
                            num ++;
                            return testScrollHeight.apply(this,arguments);
                        }else{
                            return num ;
                        }
                    };
                    $(window).scroll(function(){
                        var num = testScrollHeight($(this).scrollTop(),0,0),
                            totalNum = module.studentAttendList ? module.studentAttendList.length:0;
                        $(".record_list").removeClass("current").eq(num).addClass("current");
                        if(totalNum<=6 || num > totalNum-6)module.loadMore();
                        //console.log(num,totalNum);
                    });
                },
                // studentDetail  -4
                function(){
                    var ONEDAY = 60*60*24*1000,
                        module = this,
                        studentid = module.params.studentid || module.studentId,
                        endTime = new Date().getTime(),
                        startTime = endTime - 9*ONEDAY,
                        isLoading = false,
                        overplus = 2,
                        data = {
                            type : 'student',
                            studentid : studentid ,
                            startday : $filter('date')(startTime,'yyyy-MM-dd'),
                            endday : $filter('date')(endTime,'yyyy-MM-dd'),
                            _relatedfields :'code.name,student.name'
                        };
                    function loadAttend (data){
                        $api.yoAttend.studentDetail(data,function(result){
                            var data = result.data || [],attendids = [];
                            !module.studentAttendList && (module.studentAttendList = []);
                            data.length && (document.title = data[0].student.name + "考勤记录");
                            angular.forEach(data,function(item){
                                item.checktime = item.checktime? $filter('date')(item.checktime+'000','HH:mm'):'--:--';
                                item.date = item.day.toString().slice(4).replace(/(^\d{2})/g,"$1"+"-");
                                var obj ={
                                    name : item.code.name,
                                    createtime : item.createtime,
                                    checktime : item.checktime,
                                    checkstatus : item.checkstatus,
                                    webiconpath : item.webiconpath ?'http://yeycardsvr.igrow.cn/icon' + item.webiconpath:''
                                };
                                if(!~attendids.indexOf(item.attendid)){
                                    attendids.push(item.attendid);
                                    item.attendList = [];
                                    item.attendList.push(obj);
                                    module.studentAttendList.push(item);
                                }else{
                                    angular.forEach(module.studentAttendList,function(note){
                                        note.attendid == item.attendid && note.attendList.push(obj)
                                    });
                                }
                            });
                            module.studentAttendList && module.studentAttendList.length<6 && $timeout(function(){module.loadMore(200)});
                            isLoading = false ;
                            //console.log(module.studentAttendList);
                        });
                    };
                    module.loadMore = function(){
                        if(!isLoading && overplus > 0){
                            endTime = startTime - ONEDAY ;
                            startTime = endTime - 9*ONEDAY;
                            overplus--;
                            isLoading = true ;
                            data.startday = $filter('date')(startTime,'yyyy-MM-dd');
                            data.endday = $filter('date')(endTime,'yyyy-MM-dd');
                            loadAttend(data);
                        }
                    };
                    loadAttend(data);

                },
                //ios no shadow -5
                function() {
                    var module = this;
                    if(!module.isIphone)return;
                    $timeout(function(){
                        $('.publishwork').find('input,textarea').addClass('noshadow');
                    });
                },
                // teacherDetail  -6
                function(){
                    var ONEDAY = 60*60*24*1000,
                        module = this,
                        studentid = module.params.studentid || module.studentId,
                        endTime = new Date().getTime(),
                        startTime = endTime - 9*ONEDAY,
                        isLoading = false,
                        overplus = 2,
                        data = {
                            teacherid : studentid,
                            startday : $filter('date')(startTime,'yyyy-MM-dd'),
                            endday : $filter('date')(endTime,'yyyy-MM-dd'),
                            _relatedfields :'code.name,teacher.name',
                            _page: 1,
                            _pagesize:1000
                        };
                    function loadAttend (data){
                        $api.yoAttend.teacherDetail(data,function(result){
                            var data = result.data || [],attendids = [];
                            !module.teacherAttendList && (module.teacherAttendList = []);
                            data.length && (document.title = data[0].teacher.name + "考勤记录");
                            angular.forEach(data,function(item){
                                item.checktime = item.checktime? $filter('date')(item.checktime+'000','HH:mm'):'--:--';
                                item.date = item.day.toString().slice(4).replace(/(^\d{2})/g,"$1"+"-");
                                var obj ={
                                    name : item.code.name,
                                    createtime : item.createtime,
                                    checktime : item.checktime,
                                    checkstatus : item.checkstatus,
                                    webiconpath : item.webiconpath ?'http://yeycardsvr.igrow.cn/icon' + item.webiconpath:''
                                };
                                if(!~attendids.indexOf(item.attendid)){
                                    attendids.push(item.attendid);
                                    item.attendList = [];
                                    item.attendList.push(obj);
                                    module.teacherAttendList.push(item);
                                }else{
                                    angular.forEach(module.teacherAttendList,function(note){
                                        note.attendid == item.attendid && note.attendList.push(obj)
                                    });
                                }
                            });
                            module.teacherAttendList && module.teacherAttendList.length<6 && $timeout(function(){module.loadMore(200)});
                            isLoading = false ;
                            //console.log(module.studentAttendList);
                        });
                    };
                    module.loadMore = function(){
                        if(!isLoading && overplus > 0){
                            endTime = startTime - ONEDAY ;
                            startTime = endTime - 9*ONEDAY;
                            overplus--;
                            isLoading = true ;
                            data.startday = $filter('date')(startTime,'yyyy-MM-dd');
                            data.endday = $filter('date')(endTime,'yyyy-MM-dd');
                            loadAttend(data);
                        }
                    };
                    loadAttend(data);

                }

            ], this);

    }]);

})(angular.module('m.attendance', []));