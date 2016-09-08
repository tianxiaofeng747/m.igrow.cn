//'use strict';

(function (app) {

    app.controller('m.class.controller', ['$location', '$routeParams', '$api', '$anchorScroll', '$filter', function ($location, $routeParams, $api, $anchorScroll, $filter) {

        var $this = this;
        $this.action = sessionStorage.classAction || 'student';
        delete sessionStorage.classAction;

        document.title = {student: '花名册', teacher: '教师通讯录'}[$this.action];

        var $height = $(window).height();

        //定义数据对象
        var requestData = {
                includeclassmaster: 1,
                _pagesize: 1000,
                _fields: 'id,uid,name,spell,mobile',
                _relatedfields: 'user.avatar'
            },
        //字母排序
            spellSort = function (data) {

                var allLen = data.length,
                    pagetype = location.hash,
                    spell = {},
                    tmp = [],
                    exists = {},
                    unbind = [],
                    notbind = [],
                    bind = [],
                    total = [];

                //page
                pagetype = ~pagetype.indexOf('pm');

                //按照spell第一位字母push arr
                angular.forEach(data, function (item, key) {
                    if (!exists[item.id] && item.uid != IGrow.User.uid) {
                        //是否是字母 ?
                        key = /^[a-z]/i.test(item.spell || '') ? item.spell.charAt(0).toUpperCase() : '#';
                        spell[key] = spell[key] || [];
                        spell[key].push(item);
                        exists[item.id] = true;
                    }
                });
                //A-Z push->[] 未绑定在后
                angular.forEach(spell, function (item, key) {

                    if (pagetype) {
                        //当字母为不'#'
                        if (key != '#') {
                            var aa = [];
                            angular.forEach(item, function (item) {
                                item.uid ? aa.push(item) : notbind.push(item)
                            });
                            aa.sort(function (a, b) {
                                return a.spell === b.spell ? (a.id > b.id ? 1 : -1) : (a.spell > b.spell ? 1 : -1)
                            });
                            notbind.sort(function (a, b) {
                                return a.spell === b.spell ? (a.id > b.id ? 1 : -1) : (a.spell > b.spell ? 1 : -1)
                            });
                            this.push({name: key, data: aa});
                        } else {
                            item.length && (bind = item.filter(function (item) {
                                return item.uid > 0;
                            }));
                            unbind = item.filter(function (item) {
                                return item.uid == 0;
                            });
                        }
                    } else {
                        this.push({name:key, data:item});
                    }
                }, tmp);

                //A-Z 排序
                tmp.sort(function (a, b) {
                    return a.name < b.name ? -1 : 1
                });

                (!pagetype && '#' == tmp[0].name) && tmp.push(tmp.shift());

                //spell 非A-Z
                pagetype && bind.length && tmp.push({name: '#', data: bind});

                //未绑定处理
                if (pagetype && (notbind.length || unbind.length)) {
                    total = notbind.concat(unbind);
                    tmp.push({name: '未绑定人数<i>(' + total.length + '人)</i>', head: false, data: total, style: true});
                }

                //{name:'A',data:[{},{}]}, 添加字母处理
                angular.forEach(tmp, function (item) {
                    if (item.data.length) {
                        if (item.style) {
                            this.push({name: item.name, head: false, style: true});
                        } else {
                            this.push({name: item.name, head: true});
                        }
                        angular.forEach(item.data, function (item) {
                            this.push(item)
                        }, this);
                    }
                }, data = []);

                pagetype && data.unshift({name: '已绑定人数<i>(' + (allLen - total.length) + '人)</i>', head: false, style: true});

                return data;

            },
        //加载学生数据
            loadStudent = function (data) {
                $api.schoolClassStudent.list(data, function (result) {
                    $this.studentData = spellSort(result.data);
                }, function () {
                    $this.studentData = []
                })
            },
        //加载班级数据
            loadClass = function (data) {
                $api.schoolClass.list({_orderby: 'id asc',_pagesize:100}, function (result) {
                    if ((result.data = result.data || []).length === 1 && $this.status === 4) {
                        //若只获取到一条班级数据，则变更为当前班级查看状态
                        $this.classid = result.data[0].id;
                        $this.status = 6;
                        requestData.classid = $this.classid;
                        loadStudent(requestData);
                    }
                    else {
                        $this.classData = result.data
                    }
                    if ($this.status === 5) {
                        angular.forEach($this.classData, function (item) {
                            if ($this.checkedItems.classes[item.id] && $this.checkedItems.classes[item.id].all) {
                                $this.checkedItems.classes[item.id].name = item.name
                            }
                        });
                        sessionStorage.PMCheckedItems = JSON.stringify({
                            all: $this.checkedItems.all,
                            classes: $this.checkedItems.classes,
                            teacher: $this.checkedItems.teacher
                        });
                    }
                }, function () {
                    $this.classData = []
                })
            },
        //加载老师数据
            loadTeacher = function (data, model) {
                if (IGrow.User.school.teacher) delete data.classid;
                model.list(data, function (result) {
                    $this.teacherData = spellSort(result.data);
                }, function () {
                    $this.teacherData = []
                })
            };

        //学生身份
        if (IGrow.User.school.student) {
            requestData.classid = IGrow.User.school.student.classid;
            //url: /class
            if (!$routeParams.action && !$routeParams.classid) {
                $this.status = 1;
                loadStudent(requestData);
                loadTeacher(requestData, $api.schoolClassTeacher);
            }
            //url: /class/:classid
            if (!$routeParams.action && $routeParams.classid === 'pm') {
                document.title = '教师通讯录';
                $this.status = 2;
                loadTeacher(requestData, $api.schoolClassTeacher);
            }
        }

        //老师身份
        if (IGrow.User.school.teacher) {
            //url: /class/:action/:classid
            if ($routeParams.action && $routeParams.classid) {
                if (sessionStorage.PMCheckedClassName) {
                    document.title = sessionStorage.PMCheckedClassName;
                    delete sessionStorage.PMCheckedClassName;
                }
                sessionStorage.fromClassPM = 1;
                $this.status = 3;
                requestData.classid = $this.classid = $routeParams.classid;
                loadStudent(requestData);
            } else {
                //url: /class
                if (!$routeParams.action && !$routeParams.classid) {
                    $this.status = 4;
                    loadClass();
                }
                //url: /class/:classid
                if (!$routeParams.action && $routeParams.classid) {
                    $this.classid = $routeParams.classid;
                    if ($this.classid === 'pm') {
                        document.title = '选择联系人';
                        $this.status = 5;
                        loadClass();
                    } else {
                        $this.status = 6;
                        requestData.classid = $this.classid;
                        loadStudent(requestData);
                    }
                }
                requestData.status = 0;
                loadTeacher(requestData, $api.schoolTeacher);
            }
        }


        $this.gotoletter = function (letter) {
            var old = $location.hash();
            $location.hash(letter);
            $anchorScroll();
            $location.hash(old);
        }

        $this.tabCheck = function (tab) {
            $this.action = tab;
            document.title = {student: $this.status === 4 ? '选择班级' : '花名册', teacher: '教师通讯录'}[tab];
        };

        //返回微信模块
        $this.backToPM = function (item) {

            //跳转至微信对话模块
            if ($this.status === 2 || $this.status === 5) {
                if ($this.status === 5 && $this.checkedItems.length === 0) return;
                sessionStorage.PMChatUID = item ? item.uid : 'group';
                if ($this.status === 2) {
                    sessionStorage.PMChatName = item.name;
                }
                $location.url('/m/pm').replace();
            }

            //跳转至班级和老师继续选择
            $this.status === 3 && $location.url('/m/class/pm').replace();

        };

        //勾选项
        $this.checkedItems = {
            all: false,
            classes: {},
            teacher: {},
            click: function (item) {

                //执行单选，选择完成后立即跳转
                $location.url('/m/pm/' + item.uid + '/' + item.name).replace();
                return;

                var _this = this;

                if ($this.status === 3) {
                    _this.classes[$this.classid] = _this.classes[$this.classid] || {};
                    if (item) {
                        //点击学生
                        _this.classes[$this.classid].student = _this.classes[$this.classid].student || {};
                        if (_this.classes[$this.classid].student[item.id]) {
                            //已选择
                            delete _this.classes[$this.classid].all;
                            delete _this.classes[$this.classid].student[item.id];
                            if (!Object.keys(_this.classes[$this.classid].student).length) delete _this.classes[$this.classid];
                        } else {
                            //未选择
                            if (_this.classes[$this.classid].all) {
                                //若已全选，将其余项都选中，当前点击项则移出选择
                                angular.forEach($this.studentData, function (student) {
                                    if (!student.head) {
                                        _this.classes[$this.classid].student[student.id] = {
                                            id: student.id,
                                            name: student.name
                                        }
                                    }
                                });
                                delete _this.classes[$this.classid].all;
                                delete _this.classes[$this.classid].student[item.id];
                            } else {
                                //若未全选，在选择完成后判断是否全选中，如果全部选中，则转换成全选方式，减少对象占用空间 {student:{...}} -> {all:true}
                                _this.classes[$this.classid].all = true;
                                _this.classes[$this.classid].student[item.id] = {id: item.id, name: item.name};
                                angular.forEach($this.studentData, function (student) {
                                    if (!student.head) {
                                        if (!_this.classes[$this.classid].student[student.id]) delete _this.classes[$this.classid].all;
                                    }
                                });
                                if (_this.classes[$this.classid].all) delete _this.classes[$this.classid].student;
                            }
                        }
                        //标识是否全选或已选数量
                        if (_this.classes[$this.classid]) {
                            if (_this.classes[$this.classid].student) {
                                _this.classes[$this.classid].length = Object.keys(_this.classes[$this.classid].student).length
                            } else {
                                delete _this.classes[$this.classid].length
                            }
                        }
                    } else {
                        //点击全选
                        if (_this.classes[$this.classid].all) {
                            delete _this.classes[$this.classid]
                        } else {
                            _this.classes[$this.classid] = {all: true}
                        }
                    }
                }

                if ($this.status === 5) {
                    if (item) {
                        if (item.schoolid) {
                            //班级
                            if (_this.classes[item.id]) {
                                delete _this.classes[item.id]
                            } else {
                                _this.classes[item.id] = {all: true, name: item.name}
                            }
                        } else {
                            //教师
                            if (_this.teacher[item.id]) {
                                delete _this.teacher[item.id]
                            } else {
                                _this.teacher[item.id] = {id: item.id, name: item.name}
                            }
                        }
                    } else {
                        if (_this.all) {
                            _this.all = false;
                            _this.classes = {};
                            _this.teacher = {};
                        } else {
                            _this.all = true;
                            angular.forEach($this.classData, function (item) {
                                _this.classes[item.id] = {all: true, name: item.name}
                            });
                            angular.forEach($this.teacherData, function (teacher) {
                                if (!teacher.head) {
                                    _this.teacher[teacher.id] = {id: teacher.id, name: teacher.name}
                                }
                            });
                        }
                    }
                    _this.total();
                }

                sessionStorage.PMCheckedItems = JSON.stringify({
                    all: _this.all,
                    classes: _this.classes,
                    teacher: _this.teacher
                });

            },
            total: function () {
                var _this = this;
                _this.length = 0;
                angular.forEach(_this.classes, function (item) {
                    _this.length += item.all ? 1 : item.length
                });
                _this.length += Object.keys(_this.teacher).length;
                return _this.length;
            },
            length: 0
        };

        //是否为选择模式
        if (sessionStorage.fromClassPM && sessionStorage.PMCheckedItems && ($this.status === 3 || $this.status === 5)) {
            //获得存储的变量
            angular.extend($this.checkedItems, JSON.parse(sessionStorage.PMCheckedItems));
        } else {
            //删除已记录变量
            delete sessionStorage.PMCheckedItems;
        }

        if ($this.status !== 3) {
            //删除变量
            delete sessionStorage.fromClassPM;
        }

        //获得选中总数
        if ($this.status === 5) {
            $this.checkedItems.total();
            $this.checkedClass = function (item) {
                sessionStorage.PMCheckedClassName = item.name;
                $location.url('/m/class/pm/' + item.id).replace();
            };
        }

        //leter list font size settings
        if($height<580 && $height>480){
            setTimeout(function(){
                $('.skipletter').css('font-size','90%');
            });
        }else if($height<=480){
            setTimeout(function(){
                $('.skipletter').css('font-size','70%');
            });
        }else if($height>580){
            setTimeout(function(){
                $('.skipletter').css('font-size','110%');
            });
        }

        if(!~location.hash.indexOf('pm')){
            setTimeout(function(){
                $('.skipletter').css({'top':'44px','paddingBottom':'44px'});
            });
        }


    }]);


    app.filter('stylefilter', function () {
        return function (inputArray) {
            var array = [];
            if (inputArray) {
                for (var i = 0; i < inputArray.length; i++) {
                    if (!inputArray[i].style) {
                        array.push(inputArray[i]);
                    }
                }
            }
            return array;
        }
    });





})(angular.module('m.class', []));