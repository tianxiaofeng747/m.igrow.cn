define(function(require, exports, module) {
    require('datetimepicker.css');
    require('datetimepicker.js');

    $.fn.datetimepicker.dates['zh-CN'] = {
        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
        daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        today: "今日",
        suffix: [],
        meridiem: []
    };

    var directive = {
        isDone:false,
        inject:function(app){
            if(app.datetimepicker){
                return;
            }
            app.datetimepicker = true;
            /* 日历 */
            //yyyy-mm-dd hh:ii
            app.register.directive('datetimepicker', ['$filter', function ($filter) {
                return {
                    restrict: 'A',
                    require: '?ngModel',
                    link: function($scope,$element, $attr, $ctrl){
                        var model = $scope[$attr.ngModel],options = $attr.options,defOpt,data = $element.data();

                        if(!$ctrl){
                            return;
                        }
                        $element.attr('readOnly','readOnly');
                        options = $scope[$attr.datetimepicker] || {};
                        if(data.format) {
                            options.format = data.format;
                        }
                        if(data.minview!==undefined) {
                            options.minView = data.minview;
                        }
                        if(data.startview){
                            options.startView = data.startview;
                        }
                        if(data.todaybtn){
                            options.todayBtn = data.todaybtn;
                        }
                        if(data.pickerposition){
                            options.pickerPosition = data.pickerposition;
                        }
                        if(data.initialdate){
                            options.initialDate = data.initialdate;
                        }
                        defOpt = {
                            //initialDate:'2012-12-12',
                            language:'zh-CN',
                            format:'yyyy-mm-dd',// yyyy-mm-dd hh:ii
                            weekStart: 1,// 一周从哪一天开始。0（星期日）到6（星期六）
                            todayBtn:  1,
                            autoclose: 1,
                            startView: 2,//默认值：0 , 'hour' 1 , 'day' 2 , 'month' 3 , 'year' 4 , 'decade'
                            minView:2,//默认值：0, 'hour' 2
                            pickerPosition:'bottom-left' // bottom-right
                        };
                        var opts = $.extend({},defOpt,options);
                        $element.datetimepicker(opts).on('changeDate', function(e){
                            var value = e.currentTarget.value,date = e.date,time = '';
                            if(!value){
                                value = $(e.currentTarget).find('input[type=text]').val();
                            }
                            time =  date && date.getTime();
                            $element.attr('data-time',time);
                            $scope[$attr.ngModel] = value;
                            $ctrl.$setViewValue(value);
                            $scope.$apply();
                           
                        }).on('show',function(){
                            $('.datetimepicker .icon-arrow-left').addClass('fa fa-arrow-left');
                            $('.datetimepicker .icon-arrow-right').addClass('fa fa-arrow-right');
                        });
                    }
                };
            }]);
        }
    };
    

    return directive;



});