/*
    班级风采-班级照片
 */
define(function(require, exports, module) {
    
    var app = require('mainApp');
    
    app.register.controller('classPhotoController', ['$scope', '$q', '$routeParams','mLoading','mNotice','resource',
        function($scope, $q, $routeParams,mLoading,mNotice,resource) {
            var IGrow = window['IGrow'],
                classid = $routeParams.classid,
                log = IGrow.log, 
                albumid = $routeParams.albumid,
                winWidth = window.innerWidth, 
                width = Math.floor((winWidth-10*3)/2),
                classPhotoDao = resource('/yo/photo');

            mLoading.show();
    
            classPhotoDao.list({ albumid:albumid,_page:1,_pagesize:1000 },function(result){
                var list = result.data || [];

                angular.forEach(list, function(photo,_){
                    photo._thumb = photo.url + '!square.150';
                    photo._width = width+'px';
                });
                $scope.photoList = list;

            },function(result){
                mNotice(result.message,'error');
            },function(){
                mLoading.hide();
            });
        }
    ]);


    return app;
});