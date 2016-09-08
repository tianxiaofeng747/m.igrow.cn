;(function(app) {

	'use strict';

	app.controller(app.name + '.public.controller', ['$q','$routeParams', '$location', '$timeout', '$api', 'imgPreview', 'classifyAttachment', 'play', 'mNotice', 'mLoading','$sce','$scope','tools',
		function($q, $routeParams, $location, $timeout, $api, imgPreview, classifyAttachment, play, mNotice, mLoading,$sce,$scope,tools) {

		/* handler */

		!

		function(exports) {

			/**
			 *  **exports**
			 *  0.select Change
			 *  1.get teacher class
			 *  2.selection Tool
			 *	3.load three class information
			 *  4.classinfo
			 *  5.teacherlist
			 *  6.classalbum
			 *  7.classalbumdetail
			 *  8.work
			 *  9.preview
			 *  10.loadData
			 *  11.star
			 *  12.workdetail
			 *  13.cache
			 *  14.album delete
			 *  15.deleteAlbumdetial
			 *  16.publishword
			 *  17.selectstudent
			 *  18.publish star
			 *  19.classalbumdetail upload
			 *  20.ios no shadow
			 */

			var module = arguments[1],
				slice = module.slice = [].slice,
				preview = document.querySelector('#imageView'),
				isIphone = navigator.userAgent.match(/iPhone/i);
			var	require, action;

			module.classid = -1;
			module.isCache = false;// cache switch
			module.color = '#ededed';
			sessionStorage.cache = sessionStorage.cache || JSON.stringify({action:{},classinfo:{},teacherlist:{}});
			module.UId = IGrow.User && IGrow.User.uid || 0;
			module.hasAuth = !!(IGrow.User && IGrow.User.school && IGrow.User.school.teacher);
			module.studentClassId = IGrow.User && IGrow.User.school && IGrow.User.school.student && IGrow.User.school.student.classid;
			module.noop = function(){};
			module.isIphone = !!isIphone;

			Object.defineProperty(module, 'cache', {
				get:function(){
					return JSON.parse(sessionStorage.cache);
				},
				set:function(val){
					sessionStorage.cache = JSON.stringify(val);
				}
			});

			require = module.require = function(ind){
				return exports[ind].apply(module, slice.call(arguments, 1));
			}

			if(preview)preview.parentNode.removeChild(preview);

			module.params = $routeParams;
			if(!module.hasAuth){
				$timeout(function(){
					$('.class-album-list,.class-photo-list,.student-work-list,.class-star-list')
						.css('bottom', 0);
				});
			}


			if(action = module.params.action){

				switch (action) {
					case 'album':
						require(6);
						break;
					case 'albumdetail':
						require(7);
						break;
					case 'work':
						require(8);
						break;
					case 'publishwork':
						require(16);
						require(21);
						break;
					case 'selectstudent':
						require(17);
						break;
					case 'workdetail':
						require(12);
						break;
					case 'star':
						require(11);
						break;
					case 'publishstar':
						require(18);
						require(21);
						break;
					default:
						require(4);
						require(5);
				}


			}else{
				require(1);
				if(!module.hasAuth)require(3);
				if(module.hasAuth)require(0);

			}

		}

		/* api */
		([

			// select Change -0
			function() {
				var module = this;
				this.classChange = function(){
					sessionStorage.changeVal = module.changeVal;
					module.require(3);
				}
			},

			//get teacher class -1
			function() {
				var module = this,
					requestClassData = function(ret){
						!module.cache.classes && module.require(13, {'classes': ret.data || []});
						module.classes = module.cache.classes;
						module.changeVal = sessionStorage.changeVal || module.classes[0].id;
						if(!sessionStorage.changeVal)sessionStorage.changeVal = module.changeVal;
						$timeout(function(){
							$('.widget-wrap').append('<i></i>');
							module.require(3);
						});
					};

				document.title="班级主页";

				if(!module.hasAuth){
					$api.schoolClass.get({id:module.studentClassId,_fields:'name'},function(ret){
						module.cls = ret.data.name || '';
					});
					return;
				}

				if(module.isCache && module.cache.classes){
					requestClassData({data:module.cache.classes});
					return;
				};

				$api.schoolClass.list({
					_orderby: 'id asc',
					_fields:'id,name',
                    _page: 1,
                    _pagesize: 100
				}, function(ret) {
					requestClassData(ret);
				}, function() {
					module.classes = [];
				})
			},

			//selection Tool -2
			function() {
				var $wrap = $('.widget-wrap'),
					$widget = $('.widget'),
					$icon = $('#select-icon'),
					$select = $widget.children('select');
				$widget.width($select.width() - 13);
				$wrap.css('width',$widget.width()+10);
			},

			//load three class information -3
			function() {
				var module = this,
					isUpdate = false,
					actionUpdate = JSON.parse(sessionStorage.actionUpdate || '{}'),
					data = {
						classid:sessionStorage.changeVal || module.changeVal,
						status: 1,
						_pagesize: 3
					},
					isImg = function (ext) {
						return !!~['bmp', 'gif', 'jpg', 'jpeg', 'png'].indexOf(ext)
					},
					getExt = function (url) {
						var arr = url.split('.');
						return arr[arr.length - 1].toLowerCase()
					},
					getListIcon = function (list) {
						list.length && angular.forEach(list, function (item) {
							item.config && item.config.length && angular.forEach(item.config, function (data) {
								if (!this.url && isImg(getExt(data.url || data))) {
									this.url = data.url + '!square.150';
								};
							}, item);
							if(!item.url && item.content){
								var img = /<img[^>]+>/g.exec(item.content);
								img && (item.url = $(img[0])[0].src.replace("medium.640","square.150"));
							};
							item.url = item.url ? item.url : 'assets/img/school/news/p' + Math.ceil(Math.random() * 21) + '.jpg';
							item.style = {'background-image':'url('+ item.url +')'};
							item.content = item.content.replace(/<[^>]+>/g, "").replace("&nbsp", "");
							item.content = item.content.length > 46 ? item.content.slice(0, 46) + '...' : item.content;
						});
					};
					if(!module.hasAuth)data.classid = module.studentClassId || -1;
					if(data.classid in actionUpdate){
						isUpdate = true;
						delete actionUpdate[data.classid];
						sessionStorage.actionUpdate = JSON.stringify(actionUpdate);
					};
					if(module.isCache && module.cache.action['ac-' + data.classid] && !isUpdate){
						module.classNews = module.cache.action['ac-'+data.classid];
						getListIcon(module.classNews);
						return;
					}
				$api.yoClassNews.list(data, function (ret) {
					 module.classNews = ret.data.length
									  ? ret.data
									  : [];
					 var originalData = module.cache;
					originalData.action['ac-'+data.classid] = module.classNews;
					module.cache = originalData;
					getListIcon(module.classNews);
				}, function () { module.classNews = [] });

			},

			//classinfo -4
			function() {
				var module = this,
				    id = module.params.id || module.studentClassId;
					document.title="班级简介";
					document.body.style.background = 'white';
					if(module.isCache && module.cache.classinfo['ci-'+id ]){
						module.profile = module.cache.classinfo['ci-'+id ];
						module.profileCover = module.cache.classinfo['cip-'+id];
						return;
					}
					$api.yoClassProfile.get({
						classid:id
					},function(ret){
						ret = ret.data;
						module.profile = ret.content || { none:true, content: '- 暂无简介 -'};
						module.profileCover = ret.furl
							? ret.furl + '!medium.800'
							: '/assets/img/student/info-banner.jpg';
						var originalData = module.cache;
						originalData.classinfo['ci-'+ id] = module.profile;
						originalData.classinfo['cip-' + id] = module.profileCover;
						module.cache = originalData;
					});
			},

			//teacherlist -5
			function() {
				var module = this,
				id = module.params.id;
				if(module.isCache && module.cache.teacherlist['tl-'+id ]){
					module.teacherList = module.cache.teacherlist['tl-'+id ];
                    angular.forEach(module.teacherList,function(item){
                        item._avatar = item._avatar.replace(/!72$/g,'!128');
                    });
					return;
				}
				$api.schoolClassClassmaster.list({
					classid:id,
					_page:1,
					_pagesize:20,
					includeclassmaster:1,
					_relatedfields:'user.*'
				},function(ret){
					var teacherType = ["任课老师", "班主任", "副班主任", "代班主任"],
						noAvatar = '/assets/img/student/no-avatar1.png',
						teacherList = ret.data || [];
					angular.forEach( teacherList, function(teacher, _) {
                        teacher._type = teacherType[teacher.type] || '';
                        teacher.user = teacher.user || {};
                        teacher._avatar = teacher.user.avatar?teacher.user.avatar+'!128' : noAvatar;
                    });
					module.teacherList = teacherList;
					var originalData = module.cache;
					originalData.teacherlist['tl-'+ id] = module.teacherList;
					module.cache = originalData;
				});
			},

			//classalbum -6
			function() {
				var module = this,
				id = module.params.id;
				document.body.style.background = 'white';
				document.title = '班级相册';
				$api.yoClassalbum.list({
					_page:1,
					_pagesize:1000,
					classid:id || module.studentClassId
				},function(ret){
					ret = ret.data || [];
					var winWidth = window.innerWidth, width = Math.ceil((winWidth-60)/2);
					angular.forEach(ret, function(item, _){
                        item._cover = item.url?item.url+'!square.150':'/assets/img/public/no-cover-135.jpg';
                        item._width = width+'px';
                        item._name = item.name;
						item._skip = '/#/m/classindex/albumdetail/' + item.id
                    });
					module.classAlbumList = ret;
					module.require(14);
				});
			},

			//classalbumdetial -7
			function() {
				var module = this,
				id = module.params.id,
					deleteImg = function (num){
						angular.forEach(module.photoList,function(item,index){
							index == num && (num = item.id);
						});
						return $api.yoPhoto.delete({id:num}).$promise;
					};
				document.title = '班级相册';
				document.body.style.background = 'white';
				$api.yoPhoto.list({
					_page:1,
					_pagesize:1000,
					albumid:id
				},function(ret){
					ret = ret.data || [];
					var width = Math.floor((window.innerWidth-10*3)/2);
					angular.forEach(ret, function(photo, _){
	                    photo.thumbnail = photo.url + '!square.150';
	                    photo._width = width+'px';
	                });
					module.photoList = ret;
					//init images pre
					module.hasAuth && module.require(15);
					module.hasAuth && module.require(19);
				});
				module.showImg = function(index){
					$("#showPicture").modal("show");
                    module.photoList.index = index;
                    angular.forEach(module.photoList,function(item){
                        item.style = {
                            backgroundImage : 'url('+item.url+'!medium.640)',
                            height : window.innerHeight - 50
                        };
                    });
                    module.swiper && module.swiper.destroy(true,true);
                    module.photoList.length >= 1 && $timeout(function () {
                        //$(".swiper-container img").css("height", window.innerWidth * 0.53);
                        module.swiper = new Swiper('.swiper-container', {
                            autoplay: 0,
                            width:window.innerWidth,
                            lazyLoading:true,
                            initialSlide:index,
                            //loop:true,
                            onSlideChangeEnd: function(swiper){
                                //console.log(swiper);
                                $scope.$apply(function(){
                                    module.photoList.index =  swiper.activeIndex;
                                });
                            }
                        });
                    });
				};
				module.deleteActiveImg = function(ensure){
					if(ensure){
						deleteImg(module.swiper.activeIndex).then(function(){
							module.photoList.splice(module.swiper.activeIndex,1);
							module.swiper.removeSlide(module.swiper.activeIndex);
                            module.swiper.updateSlidesSize();
							!module.photoList.length && $("#showPicture").modal("hide");
                            module.photoList.index >= module.photoList.length && (module.photoList.index--);
						});
						module.delStatus = false;
					}else{
						module.delStatus = true;
					};
				};
			},

			//work -8
			function() {
				var module = this,
				id = module.params.id,
				noAvatar = '/assets/img/student/no-avatar1.png',
				data = {
					_page:1,
					_pagesize:8,
					classid:id || module.studentClassId,
					_relatedfields:'auther.id,auther.user',
					status:1
				};
				document.title = '学生作品';
				document.body.style.background = 'white';
				$api.yoFineArticle.list(data, function(ret){
					var extra = ret.extra;
					ret = ret.data || [];
					angular.forEach(ret, function(item, _){
                        var attachmentMap = classifyAttachment(item.config);
                        item.author = item.author || '匿名';
                        item._time = item.publishtime*1000;
                        item.auther = item.auther || {};
                        item.auther.user = item.auther.user || {};
                        /*item._photos = attachmentMap.photos;
						 item._videos = attachmentMap.videos;
						 item._audios = attachmentMap.audios;
						 item._others = attachmentMap.others.concat( attachmentMap.docs );
                        item.auther._avatar = item.auther.user.avatar?item.auther.user.avatar+'!128':noAvatar;*/
                    });
                    if(module.studentWorkList){
						module.studentWorkList = module.studentWorkList.concat(ret);
                    }else{
						module.studentWorkList = ret;
                    };
					tools.setListIcon(module.studentWorkList);
					//module.require(9);
					module.require(10, ret, $api.yoFineArticle.list, extra, data, 'studentWorkList', $('.student-work-list'));
					module.classid = data.classid;
					delete sessionStorage.studentList;
				});

			},

			//preview -9
			function() {
				imgPreview();
				play();
			},

			//loadData -10
			function () {
				var module = this,
					args = module.slice.call(arguments),
					noAvatar = '/assets/img/student/no-avatar1.png',
					oldData = args[0] || [],
					_list = args[1] || module.noop,
					extra = args[2],
					requestData = args[3],
					_name = args[4],
					elem = args[5];
				if(extra.pagesize<extra.total) {
					$timeout(function(){
						var $win = elem,
							sl = function(){
								if(this.scrollTop + this.clientHeight >= this.scrollHeight){
									 ++requestData._page;
									 _list(requestData, function(ret){
										ret = ret.data || [];
										'studentWorkList' === _name && angular.forEach(ret, function(item, _){
						                        var attachmentMap = classifyAttachment(item.config);
						                        item.author = item.author || '匿名';
						                        item._time = item.publishtime*1000;
						                        item.auther = item.auther || {};
						                        item.auther.user = item.auther.user || {};
						                        item._photos = attachmentMap.photos;
						                        item._videos = attachmentMap.videos;
						                        item._audios = attachmentMap.audios;
						                        item._others = attachmentMap.others.concat( attachmentMap.docs );
						                        item.auther._avatar = item.auther.user.avatar?item.auther.user.avatar+'!128':noAvatar;
						                    });
										oldData = oldData.concat(ret);
										module[_name] = oldData;
									 });
									if(requestData._page*extra.pagesize>=extra.total)$win.off('scroll', sl);
								}
							};

						$win.on('scroll', sl);

					});
				}
			},

			//star -11
			function() {
				var module = this,
				id = module.params.id,
				data = {
					_page:1,
					_pagesize:8,
					classid:id || module.studentClassId,
					_relatedfields:'student.id,student.name,publish.realname',
					status:1
				};;
				document.title = '班级明星';
				document.body.style.background = 'white';
				$api.yoClassStar.list(data, function(ret){
					var extra = ret.extra;
					ret = ret.data || [];
					module.starList = ret;
					module.require(10, ret, $api.yoClassStar.list, extra, data, 'starList', $('.class-star-list'));
				});
				module.classid = data.classid;
				delete sessionStorage.studentList;
			},

			//workdetail -12
			function (argument) {
				var module = this,
					getExt = function (url) {
						var arr = url.split('.');
						return arr[arr.length - 1].toLowerCase()
					},
					exts = {
						'7z': 'rar',
						doc: 'doc',
						docx: 'doc',
						html: 'html',
						mp3: 'mp3',
						wav:'mp3',
						mp4: 'mp4',
						pdf: 'pdf',
						ppt: 'ppt',
						pptx: 'ppt',
						rar: 'rar',
						txt: 'txt',
						wps: 'wps',
						xls: 'xls',
						xlsx: 'xls',
						zip: 'rar'
					},
					isImg = function (ext) {
						return !!~['bmp', 'gif', 'jpg', 'jpeg', 'png'].indexOf(ext)
					},
					id = module.params.id,
					noAvatar = '/assets/img/student/no-avatar1.png';
				document.title = '学生作品';
				$api.yoFineArticle.get({
					_relatedfields:'auther.id,auther.user',
					id:id
				},function (ret) {
					ret = ret.data || [];
					var attachmentMap = classifyAttachment(ret.config),
						$width = $('.workdetail').width();
					ret.author = ret.author || '匿名';
					ret.auther = ret.auther || {};
					ret.auther.user = ret.auther.user || {};
					ret._photos = attachmentMap.photos;
					/*ret._videos = attachmentMap.videos;
					ret._audios = attachmentMap.audios;*/
					/*ret._others = attachmentMap.others.concat( attachmentMap.docs );*/
					ret._width = {'max-width':$width-30,'margin':'0 auto'};
					ret.auther._avatar = ret.auther.user.avatar?ret.auther.user.avatar+'!72':noAvatar;
					module.studentwork = ret;
					$scope.content = $sce.trustAsHtml(module.studentwork.content);
					module.studentwork.config && module.studentwork.config.length &&  angular.forEach(module.studentwork.config, function (item) {
						item.fileType=exts[getExt(item.url)];
						if(item.fileType=='mp3'){item.playing=false;}
						!item.type &&  isImg(getExt(item.url)) ? (item.type = 2):(item.type=1);
						if(item.type == 1){
							module.studentwork.hasAttachment = true;
							item.icon = '/assets/img/attachment/' + (exts[getExt(item.url)] || 'unknow') + '.jpg'
						}
					});
					$('.student-work-tips').show();
					module.require(9);
				});
				$scope.playAudio= function (data) {
					var player=document.getElementById(data.url);
					!player.src && (player.src=data.url);
					if(!data.playing){
						player.play();
						data.playing=true;
					}else{
						player.pause();
						data.playing=false;
					}
				};
				$scope.showMedia = function(data){
					data[data.fileType] = true;
					module.str ='video'+ Math.round(Math.random()*1000);
					document.getElementById("source"+data.name).src=data.url;
					$timeout(function(){
						videojs.options.flash.swf = "/assets/js/plugins/videoJs/5.4.5/video-js.swf";
						var myPlayer = videojs(module.str);
						myPlayer.ready(function(){
							myPlayer.play();
						});
					});

				};
			},

			//cache -13
			function () {
				var module = this,
					originalData = module.cache,
					cacheData = module.slice.call(arguments)[0],
					currentKey = Object.keys(cacheData)[0];
				originalData[currentKey] = cacheData[currentKey];
				module.cache = originalData;
			},

			//delete album -14
			function () {
				var module = this,
					id = module.params.id,
					permissionMsg = '无权限操作',
					$popWindow = $('#addAlbum'),
					realData = angular.copy(module.classAlbumList),
					_permission = function(type){
						var deferred = $q.defer();
						$api.authitem.check({authcodes: 'yo.classhome.classalbum.'+ type},function(ret){
							ret = !!ret.data.hasauth || false;
							if(ret)deferred.resolve();
							if(!ret)deferred.reject();
						});
						return deferred.promise;
					},
					da = function(event){
						if(!module.classAlbumList.length){
							return;
						}
						_permission('D').then(function(){
							realHandler();
						},function(){
							mNotice(permissionMsg, 'error');
						});
						event.stopPropagation();
					},
					cd = function(){
                        angular.forEach(module.classAlbumList,function(data){
                            data.checked = false;
                        },module.viewDeleteBtn=[]);
						$('.album').find('.album-selector')[0]['className'] = 'album-selector';
						module.bottomBar = module.deleteAlbumAuth =  null;
						module.classAlbumList = [];
						realData.forEach(function(val, ind){
							val._skip = '/#/m/classindex/albumdetail/' + val.id;
						});
						module.classAlbumList = realData;
					},
					sdo = function(item){
                        item.checked = !item.checked;
                        angular.forEach(module.classAlbumList,function(data){
                            data.checked && this.push(data.id);
                        },module.viewDeleteBtn=[]);
					},
					ed = function() {
						var cfm = confirm('确定删除'),
							len = module.viewDeleteBtn.length;
						if(cfm && len){
							$api.yoAlbum.delete({
								id:module.viewDeleteBtn.toString()
							},function(ret){
								if(ret.name && 'API_OK' === ret.name){
									window.location.reload();
								}
							});
						}
					},
					ca = function(){
						var isExist = module.newAlbumName.trim();
						module.tocreated = true;
						if(!!isExist){
							 var name = isExist,
								 data = {
									name:name,
									classid:id,
									accesstype:1
								 };
							_permission('C').then(function(){
								$api.yoClassalbum.create(data, function(ret){
									 ret = ret.data && ret.data.id;
									 ret
									 ? $location.url('/m/classindex/albumdetail/'+ret)
									 : window.location.reload();
									module.tocreated = false;
								});
							},function(){
								mNotice(permissionMsg, 'error');
							});
						}else{
							$popWindow.modal('hide');
							module.tocreated = false;
						}
					};

				$popWindow.on('show.bs.modal', function () {
					$timeout(function () {
						module.newAlbumName = '';
					});
				})


				function realHandler(){
					module.deleteAlbumAuth = true;
					module.bottomBar = true;
					module.classAlbumList.forEach(function(val, ind){
						val._skip = 'javascript:;';
					});
				}

				module.deleteAlbum = da;
				module.cancelDelete = cd;
				module.selectDeleteObject = sdo;
				module.executeDelete = ed;
				module.createAlbum = ca;
			},

			//deleteAlbumdetial -15
			function() {
				var module = this,
					id = module.params.id,
				    $popWindow = $('#editAlbum'),
					permissionMsg = '无权限操作',
					realData = angular.copy(module.photoList),
					_findIndex = function(id){
						return tempSelectImgCollections.indexOf(id);
					},
					_permission = function(type){
						var deferred = $q.defer();
						$api.authitem.check({authcodes: 'yo.classhome.classalbum.'+ type},function(ret){
							ret = !!ret.data.hasauth || false;
							if(ret)deferred.resolve();
							if(!ret)deferred.reject();
						},function(ret){
                            deferred.reject();
                        });
						return deferred.promise;
					},
					tm = function(){
						var modulenu = $('.menu-operate'),
							hasMenu = modulenu.hasClass('hide');
							module.photoList.length
							? $('ul.menu-operate')[0].removeAttribute('style')
							: $('ul.menu-operate').css('top','-37px');
							hasMenu
							? modulenu.removeClass('hide')
							: modulenu.addClass('hide');
					},
					sd = function(){
						if(!module.photoList.length){
							tm();
							return;
						};
						var $warpItems = $('.class-photo-list > .class-photo-item');
						tm();
						_permission('D').then(function(){
							module.deleteImgAuth = true;
							module.bottomImgBar = true;
							$warpItems.removeAttr('data-role');
						},function(){
							mNotice(permissionMsg, 'error');
						});
					},
					sdio = function(item){
						item.checked = !item.checked;
						angular.forEach(module.photoList,function(data){
							data.checked && this.push(data.id);
						},module.viewDeleteBtnDetial=[]);
					},
					cdi = function(){
						var $warpItems = $('.class-photo-list > .class-photo-item');
						$('.albumdetail').find('.photo-selector').removeClass('active');
                        angular.forEach(module.photoList,function(data){
                            data.checked = false;
                        },module.viewDeleteBtnDetial=[]);
						$warpItems.attr('data-role','photoItem');
						module.deleteImgAuth =  null;
						module.bottomImgBar = false;
					},
					madn = function(e){
						module.tomodified = true;
						_permission('U').then(function(){
							var isExist = module.albumdetailName.trim();
							if(!!isExist){
								 var name = isExist,
									 data = {
										id:id,
										name:name,
										accesstype:1
									 };
									$api.yoAlbum.update(data,function(ret){
										ret = ret.name;
										if(ret && 'API_OK' === ret){
											$popWindow.modal('hide');
											mNotice('更新成功', 'error');
											module.tomodified = false;
										};
									})

							}else {
								module.tomodified = false;
							}
						},function(){
							mNotice(permissionMsg, 'error');
						});
					},
					eid = function() {
						var cfm = confirm('确定删除'),
							len = module.viewDeleteBtnDetial.length;
						if(cfm && len){
							var data = {
								id: module.viewDeleteBtnDetial.toString()
							 };
							$api.yoPhoto.delete(data, function(ret){
								ret = ret.name;
								if(ret && 'API_OK' === ret){
									$popWindow.modal('hide');
									mNotice('删除成功', 'error');
									window.location.reload();
								};
							});
						}
					}

				$popWindow.on('show.bs.modal', function () {
					tm();
					$api.yoAlbum.get({id:id},function(ret){
						ret = ret && ret.data.name || '';
						$timeout(function(){
							module.albumdetailName = ret;
						});
					});
				});

				module.toggleMenu = tm;
				module.startDelete = sd;
				module.selectDeleteImgObject = sdio;
				module.cancelDeleteImg = cdi;
				module.modifiedAlbumDetailName = madn;
				module.executeImgDelete = eid;
			},

			//publishwork -16
			function() {
				var module = this,
					id = module.params.id,
					_permission = function(type){
						var deferred = $q.defer();
						$api.authitem.check({authcodes: 'yo.classhome.finearticle.'+ type},function(ret){
							ret = !!ret.data.hasauth || false;
							if(ret)deferred.resolve();
							if(!ret)deferred.reject();
						});
						return deferred.promise;
					},
					requestHandler = function(ret){
						var data = {
							id: ret.data.id,
							classes : module.classid
						},success = function (){
							'API_OK' === ret.name && window.history.back();
						};
						if(module.isBusiness){
							module.wxSend ? wxsend(data).finally(success):success();
						}else{
							success();
						}
						//success();
					},
					send = function(){
						var attachments = [],
							data = {
								name:module.studentName,
								title:module.workTitle,
								content:module.workContent,
								author: module.studentName,
								status:1,
								classid:id,
								type:1
							};

						if(!data.title){
							mNotice('请填写标题', 'error');
							return;
						}

						if(!data.content){
							mNotice('请填写内容', 'error');
							return;
						}

						if(module.imglist.length){
							var eachBody = function(val, key){
								attachments[key] = {
									'name' : module.names[key],
									'url' : val
								}
							}
							module.imglist.forEach(eachBody);
						}


						_permission('C').then(function(){
							data.config = attachments;
							$api.yoFineArticle.create(data, requestHandler);
						});

					},
					wxsend = function (item){
						return $api.wx.push({
							key: 'STUDENTWORK',
							src: 'WEIXIN',
							msgtype: 'WX_CLS_STUWORK',
							id: item.id,
							objects: { classstudents: item.classes }
						}).$promise;
					},
					uploadSettings = function(){

						module.imglist = [];

						module.names = [];

						module.imghashlist = [];

						//定义对象
						return {

							//装载上传对象，用于页面显示
							queued: {},
							list: [],
							//删除文件
							remove: function (file) {
								delete this.queued[file.id];
								this.list.splice(this.list.indexOf(file.id), 1);
								module.imglist.splice(module.imglist.indexOf(file.url), 1);
								module.names.splice(module.names.indexOf(file.name), 1);
								module.imghashlist.splice(module.imghashlist.indexOf(file.urlhash), 1);
								//若this.WebUploader对象存在，则从队列中删除相关文件
								this.WebUploader && this.WebUploader.removeFile(file.id);
							},
							//以下配置针对WebUploader插件有效
							//定义配置
							options: {
								pick: {
									multiple: true,
									//设置上传仓库
									configkey: 'default_pic'
								},
								fileNumLimit: 9,
								fileSingleSizeLimit: 10 * 1024 * 1024,
								thumb: {
									width: 58,
									height: 58
								}
							},
							//指令事件
							events: {
								startUpload: function () {
									module.photo.uploading = true;
								},
								uploadFinished: function () {
									module.photo.uploading = false;
								},
								fileQueued: function (file) {

									module.photo.list.push(file.id);
									module.photo.queued[file.id] = {
										id: file.id,
										ready: true
									};

									this.makeThumb(file, function (error, ret) {
										$timeout(function () {
											if (error) {
												module.photo.queued[file.id].name = file.name;
											} else {
												module.photo.queued[file.id].src = ret;
											}
										})
									});

								},
								uploadStart: function (file) {
									delete module.photo.queued[file.id].ready;
									module.photo.queued[file.id].progress = '0%';
								},
								uploadProgress: function (file, progress) {
									module.photo.queued[file.id].progress = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
								},
								uploadSuccess: function (file, result) {
									if (file.url) {
										module.photo.queued[file.id].progress = '100%';
										module.photo.queued[file.id].url = file.url;
										module.photo.queued[file.id].urlhash = file.urlhash;
										module.imglist.push(file.url);
										module.imghashlist.push(file.urlhash);
										module.names.push(file.name);
									}
								},
								uploadError: function (file) {
									mNotice('上传失败', 'error');
									module.photo.queued[file.id].error = true;
								},
								uploadComplete: function (file) {
									delete module.photo.queued[file.id].progress;
								}
							}

						};

			        },
					previewPicture = function (imgData) {
	                    var clientHeight = $(window).height() - 103,
	                        clientWidth = $(window).width() - 50,
	                        cssObj = null;

	                    if (imgData.ready || imgData.progress) return;

	                    if (imgData.error) {

	                        cssObj = {
	                            'max-width': '95px'
	                        }

	                        imgData.url = '/assets/img/upload/loser.png';

	                        $('#previewPictureModal').css({
	                            background: '#000',
	                            opacity: '.9'
	                        });

	                    } else {
	                        cssObj = {
	                            'max-width': clientWidth,
	                            'max-height': clientHeight
	                        }
	                    }

	                    $('#previewPictureModal').modal('show');

	                    if (!/assets/.test(imgData.url)) {

	                        var img = document.createElement('img'),
	                            wrap = $('#previewPictureModal').find('.modal-body')[0];


	                        $('#previewPictureModal').find('.modal-body').children(0).css('display', 'block');

	                        img.addEventListener('load', function () {
	                            wrap.children[0].style.cssText = 'display:none;';
	                            wrap.children[1].style.cssText = 'display:block;';
	                            $('#previewPictureModal').find('.modal-body').children(1).css(cssObj);
	                        });


	                        img.style.display = 'none';

	                        if (wrap.children[1]) {
	                            wrap.replaceChild(img, wrap.children[1]);
	                        } else {
	                            wrap.appendChild(img);
	                        }

	                        img.src = imgData.url;

	                    } else {

	                        var img = document.createElement('img'),
	                            wrap = $('#previewPictureModal').find('.modal-body')[0];

	                        $('#previewPictureModal').find('.modal-body').children(0).css('display', 'none');

	                        if (wrap.children[1]) {
	                            wrap.replaceChild(img, wrap.children[1]);
	                        } else {
	                            wrap.appendChild(img);
	                        }

	                        img.src = imgData.url;

	                    }

	                    $('#previewPictureModal').find('.modal-body').children(1).css(cssObj);

	                    module.previewData = imgData;

	                },

	                //删除
	                removePicture = function () {
	                    module.photo.remove(module.previewData);
	                };
				module.require(20);
				document.body.style.background = module.color;
				module.classid = id || module.studentClassId;
				module.wxSend = true ;
				module.studentName = sessionStorage.studentList
									 ? JSON.parse(sessionStorage.studentList)[1]
									 : '';
				module.publishWork = send;
				module.photo = uploadSettings();
				module.previewPicture = previewPicture;
				module.removePicture = removePicture;
			},

			//selectstudent -17
			function() {
				var module = this,
					id = module.params.id;
					$api.schoolClassStudent.list({
						classid:id,
						_pagesize:100,
						_fields:'id,name'
					},function(ret){
						ret = ret.data || [];
						if(!ret.length){
							mNotice('无学生信息', 'error');
							window.history.back();
						}
						module.selectStudentList = ret;
					})
					module.toggleSelectStudent = function(id, name){
						var args = module.slice.call(arguments);
						sessionStorage.studentList = JSON.stringify(args);
						window.history.back();
					}
			},

			//publish star -18
			function() {
				var module = this,
					id = module.params.id,
					send = function(){
						var attachments = [],
							data = {
								reason:module.starContent,
								status:1
							},
							_permission = function(type){
								var deferred = $q.defer();
								$api.authitem.check({authcodes: 'yo.classhome.classstar.'+ type},function(ret){
									ret = !!ret.data.hasauth || false;
									if(ret)deferred.resolve();
									if(!ret)deferred.reject();
								});
								return deferred.promise;
							},
							requestHandler = function(ret){
								//'API_OK' === ret.name && window.history.back();
								var data = {
									id: ret.data.id,
									classes : module.classid
								},success = function (){
									'API_OK' === ret.name && window.history.back();
								};
								if(module.isBusiness){
									module.wxSend ? wxsend(data).finally(success):success();
								}else{
									success();
								}
							};

						try{
							data.studentid = JSON.parse(sessionStorage.studentList)[0];
						}catch(e){
							mNotice('请选择学生', 'error');
							return;
						}

						if(!data.reason){
							mNotice('请填写入选理由', 'error');
							return;
						}
						_permission('C').then(function(){
							$api.yoClassStar.create(data, requestHandler);
						});

					},wxsend = function (item){
						return $api.wx.push({
							key: 'CLASSSTAR',
							src: 'WEIXIN',
							msgtype: 'WX_CLS_STAR',
							id: item.id,
							objects: { classstudents: item.classes }
						}).$promise;
					};

					module.require(20);
					module.studentName = sessionStorage.studentList
										 ? JSON.parse(sessionStorage.studentList)[1]
										 : '';
					module.classid = id || module.studentClassId;
					module.wxSend = true;
					module.publishStar = send;
			},

			//classalbumdetail upload -19
			function() {
				var module = this,
					id = module.params.id;
					function savePhotos(urlhash) {
		                return $api.yoPhoto.create({
		                    autotips:false,
		                    automask:false,
		                    albumid: id,
		                    urlhash: urlhash
		                }, function (result) {
		                    angular.forEach(module.photoList, function (item) {
		                        if (item.urlhash === urlhash) {
		                            item.id = result.data.id
		                        }
		                        this.push(item)
		                    }, module.photoList = []);
		                }, function (result) {
		                    $timeout(function () {
								var tempArr = module.photoList.filter(function(item){
									return item.urlhash !== urlhash;
								});
								var repeatArr = module.photoList.filter(function(item){
									return item.urlhash == urlhash;
								});
								repeatArr.length > 1
									? module.photoList = repeatArr.slice(1).concat(tempArr)
									: module.photoList = tempArr
		                    }, 1000);
		                }).$promise
		            }

					// 绑定照片上传
		            (function bindPhotoUploader() {

		                var thumbWidth = Math.floor((window.innerWidth-10*3)/2),
		                    isInProgress = false,
		                    saveQueued = [];

		                module.detailUploadPhoto = {
		                    //定义配置
		                    options: {
		                        pick: {
		                            multiple: true,
		                            configkey: 'school_classalbum'
		                        },
		                        fileNumLimit: undefined,
		                        thumb: {
		                            width: thumbWidth,
		                            height: thumbWidth
		                        },
		                        compress: {
		                            width: 1600,
		                            height: 1600,
		                        }
		                    },
		                    //指令事件
		                    events: {
		                        fileQueued: function (file) {
		                            if (isInProgress) {
		                                mNotice('请等待上传完成后操作', 'error');
		                                return false
		                            }
		                            file.statusText = '上传';
		                            this.makeThumb(file, function (error, ret) {
		                                $timeout(function () {
		                                    if (error) {
		                                        file.thumbnail = '/assets/img/public/no-cover-135.jpg';
		                                    } else {
		                                        file.thumbnail = ret;
		                                    }
		                                    module.photoList.unshift(file);
		                                })
		                            })
		                        },
		                        startUpload: function () {
									if(!$('.menu-operate').hasClass('hide')){
										$('.menu-operate').addClass('hide');
									};
		                            isInProgress = true;
		                            mLoading.show('正在上传');
		                        },
		                        uploadProgress: function (file, progress) {
		                            progress = Math.max(0, Math.min(100, parseInt(progress * 100))) + '%';
		                            if (progress === '100%') {
		                                file.statusText = '正在保存';
		                            } else {
		                                file.statusText = progress;
		                            }
		                        },
		                        uploadSuccess: function (file, result) {
		                            file.status = 'success';
		                            file.statusText = '成功';
		                            file.urlhash && saveQueued.push(file.urlhash);
		                        },
		                        uploadError: function (file) {
		                            file.status = 'error';
		                            file.statusText = '失败';
		                            mNotice('上传失败', 'error');
		                            file.filehash && $timeout(function () {
		                                angular.forEach(module.photoList, function (item) {
		                                    if (item.filehash != file.filehash) {
		                                        this.push(item)
		                                    }
		                                }, module.photoList = []);
		                            }, 2000);
		                        },
		                        uploadFinished: function () {
		                            isInProgress = false;
		                            mLoading.show('正在保存');
		                            angular.forEach(saveQueued, function (hash) {
										this.push(savePhotos(hash))
									}, saveQueued = []);
		                            $q.all(saveQueued).then(function () {
		                                saveQueued = [];
		                                mLoading.hide();
		                            },function(){
										saveQueued = [];
		                                mLoading.hide();
			                            // mNotice('相册相片可能重复', 'error');
									});
		                        },
		                        error: function (type) {
		                            isInProgress = false;
		                            if ('ERROR_TOKEN_GET' === type) {
		                                mNotice('服务器出错了', 'error');
		                                mLoading.hide();
		                                this.reset();
		                            }
		                        }
		                    }
		                };

		            }());

			},

			//ios no shadow -20
			function() {
				var module = this;
				if(!module.isIphone)return;
				$timeout(function(){
					$('.publishwork').find('input,textarea').addClass('noshadow');
				});
			},
			//get business -21
			function(){
				var module = this;
				$api.yoBusiness.allow({},function(result){
					module.isBusiness  = result.data || {};
					module.isBusiness = module.isBusiness.isallow == 'true'?true:false;
				});
			}
		], this);



	}]);

})(angular.module('m.classindex', []));
