/*
 *   班级请假考勤
 *
    sumdaycount 正常
    sumlatercount 迟到
    sumearlycount 早退
    sumleavecount 请假
    sumtruancycount 旷课
    sumothercount 其他
 */
define(function(require, exports, module) {

	var Utils = require('utils');
	var app = require('mainApp');

	app.register.controller('classSchooldayController', ['$scope', '$q', 'mLoading', 'mNotice', 'resource', '$routeParams',
		function($scope, $q, mLoading, mNotice, resource, $routeParams) {
			var IGrow = window['IGrow'],
				user = IGrow.user,
				semester = IGrow.semester,
				semesterid = semester.id,
				schoolid = user.schoolid,
				classid = $routeParams.classid,
				statDao = resource('/yo/student/attend/stat', {}, {
					baseclass: {
						method: 'GET'
					}
				}),
				today = Utils.formatDate(new Date(), 'yyyy-MM-dd'),
				_expire = 1 * 60 * 60 * 1000;
			
			// 跳转到请假
			$scope.toClassLeave = function() {
				var route = '/:classid/class/leave';
				location.hash = '#' + route.replace(':classid', classid);
			};

			$scope.toClassAttendance = function() {
				var route = '/:classid/class/attendance';
				location.hash = '#' + route.replace(':classid', classid);
			};

			$scope.run = function() {
				mLoading.show();
				statDao.baseclass({
					semesterid: semesterid,
					schoolid: schoolid,
					classid: classid,
					startday: today,
					endday: today
				}, function(result) {
					var list = result.data || [],
						stat = list[0] ? list[0] : null;


					$scope.stat = stat ? stat : {
						sumleavecount: 0,
						sumearlycount: 0,
						sumtruancycount: 0,
						sumlatercount: 0
					};

				}, function(result) {
					mNotice(result.message, 'error');
				}, function() {
					mLoading.hide();
				});
			};

			$scope.run();

		}
	]);


	return app;
});
