;
(function () {

    /* 方法集合 */
    var app = this,

        mDialogTpl = [
            '<div class="m-dialog" style="">',
            '<div class="m-content">',
            '<div class="m-txt"></div>',
            '</div>',
            '<div class="m-footer">',
            '<button class="m-btn" data-role="ok"></button>',
            '<button class="m-btn" data-role="cancel"></button>',
            '</div>' +
            '</div>'
        ].join(""),

        utils = {

            mNotice: function (message, iconType, timeout) {

                var ctx = this,
                    message = message || '',
                    iconType = iconType || 'info',
                    tmpl = '<div class="mNotice">' + '<i class="' + iconType + '"></i>' + '<span>' + message + '</span>' + '</div>',
                    timeout,
                    ntc;

                if ('error' === iconType) {
                    ctx.hint(message);
                    return;
                }

                if ('success' === iconType) {
                    timeout = timeout ? timeout : 800;
                } else {
                    timeout = timeout ? timeout : 3000;
                }

                ntc = $(tmpl).appendTo($('body'));
                ctx.centerElement(ntc);
                setTimeout(function () {
                    ntc.remove();
                }, timeout);

                return ntc;

            },
            hint: function (message, callback) {
                var opts = {
                    dialogClass: 'm-alert-dialog',
                    content: message,
                    ok: callback,
                    okClass: 'm-btn-danger m-one-btn',
                    btnCancel: false
                };
                this.dialog(opts);
            },
            dialog: function (options) {
                var ctx = this;
                setTimeout(function () {
                    ctx._dialog(options);
                }, 5)
            },
            _dialog: function (options) {
                var opts = options || {},
                    timeStamp = new Date().valueOf(),
                    dialogClass = opts.dialogClass || '',
                    autoClose = opts.autoClose || false,
                    dId = opts.id || 'm_dialog_' + timeStamp,
                    maskId = 'm_modal_' + timeStamp,
                    modal = (opts.modal === false) ? false : true,
                    btnOk = (opts.btnOk === false) ? false : true,
                    btnCancel = (opts.btnCancel === false) ? false : true,
                    okText = opts.okText || '确认',
                    cancelText = opts.cancelText || '取消',
                    okClass = opts.okClass || 'm-btn-success',
                    cancelClass = opts.cancelClass || '',
                    content = opts.content || '',
                    $body = $('body'),
                    $dialog, $ok, $cancel;

                $('.m-dialog-modal, .m-dialog').remove();

                if (modal) {
                    $('<div class="m-modal m-dialog-modal" id="' + maskId + '"></div>').appendTo($body);
                }
                $dialog = $(mDialogTpl).appendTo($body);
                $dialog.addClass(dialogClass).attr('id', dId);
                $dialog.find('.m-txt').html(content);
                $ok = $dialog.find('[data-role="ok"]');
                $cancel = $dialog.find('[data-role="cancel"]');

                if (btnOk) {
                    $ok.text(okText);
                    okClass && $ok.addClass(okClass);
                    $ok.bind('click', function () {
                        opts.ok && opts.ok();
                        $('.m-dialog-modal, .m-dialog').remove();
                    });
                } else {
                    $ok.remove();
                }

                if (btnCancel) {
                    $cancel.text(cancelText);
                    cancelClass && $cancel.addClass(cancelClass);
                    $cancel.bind('click', function () {
                        opts.cancel && opts.cancel();
                        $('.m-dialog-modal, .m-dialog').remove();
                    });
                } else {
                    $cancel.remove();
                }

                if (!btnOk && !btnCancel) {
                    $dialog.find('.m-footer').remove();
                }


                var clientWidth = jQuery(window).width();
                var clientHeight = jQuery(window).height();
                var dialogLeft = (clientWidth - $dialog.outerWidth()) / 2;
                var dialogTop = (clientHeight - $dialog.height()) * 0.382;
                // position left
                dialogLeft = opts.left || dialogLeft;
                // position top
                dialogTop = opts.top || dialogTop;

                $dialog.css({
                    "top": dialogTop + "px",
                    "left": dialogLeft + "px"
                });

                // 自动关闭弹窗
                if (autoClose) {

                    autoClose = autoClose > 1 ? autoClose : 1000;
                    setTimeout(function () {
                        jQuery('#' + dId).fadeOut('slow', function () {
                            jQuery('#' + maskId).hide();
                            jQuery('#' + maskId).remove();
                            jQuery('#' + dId).hide();
                            jQuery('#' + dId).remove();
                            // close callback
                            if (typeof opts.closeCallback == 'function') {
                                opts.closeCallback();
                            }
                        });
                    }, autoClose);
                }

            },
            centerElement: function (el, width, height) {
                var ctx = this,
                    win = ctx.getClient(),
                    winHeight = win.h,
                    winWidth = win.w,
                    element = el.jquery ? el[0] : el,
                    _width = width || element.offsetWidth,
                    height = height || element.offsetHeight,
                    top, left;

                left = Math.floor((winWidth - _width) * 0.5);

                if (width) {
                    element.style.width = width + 'px';
                }
                element.style.position = 'fixed';
                element.style.left = left + 'px';

                top = Math.floor((winHeight - height) * 0.45);
                element.style.top = top + 'px';
            },
            getClient: function (e) {
                var w, h;
                if (e) {
                    w = e.clientWidth;
                    h = e.clientHeight;
                } else {
                    w = (window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : document.body.offsetWidth;
                    h = (window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : document.body.offsetHeight;
                }
                return {
                    w: w,
                    h: h
                };
            },
            // 获取文件后缀
            getFileExt: function (name) {
                var name = name || '',
                    ext = '',
                    arr = name.split('.');

                ext = arr[arr.length - 1];

                return ext.toLowerCase();
            },
            imageView: function () {

                ! function ($) {
                    var touch = {},
                        touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
                        longTapDelay = 750,
                        gesture

                    function swipeDirection(x1, x2, y1, y2) {
                        return Math.abs(x1 - x2) >=
                            Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
                    }

                    function longTap() {
                        longTapTimeout = null
                        if (touch.last) {
                            touch.el.trigger('longTap')
                            touch = {}
                        }
                    }

                    function cancelLongTap() {
                        if (longTapTimeout) clearTimeout(longTapTimeout)
                        longTapTimeout = null
                    }

                    function cancelAll() {
                        if (touchTimeout) clearTimeout(touchTimeout)
                        if (tapTimeout) clearTimeout(tapTimeout)
                        if (swipeTimeout) clearTimeout(swipeTimeout)
                        if (longTapTimeout) clearTimeout(longTapTimeout)
                        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
                        touch = {}
                    }

                    function isPrimaryTouch(event) {
                        return (event.pointerType == 'touch' ||
                            event.pointerType == event.MSPOINTER_TYPE_TOUCH) && event.isPrimary
                    }

                    function isPointerEventType(e, type) {
                        return (e.type == 'pointer' + type ||
                            e.type.toLowerCase() == 'mspointer' + type)
                    }

                    $(document).ready(function () {
                        var now, delta, deltaX = 0,
                            deltaY = 0,
                            firstTouch, _isPointerType

                        if ('MSGesture' in window) {
                            gesture = new MSGesture()
                            gesture.target = document.body
                        }

                        $(document)
                            .bind('MSGestureEnd', function (e) {
                                var swipeDirectionFromVelocity =
                                    e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
                                if (swipeDirectionFromVelocity) {
                                    touch.el.trigger('swipe')
                                    touch.el.trigger('swipe' + swipeDirectionFromVelocity)
                                }
                            })
                            .on('touchstart MSPointerDown pointerdown', function (e) {
                                if ((_isPointerType = isPointerEventType(e, 'down')) &&
                                    !isPrimaryTouch(e)) return
                                firstTouch = _isPointerType ? e : e.originalEvent.touches[0]
                                if (e.originalEvent.touches && e.originalEvent.touches.length === 1 && touch.x2) {
                                    // Clear out touch movement data if we have it sticking around
                                    // This can occur if touchcancel doesn't fire due to preventDefault, etc.
                                    touch.x2 = undefined
                                    touch.y2 = undefined
                                }
                                now = Date.now()
                                delta = now - (touch.last || now)
                                touch.el = $('tagName' in firstTouch.target ?
                                    firstTouch.target : firstTouch.target.parentNode)
                                touchTimeout && clearTimeout(touchTimeout)
                                touch.x1 = firstTouch.pageX
                                touch.y1 = firstTouch.pageY
                                if (delta > 0 && delta <= 250) touch.isDoubleTap = true
                                touch.last = now
                                longTapTimeout = setTimeout(longTap, longTapDelay)
                                // adds the current touch contact for IE gesture recognition
                                if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
                            })
                            .on('touchmove MSPointerMove pointermove', function (e) {
                                if ((_isPointerType = isPointerEventType(e, 'move')) &&
                                    !isPrimaryTouch(e)) return
                                firstTouch = _isPointerType ? e : e.originalEvent.touches[0]
                                cancelLongTap()
                                touch.x2 = firstTouch.pageX
                                touch.y2 = firstTouch.pageY

                                deltaX += Math.abs(touch.x1 - touch.x2)
                                deltaY += Math.abs(touch.y1 - touch.y2)
                            })
                            .on('touchend MSPointerUp pointerup', function (e) {
                                if ((_isPointerType = isPointerEventType(e, 'up')) &&
                                    !isPrimaryTouch(e)) return
                                cancelLongTap()

                                // swipe
                                if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                                    (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

                                    swipeTimeout = setTimeout(function () {
                                        touch.el.trigger('swipe')
                                        touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
                                        touch = {}
                                    }, 0)

                                    // normal tap
                                else if ('last' in touch)
                                    // don't fire tap when delta position changed by more than 30 pixels,
                                    // for instance when moving to a point and back to origin
                                    if (deltaX < 30 && deltaY < 30) {
                                        // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
                                        // ('tap' fires before 'scroll')
                                        tapTimeout = setTimeout(function () {

                                            // trigger universal 'tap' with the option to cancelTouch()
                                            // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                                            var event = $.Event('tap')
                                            event.cancelTouch = cancelAll
                                            touch.el.trigger(event)

                                            // trigger double tap immediately
                                            if (touch.isDoubleTap) {
                                                if (touch.el) touch.el.trigger('doubleTap')
                                                touch = {}
                                            }

                                                // trigger single tap after 250ms of inactivity
                                            else {
                                                touchTimeout = setTimeout(function () {
                                                    touchTimeout = null
                                                    if (touch.el) touch.el.trigger('singleTap')
                                                    touch = {}
                                                }, 250)
                                            }
                                        }, 0)
                                    } else {
                                        touch = {}
                                    }
                                deltaX = deltaY = 0

                            })
                            // when the browser window loses focus,
                            // for example when a modal dialog is shown,
                            // cancel all ongoing events
                            .on('touchcancel MSPointerCancel pointercancel', cancelAll)

                        // scrolling the window indicates intention of the user
                        // to scroll, not tap or swipe, so cancel all ongoing events
                        $(window).on('scroll', cancelAll)
                    })

                    ;
                    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
                        'doubleTap', 'tap', 'singleTap', 'longTap'
                    ].forEach(function (eventName) {
                        $.fn[eventName] = function (callback) {
                            return this.on(eventName, callback)
                        }
                    })
                }(window.jQuery);


                $.os = $.os || {};
                var tmpl = function (data) {

                    var __p = [],
                        _p = function (s) {
                            __p.push(s)
                        };

                    __p.push('<ul class="pv-inner" style="line-height:');
                    _p(data.height);
                    __p.push('px;">');
                    for (var i = 0; i < data.photos.length; i++) {
                        __p.push('<li class="pv-img" style="width:');
                        _p(data.width);
                        __p.push('px;height:');
                        _p(data.height);
                        __p.push('px;"></li>');
                    }
                    __p.push(
                        '</ul>    <span class="ui-loading white" id="J_loading"><div class="loadInco"><span class="blockG" id="rotateG_01"></span><span class="blockG" id="rotateG_02"></span><span class="blockG" id="rotateG_03"></span><span class="blockG" id="rotateG_04"></span><span class="blockG" id="rotateG_05"></span><span class="blockG" id="rotateG_06"></span><span class="blockG" id="rotateG_07"></span><span class="blockG" id="rotateG_08"></span></div></span><p class="counts"><span class="value" id="J_index">');
                    _p(data.index + 1);
                    __p.push('/');
                    _p(data.photos.length);
                    __p.push('</span></p>');

                    return __p.join("");
                };
                var ImageView = {
                    photos: null,
                    index: 0,
                    el: null,
                    config: null,
                    lastContainerScroll: 0,
                    zoom: 1,
                    advancedSupport: false,
                    lastTapDate: 0,
                    init: function (photos, index, config) {
                        var self = this;
                        index = +index || 0;
                        this.config = $.extend({
                            fade: true
                        }, config);

                        this.lastContainerScroll = document.body.scrollTop;
                        // if mobile is iphone or android
                        if ($.os.iphone || ($.os.android && parseFloat($.os.version) >= 4.0)) {
                            this.advancedSupport = true;
                        }

                        //rebuild photos array based on global count ????for what
                        if (this.config.count) {
                            this.photos = new Array(this.config.count);
                            var len = photos.length,
                                start = this.config.idx_space || 0;
                            for (var i = start; i < start + len; i++) {
                                this.photos[i] = photos[i - start];
                            }
                            this.index = start + index;
                        } else {
                            this.photos = photos || [];
                            this.index = index || 0;
                        }

                        //do size calculation in next tick, leave time to browser for any size related changes to take place.
                        setTimeout(function () {
                            self.clearStatus();
                            self.render(true);
                            self.bind();
                            self.changeIndex(self.index, true);
                        }, 0);
                    },

                    //reset sizes.
                    clearStatus: function () {
                        this.width = Math.max(window.innerWidth, document.body.clientWidth); //android compatibility
                        this.height = window.innerHeight;
                        this.zoom = 1;
                        this.zoomX = 0;
                        this.zoomY = 0;
                    },
                    render: function (first) {
                        if (first) {
                            $('<div id="imageView" class="slide-view" style="display:none;">').appendTo($('body'));
                        }

                        this.el = $('#imageView');
                        this.el.html(tmpl({
                            photos: this.photos,
                            index: this.index,
                            width: this.width,
                            height: this.height
                        }));
                        //window.scrollY+'px'
                        if (first) {
                            this.el.css({
                                'opacity': 0,
                                'height': this.height + 'px', //2px higher
                                'top': window.scrollY + 'px'
                                //'top':this.lastContainerScroll - 1 +'px'
                            }).show().animate({
                                'opacity': 1
                            }, 300);
                        }

                    },
                    topFix: function () {
                        if (!ImageView.el) return;
                        ImageView.el.css('top', window.scrollY + 'px');
                    },
                    bind: function () {
                        var self = this;
                        this.unbind();
                        $(window).on('scroll', this.topFix);
                        this.el.on('touchstart touchmove touchend touchcancel', function (e) {
                            //alert(e.originalEvent.touches[0].pageX)
                            e.touches = e.originalEvent ? e.originalEvent.touches : null;
                            self.handleEvent(e);
                        });
                        this.el.on('click', function (e) {
                            e.preventDefault();
                            var now = new Date();
                            if (now - this.lastTapDate < 500) {
                                return;
                            }
                            this.lastTapDate = now;
                            self.onSingleTap(e);
                        }).on('doubleTap', function (e) {

                            e.preventDefault();
                            self.onDoubleTap(e);
                        });

                        this._resize = function () {
                            self.resize();
                        };
                        'onorientationchange' in window ? window.addEventListener('orientationchange', this._resize, false) : window.addEventListener('resize', this._resize, false);
                    },
                    unbind: function () {
                        this.el.off();
                        $(window).off('scroll', this.topFix);
                        'onorientationchange' in window ? window.removeEventListener('orientationchange', this._resize, false) : window.removeEventListener('resize', this._resize, false);
                    },
                    handleEvent: function (e) {
                        switch (e.type) {

                            case 'touchstart':
                                this.onTouchStart(e);
                                break;
                            case 'touchmove':
                                e.preventDefault();
                                this.onTouchMove(e);
                                break;
                            case 'touchcancel':
                            case 'touchend':
                                this.onTouchEnd(e);
                                break;
                            case 'orientationchange':
                            case 'resize':
                                this.resize(e);
                                break;
                        }
                    },
                    onSingleTap: function (e) {
                        this.close(e);
                    },
                    getDist: function (x1, y1, x2, y2) {
                        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2);
                    },
                    doubleZoomOrg: 1,
                    doubleDistOrg: 1,
                    isDoubleZoom: false,
                    onTouchStart: function (e) {
                        if (this.advancedSupport && e.touches && e.touches.length >= 2) {
                            var img = this.getImg();
                            img.style.webkitTransitionDuration = '0';
                            this.isDoubleZoom = true;
                            this.doubleZoomOrg = this.zoom;
                            this.doubleDistOrg = this.getDist(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);
                            return;
                        }

                        e = e.touches ? e.touches[0] : e;
                        //alert(1111+','+e.touches[0].pageX)
                        this.isDoubleZoom = false;
                        this.startX = e.pageX;
                        this.startY = e.pageY;
                        this.orgX = e.pageX;
                        this.orgY = e.pageY;
                        this.hasMoved = false;
                        //alert(this.startX+',')
                        if (this.zoom != 1) {
                            this.zoomX = this.zoomX || 0;
                            this.zoomY = this.zoomY || 0;
                            var img = this.getImg();
                            if (img) {
                                img.style.webkitTransitionDuration = '0';
                            }
                            this.drag = true;
                        } else {
                            //disable movement with single photo
                            if (this.photos.length == 1) {
                                return;
                            }
                            this.el.find('.pv-inner').css('transitionDuration', '0');
                            //this.el.find('.pv-inner').css('-webkitTransitionDuration','0');
                            this.transX = -this.index * this.width;
                            this.slide = true;
                        }
                    },

                    onTouchMove: function (e) {
                        if (this.advancedSupport && e.touches && e.touches.length >= 2) {
                            var newDist = this.getDist(e.touches[0].pageX, e.touches[0].pageY, e.touches[1].pageX, e.touches[1].pageY);
                            this.zoom = newDist * this.doubleZoomOrg / this.doubleDistOrg;
                            var img = this.getImg();
                            img.style.webkitTransitionDuration = '0';
                            if (this.zoom < 1) {
                                this.zoom = 1;
                                this.zoomX = 0;
                                this.zoomY = 0;
                                img.style.webkitTransitionDuration = '200ms';
                            } else if (this.zoom > this.getScale(img) * 2) {
                                this.zoom = this.getScale(img) * 2;
                            }
                            img.style.webkitTransform = "scale(" + this.zoom + ") translate(" + this.zoomX + "px," + this.zoomY + "px)";
                            return;
                        }
                        //disable movement at double status.
                        if (this.isDoubleZoom) {
                            return;
                        }
                        e = e.touches ? e.touches[0] : e;
                        //move distance larger than 5px
                        if (!this.hasMoved && (Math.abs(e.pageX - this.orgX) > 5 || Math.abs(e.pageY - this.orgY) > 5)) {
                            this.hasMoved = true;
                        }
                        //zoom status
                        if (this.zoom != 1) {
                            var deltaX = (e.pageX - this.startX) / this.zoom;
                            var deltaY = (e.pageY - this.startY) / this.zoom;
                            this.startX = e.pageX;
                            this.startY = e.pageY;

                            var img = this.getImg();
                            var newWidth = img.width * this.zoom,
                                newHeight = img.height * this.zoom;
                            var borderX = (newWidth - this.width) / 2 / this.zoom,
                                borderY = (newHeight - this.height) / 2 / this.zoom;
                            //edge status
                            if (borderX >= 0) {
                                if (this.zoomX < -borderX || this.zoomX > borderX) {
                                    deltaX /= 3;
                                }
                            }
                            if (borderY > 0) {
                                if (this.zoomY < -borderY || this.zoomY > borderY) {
                                    deltaY /= 3;
                                }
                            }
                            this.zoomX += deltaX;
                            this.zoomY += deltaY;
                            //long image status
                            if ((this.photos.length == 1 && newWidth < this.width)) {
                                this.zoomX = 0;
                            } else if (newHeight < this.height) {
                                this.zoomY = 0;
                            }
                            img.style.webkitTransform = "scale(" + this.zoom + ") translate(" + this.zoomX + "px," + this.zoomY + "px)";
                        } else {

                            //slide status
                            if (!this.slide) {
                                return;
                            }

                            var deltaX = e.pageX - this.startX;
                            //alert(e.pageX+','+this.startX)
                            if (this.transX > 0 || this.transX < -this.width * (this.photos.length - 1)) {
                                deltaX /= 4;
                            }

                            this.transX = -this.index * this.width + deltaX;
                            //alert(this.width+','+deltaX+','+this.index)
                            this.el.find('.pv-inner').css('transform', 'translateX(' + this.transX + 'px)');
                            //this.el.find('.pv-inner').css('-webkitTransform','translateX('+this.transX+'px)');
                        }
                    },
                    onTouchEnd: function (e) {
                        if (this.isDoubleZoom) {
                            return;
                        }

                        if (!this.hasMoved) {
                            return;
                        }
                        if (this.zoom != 1) {
                            if (!this.drag) {
                                return;
                            }
                            var img = this.getImg();
                            img.style.webkitTransitionDuration = '200ms';

                            var newWidth = img.width * this.zoom,
                                newHeight = img.height * this.zoom;
                            var borderX = (newWidth - this.width) / 2 / this.zoom,
                                borderY = (newHeight - this.height) / 2 / this.zoom;
                            //index change conditions
                            var len = this.photos.length;
                            if (len > 1 && borderX >= 0) {
                                var updateDelta = 0;
                                var switchDelta = this.width / 6;
                                if (this.zoomX < -borderX - switchDelta / this.zoom && this.index < len - 1) {
                                    updateDelta = 1;
                                } else if (this.zoomX > borderX + switchDelta / this.zoom && this.index > 0) {
                                    updateDelta = -1;
                                }
                                if (updateDelta != 0) {
                                    this.scaleDown(img);
                                    this.changeIndex(this.index + updateDelta);
                                    return;
                                }
                            }
                            //edge
                            if (borderX >= 0) {
                                if (this.zoomX < -borderX) {
                                    this.zoomX = -borderX;
                                } else if (this.zoomX > borderX) {
                                    this.zoomX = borderX;
                                }
                            }
                            if (borderY > 0) {
                                if (this.zoomY < -borderY) {
                                    this.zoomY = -borderY;
                                } else if (this.zoomY > borderY) {
                                    this.zoomY = borderY;
                                }
                            }
                            if (this.isLongPic(img) && Math.abs(this.zoomX) < 10) {
                                img.style.webkitTransform = "scale(" + this.zoom + ") translate(0px," + this.zoomY + "px)";
                                return;
                            } else {
                                img.style.webkitTransform = "scale(" + this.zoom + ") translate(" + this.zoomX + "px," + this.zoomY + "px)";
                            }
                            this.drag = false;

                        } else {
                            if (!this.slide) {
                                return;
                            }
                            var deltaX = this.transX - (-this.index * this.width);
                            var updateDelta = 0;
                            if (deltaX > 50) {
                                updateDelta = -1;
                            } else if (deltaX < -50) {
                                updateDelta = 1;
                            }
                            this.changeIndex(this.index + updateDelta);
                            this.slide = false;
                        }
                    },
                    getImg: function (index) {
                        var img = this.el.find('li').eq(index || this.index).find('img');
                        if (img.size() == 1) {
                            return img[0];
                        } else {
                            return null;
                        }
                    },
                    //return default zoom factor
                    getScale: function (img) {
                        //long images
                        if (this.isLongPic(img)) {
                            return this.width / img.width; //scale to fit window
                        } else {
                            //other images
                            //return 1 if image is smaller than window
                            var h = img.naturalHeight,
                                w = img.naturalWidth;
                            var hScale = h / img.height,
                                wScale = w / img.width;
                            if (hScale > wScale) {
                                return wScale;
                            } else {
                                return hScale;
                            }
                        }
                    },
                    onDoubleTap: function (e) {
                        var now = new Date();
                        if (now - this.lastTapDate < 500) {
                            return;
                        }
                        this.lastTapDate = now;
                        var img = this.getImg();
                        if (!img) {
                            return;
                        }

                        if (this.zoom != 1) {
                            this.scaleDown(img);
                        } else {
                            this.scaleUp(img);
                        }
                        this.afterZoom(img);
                    },

                    scaleUp: function (img) {
                        var scale = this.getScale(img);
                        if (scale > 1) {
                            img.style.webkitTransform = "scale(" + scale + ")";
                            img.style.webkitTransition = "200ms";
                        }

                        this.zoom = scale;
                        this.afterZoom(img);
                    },

                    scaleDown: function (img) {
                        this.zoom = 1;
                        this.zoomX = 0;
                        this.zoomY = 0;
                        this.doubleDistOrg = 1;
                        this.doubleZoomOrg = 1;
                        img.style.webkitTransform = "";
                        this.afterZoom(img);
                    },
                    afterZoom: function (img) {
                        //reposition: top of image.
                        if (this.zoom > 1 && this.isLongPic(img)) {
                            var newHeight = img.height * this.zoom;
                            var borderY = (newHeight - this.height) / 2 / this.zoom;
                            if (borderY > 0) {
                                this.zoomY = borderY;
                                img.style.webkitTransform = "scale(" + this.zoom + ") translate(0px," + borderY + "px)";
                            }
                        }
                    },
                    isLongPic: function (img) {
                        return img.height / img.width >= 3.5
                    },
                    resizeTimer: null,
                    resize: function (e) {
                        clearTimeout(this.resizeTimer);
                        var self = this;
                        this.resizeTimer = setTimeout(function () {

                            document.body.style.minHeight = window.innerHeight + 1 + 'px';
                            if (self.zoom != 1) {
                                //cancel zoom status
                                self.scaleDown(self.getImg());
                            }
                            self.clearStatus();
                            self.render(); //re-render is faster than nodes modification.

                            self.el.height(self.height).css('top', window.scrollY + 'px');
                            self.changeIndex(self.index, true);
                        }, 600);
                    },

                    changeIndex: function (index, force) {
                        if (this.indexChangeLock) {
                            return;
                        }
                        if (index < 0) {
                            index = 0;
                        } else if (index >= this.photos.length) {
                            index = this.photos.length - 1;
                        }
                        var changed = this.index != index;
                        this.index = index;
                        var inner = this.el.find('.pv-inner');
                        inner.css({
                            'transitionDuration': force ? '0' : '200ms',
                            'transform': 'translateX(-' + index * this.width + 'px)'
                        });
                        /*inner.css({
						    '-webkitTransitionDuration':force?'0':'200ms',
						    '-webkitTransform':'translateX(-'+index*this.width+'px)'
						});*/
                        //load image at current index
                        var li = inner.find('li').eq(index);
                        var imgs = li.find('img');
                        var self = this;
                        if (!imgs.size()) {
                            this.el.find('#J_loading').show();
                            if (typeof this.photos[index] != 'undefined') {
                                var img = new Image();
                                img.onload = function () {
                                    if (self.el == null) {
                                        return;
                                    }
                                    img.onload = null;
                                    self.el.find('#J_loading').hide();
                                    img.style.webkitTransform = '';
                                    img.style.opacity = '';
                                    if (self.isLongPic(img)) {
                                        setTimeout(function () {
                                            self.scaleUp(img);
                                        }, 0);
                                    }
                                };
                                img.ontimeout = img.onerror = function () {
                                    li.html('<i style="color:white;">This image is broken, try again later.</i>');
                                    self.el.find('#J_loading').hide();
                                }
                                if (this.advancedSupport) {
                                    img.style.webkitBackfaceVisibility = 'hidden';
                                }
                                img.style.opacity = '0';
                                img.src = this.getImgUrl(index);
                                li.html('').append(img);
                                //do we have enough photos
                                if (this.config.onRequestMore && this.index > 0 && typeof this.photos[index - 1] == 'undefined') {
                                    this.config.onRequestMore(this.photos[index], -1, index);
                                } else if (this.config.onRequestMore && this.index < this.photos.length - 1 && typeof this.photos[this.index + 1] == 'undefined') {
                                    this.config.onRequestMore(this.photos[index], 1, index);
                                }
                                this.preload(index - 1);
                                this.preload(index + 1);
                            } else {
                                this.indexChangeLock = true;
                            }
                        }
                        if (changed || force) {
                            this.el.find('#J_index').html((index + 1) + '/' + this.photos.length);
                            this.config.onIndexChange && this.config.onIndexChange(img, this.photos, index);
                        }
                        setTimeout(function () {
                            self.memoryClear();
                        }, 0);
                    },
                    //defaule memory clear，remove nodes at index between [0, index - 10] && [index+10, max]
                    memoryClear: function () {
                        var li = this.el.find('.pv-img');
                        var i = this.index - 10;
                        while (i >= 0) {
                            if (li.eq(i).html() == '') break;
                            li.eq(i).html('');
                            i--;
                        }
                        i = this.index + 10;
                        while (i < li.size()) {
                            if (li.eq(i).html() == '') break;
                            li.eq(i).html('');
                            i++;
                        }
                    },

                    getImgUrl: function (index, useOrg) {
                        if (index < 0 || index >= this.photos.length || !this.photos[index]) {
                            return "";
                        }

                        return this.photos[index];
                    },

                    preload: function (index) {
                        if (index < 0 || index >= this.photos.length || !this.getImg(index)) {
                            return;
                        }
                        var url = this.getImgUrl(index);
                        if (url) {
                            var img = new Image();
                            img.src = url;
                        }
                    },
                    /**
                     * update photos at given index
                     * @param photos {Array}
                     * @param index {Number} global index of first photo in given array
                     */
                    update: function (photos, index) {
                        if (index < this.photos.length) {
                            var len = photos.length;
                            for (var i = index; i < index + len; i++) {
                                this.photos[i] = photos[i - index];
                            }

                            if (this.indexChangeLock) {
                                this.indexChangeLock = false;
                                this.changeIndex(this.index);
                            }
                        }
                    },

                    destroy: function () {
                        if (this.el) {
                            var self = this;
                            this.unbind();
                            this.el.animate({
                                'opacity': 0
                            }, 300, 'linear', function () {
                                if (self.el) {
                                    self.el.html('').remove();
                                    self.el = null;
                                }
                            });
                            this.config.onClose && this.config.onClose(this.img, this.photos, this.index);
                        }
                    },

                    close: function () {
                        this.destroy();
                    }
                };

                return ImageView;

            },
            previewPhoto: function (e) {
                var ctx = utils,
                    photoTypes = ['jpg', 'png', 'gif', 'bmp', 'jpeg'],
                    $photoItem = $(e.currentTarget),
                    $photo = $photoItem.find('img'),
                    $list = $photoItem.closest('[data-role="photoList"]'),
                    url = $photoItem.attr('data-original') || $photo.attr('data-original') || '',
                    getFileExt = ctx.getFileExt,
                    ext = getFileExt(url),
                    current = url.indexOf('/assets') > -1 ? url : url + '!medium.640',
                    index,
                    pics = [];


                if (!~photoTypes.indexOf(ext)) {
                    return;
                }

                if ($list.length === 0) {
                    url && pics.push(current);
                } else {
                    $list.find('[data-role="photoItem"]').each(function (_, item) {
                        var url = $(item).attr('data-original') || $(item).find('img').attr('data-original') || '',
                            ext = getFileExt(url),
                            thumb = url.indexOf('/assets') > -1 ? url : url + '!medium.640';
                        (photoTypes.indexOf(ext) > -1) && pics.push(thumb);
                    });
                }

                index = $photoItem.index();
                ctx.imageView().init(pics, index);

            },
            bindPreview: function (options) {
                var ctx = this,
                    opts = options || {},
                    wrapper = opts.wrapper || 'body',
                    item = opts.item || '[data-role="photoItem"]';
                $(wrapper).off('click', item, ctx.previewPhoto);
                $(wrapper).on('click', item, ctx.previewPhoto);
            },
            classifyAttachment: function (list) {
                var ctx = utils,
                    list = list || [],
                    videoTypes = ['3gp', 'mov', 'mp4', 'ogg', 'avi'],
                    photoTypes = ['jpg', 'png', 'gif', 'bmp', 'jpeg'],
                    audioTypes = ['mp3', 'wav'],
                    docTypes = ['doc', 'xls', 'ppt', 'docx', 'xlsx', 'pptx', 'pdf'],
                    result = {
                        videos: [],
                        photos: [],
                        audios: [],
                        docs: [],
                        others: []
                    },
                    item, url, ext;

                for (var i = list.length - 1; i >= 0; i--) {
                    item = list[i];
                    url = item.url || '';
                    ext = ctx.getFileExt(url);
                    if (videoTypes.indexOf(ext) > -1) {
                        result.videos.unshift(item);

                    } else if (photoTypes.indexOf(ext) > -1) {
                        result.photos.unshift(item);

                    } else if (audioTypes.indexOf(ext) > -1) {
                        result.audios.unshift(item);

                    } else if (docTypes.indexOf(ext) > -1) {
                        result.docs.unshift(item);

                    } else {
                        result.others.unshift(item);
                    }
                };

                return result;
            },
            formatDate: function (timeStamp) {
                var now = new Date().valueOf();
                var result = '';
                var delta = (now - timeStamp) / 1000;
                if (delta < 60) {
                    result = '刚刚';
                } else if (delta < 60 * 60) {
                    result = Math.floor(delta / (60)) + '分钟前';
                } else if (delta < 24 * 60 * 60) {
                    result = Math.floor(delta / (60 * 60)) + '小时前';
                } else if (delta < 30 * 24 * 60 * 60) {
                    result = Math.floor(delta / (24 * 60 * 60)) + '天前';
                } else if (delta < 12 * 30 * 24 * 60 * 60) {
                    result = Math.floor(delta / (30 * 24 * 60 * 60)) + '个月前';
                } else if (delta >= 12 * 30 * 24 * 60 * 60) {
                    result = Math.floor(delta / (12 * 30 * 24 * 60 * 60)) + '年前';
                }

                return result;
            },
            play: function () {
                var videoTpl = '<video id="{id}" class="" controls preload="auto" width="240" height="150"><source src="{source}" /></video>',
                    audioTpl = '<audio id="{id}" src="{source}" controls preload="true" width="240">您的浏览器不支持 audio 标签</audio>',
                    Media = {
                        /*
						options
							id:'videoid',
							source:'xxx.mp4',
							place:'显示位置',
							controls:true,
							autoplay:false,
							preload:'auto',
							width:200,
							height:100

					*/
                        video: function (options) {
                            var opts = options || {},
                                videoOpts = $.extend(true, {}, opts),
                                id = opts.id || ('video_' + new Date().valueOf()),
                                source = opts.source || '',
                                ext = source.split('.')[1],
                                type = 'video/' + ext,
                                $place = (typeof opts.place === 'string') ? $('#' + opts.place) : opts.place,
                                parentWidth = $place.closest('.m-video-item').width(),
                                width,
                                html = videoTpl;


                            html = html.replace('{id}', id);
                            html = html.replace('{source}', source);
                            //html = html.replace('{type}',type);
                            $place.html(html);

                            delete videoOpts['id'];
                            delete videoOpts['source'];
                            delete videoOpts['place'];



                            setTimeout(function () {
                                $('#' + id).mediaelementplayer({});

                            }, 1);

                        },
                        audio: function (options) {
                            var opts = options || {},
                                audioOpts = $.extend(true, {}, opts),
                                id = opts.id || ('audio_' + new Date().valueOf()),
                                source = opts.source || '',
                                ext = source.split('.')[1],
                                type = 'audio/' + ext,
                                $place = (typeof opts.place === 'string') ? $('#' + opts.place) : opts.place,
                                parentWidth = $place.closest('.m-audio-item').width(),
                                width,
                                html = audioTpl;


                            html = html.replace('{id}', id);
                            html = html.replace('{source}', source);
                            //html = html.replace('{type}',type);
                            $place.html(html);


                            setTimeout(function () {
                                $('#' + id).mediaelementplayer({

                                });

                            }, 1);


                        }
                    },
                    bindShowMedia = function (e) {
                        var $poster = $(e.currentTarget);
                        var $parent = $poster.closest('.m-media-player');
                        var $show = $parent.find('[data-role="show"]');
                        var $play = $parent.find('[data-role="play"]');
                        var type = $parent.attr('data-type');
                        var source = $parent.attr('data-source');

                        if ('video' === type) {
                            $poster.hide();
                            $show.show();
                            Media.video({
                                type: type,
                                source: source,
                                place: $play
                            });
                        } else if ('audio' === type) {
                            $poster.hide();
                            $show.show();
                            Media.audio({
                                type: type,
                                source: source,
                                place: $play
                            });
                        }

                    },
                    bindHideMedia = function (e) {
                        var $remove = $(e.currentTarget);
                        var $parent = $remove.closest('.m-media-player');
                        var $poster = $parent.find('[data-role="poster"]');
                        var $show = $parent.find('[data-role="show"]');
                        var $play = $parent.find('[data-role="play"]');
                        $poster.show();
                        $show.hide();
                        $play.html('');
                    }

                $('body').off('click', '.m-media-player [data-role="poster"]', bindShowMedia);
                $('body').on('click', '.m-media-player [data-role="poster"]', bindShowMedia);
                $('body').off('click', '.m-media-player [data-role="remove"]', bindHideMedia);
                $('body').on('click', '.m-media-player [data-role="remove"]', bindHideMedia);

            }

        },
        centerElement = function (el, width, height) {
            var win = utils.getClient(),
                winHeight = win.h,
                winWidth = win.w,
                element = el.jquery ? el[0] : el,
                _width = width || element.offsetWidth,
                height = height || element.offsetHeight,
                top, left;

            left = Math.floor((winWidth - _width) * 0.5);

            if (width) {
                element.style.width = width + 'px';
            }
            element.style.position = 'fixed';
            element.style.left = left + 'px';

            top = Math.floor((winHeight - height) * 0.45);
            element.style.top = top + 'px';
        },
		mLoading = {
		    success: function () {
		        var notice = '成功了',
		            timeout = 1000,
		            callback, $dom;
		        if (arguments.length === 3) {
		            notice = arguments[0];
		            timeout = arguments[1];
		            callback = arguments[2];
		        } else if (arguments.length === 2) {
		            notice = arguments[0];
		            timeout = (typeof arguments[1] == 'number') ? arguments[1] : timeout;
		            callback = (typeof arguments[1] == 'function') ? arguments[1] : null;
		        } else if (arguments.length == 1) {
		            notice = (typeof arguments[0] == 'string') ? arguments[0] : notice;
		            callback = (typeof arguments[0] == 'function') ? arguments[0] : null;
		        }

		        var tmpl = '<div id="mLoading" role="success"><div class="lbk"></div><div class="lcont">' + notice + '</div></div>';
		        $('#mLoading').remove();
		        $dom = $(tmpl).appendTo($('body'));
		        centerElement($('#mLoading'), 146, 146);
		        setTimeout(function () {
		            $dom.remove();
		            callback && callback();
		        }, timeout);
		    },
		    show: function (notice, options) {
		        var notice = notice || '正在加载...',
		            options = options || {},
		            tmpl = '<div id="mLoading"><div class="lbk"></div><div class="lcont">' + notice + '</div></div>';

		        if ($('#mLoading').length > 0) {
		            $('#mLoading .lcont').text(notice);
		        } else {
		            $('body').append(tmpl);
		            centerElement($('#mLoading'), 146, 146);
		        }
		    },
		    hide: function () {
		        $('#mLoading').remove();
		    }
		};


    /* factory */

    //自定义 MNotice
    app.factory('mNotice', function () {
        return utils.mNotice.bind(utils);
    });

    //图片预览
    app.factory('imgPreview', function () {
        return utils.bindPreview.bind(utils);
    });

    //附件分类
    app.factory('classifyAttachment', function () {
        return utils.classifyAttachment;
    });

    //moment
    app.factory('formatDate', function () {
        return utils.formatDate;
    });

    //视频play
    app.factory('play', function () {
        return utils.play;
    });

    //MLoading
    app.factory('mLoading', function () {
        return mLoading;
    });

    //sd
    app.factory('tools',function(){
        var isImg = function (ext) {
            return !!~['bmp', 'gif', 'jpg', 'jpeg', 'png'].indexOf(ext)
        },
        getExt = function (url) {
            var arr = url.split('.');
            return arr[arr.length - 1].toLowerCase()
        },
        setListIcon = function (list) {
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
        return {
            setListIcon : setListIcon
        }
    });
    app.factory('scroll',function(){
        return {
            initScroll: function(ulSelector, isFlip, containerSelector, pageOnClass) {
                var cSelector = containerSelector || 'body';
                var isFlip = isFlip || false;
                var pageOnClass = pageOnClass || 'on';
                // 图片横滑
                var x, y, endX, endY, offsetX, offsetY, objLeft, left = 0, tabIndex = 0;

                var ulObj = jQuery(ulSelector);

                var minX = 0 ;
                jQuery(cSelector).on('touchstart', ulSelector, function(e) {
                    jQuery(this).css({'position':'relative'});
                    x = endX = e.originalEvent.touches[0].pageX;
                    y = endY = e.originalEvent.touches[0].pageY;
                    objLeft = left;
                });
                jQuery(cSelector).on('touchmove', ulSelector, function(e) {
                    // document.ontouchmove = function(e){ e.preventDefault();}
                    endX = e.originalEvent.touches[0].pageX;
                    endY = e.originalEvent.touches[0].pageY;
                    offsetX = endX - x;
                    offsetY = endY - y;
                    // 图片上竖滑不明显时禁用上下滑
                    if (Math.abs(offsetY) < Math.abs(offsetX)) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        //document.ontouchmove = function(e){ e.preventDefault();}
                    } else {
                        return true;
                        //document.ontouchmove = function(e){ return true;}
                    }
                    var obj = jQuery(this);
                    left =  objLeft + parseInt(offsetX);
                    // 防止左滑过头
                    if (left > 0) {
                        left = 0;
                        offsetX = 0;
                        offsetY = 0;
                    }
                    if (!isFlip) {
                        minX = 0;
                        obj.find('li').each(function(i, e) {
                            minX += jQuery(e).width();
                        });
                        var parentObj = obj.parent();
                        minX = minX - parentObj.width() + parentObj.offset().left;
                        minX *= -1;
                    } else {
                        var liObj = obj.find('li');
                        minX = -1 * liObj.width() * (liObj.length - 1);
                    }
                    // 防止左滑过头
                    if (left <= minX) {
                        left = minX;
                        offsetX = 0;
                        offsetY = 0;
                    }
                    jQuery(this).css("left", left);

                });
                jQuery(cSelector).on('touchend', ulSelector, function(e) {
                    if (!isFlip) {
                        objLeft = left;
                        document.ontouchstart = function(e){ return true;}
                    } else {
                        changeTab(this.id, -1, offsetX);
                        offsetX = 0;
                    }
                });

                /*
                 if (isFlip) {
                 jQuery('.expreList .pNumCon a').on('click', function() {
                 var thisObj = jQuery(this);
                 var ulId = 'exp' + thisObj.parent().attr('id').replace('page', '');
                 changeTab(ulId, thisObj.index());
                 });
                 }
                 */

                // 表情滑动效果
                var changeTab = function (ulId, index, offsetX) {

                    var pObj = jQuery('#' + ulId + '_page a');
                    var len = pObj.length;

                    if(index < 0) {
                        if(offsetX > 10) {
                            index = tabIndex - 1;
                        } else if(offsetX < -10) {
                            index = tabIndex + 1;
                        } else {
                            index = tabIndex;
                        }
                    }

                    if(index > len - 1 || index < 0) {
                        return;
                    }

                    var pageWidth = jQuery('#' + ulId + ' li').width();
                    var le = -1 * pageWidth * index;
                    var le_px =  le + "px";

                    left = le;

                    jQuery('#' + ulId).stop().animate({
                        "left": le_px
                    }, 100, function(){
                        // 修改 Left
                        left = le;
                    });

                    pObj.removeClass(pageOnClass);
                    pObj.eq(index).addClass(pageOnClass);

                    tabIndex = index;
                };

            }
        };
    });
    //表情
    app.factory('emotion',['scroll',function(libScroll){
        var ICON = {
            "闭嘴": "e107.gif",
            "NO": "e188.gif",
            "跳跳": "e192.gif",
            "怄火": "e194.gif",
            "转圈": "e195.gif",
            "磕头": "e196.gif",
            "回头": "e197.gif",
            "跳绳": "e198.gif",
            "闭嘴": "e107.gif",
            "\u5472\u7259": "e113.gif",
            "\u8c03\u76ae": "e112.gif",
            "\u6d41\u6c57": "e127.gif",
            "\u5077\u7b11": "e120.gif",
            "\u518d\u89c1": "e139.gif",
            "\u6572\u6253": "e138.gif",
            "\u64e6\u6c57": "e140.gif",
            "\u732a\u5934": "e162.gif",
            "\u73ab\u7470": "e163.gif",
            "\u6d41\u6cea": "e105.gif",
            "\u5927\u54ed": "e109.gif",
            "\u5618..": "e133.gif",
            "\u9177": "e116.gif",
            "\u6293\u72c2": "e118.gif",
            "\u59d4\u5c48": "e149.gif",
            "\u4fbf\u4fbf": "e174.gif",
            "\u70b8\u5f39": "e170.gif",
            "\u83dc\u5200": "e155.gif",
            "\u53ef\u7231": "e121.gif",
            "\u8272": "e102.gif",
            "\u5bb3\u7f9e": "e106.gif",
            "\u5f97\u610f": "e104.gif",
            "\u5410": "e119.gif",
            "\u5fae\u7b11": "e100.gif",
            "\u53d1\u6012": "e111.gif",
            "\u5c34\u5c2c": "e110.gif",
            "\u60ca\u6050": "e126.gif",
            "\u51b7\u6c57": "e117.gif",
            "\u7231\u5fc3": "e166.gif",
            "\u793a\u7231": "e165.gif",
            "\u767d\u773c": "e122.gif",
            "\u50b2\u6162": "e123.gif",
            "\u96be\u8fc7": "e115.gif",
            "\u60ca\u8bb6": "e114.gif",
            "\u7591\u95ee": "e132.gif",
            "\u7761": "e108.gif",
            "\u4eb2\u4eb2": "e152.gif",
            "\u61a8\u7b11": "e128.gif",
            "\u7231\u60c5": "e190.gif",
            "\u8870": "e136.gif",
            "\u6487\u5634": "e101.gif",
            "\u9634\u9669": "e151.gif",
            "\u594b\u6597": "e130.gif",
            "\u53d1\u5446": "e103.gif",
            "\u53f3\u54fc\u54fc": "e146.gif",
            "\u62e5\u62b1": "e178.gif",
            "\u574f\u7b11": "e144.gif",
            "\u98de\u543b": "e191.gif",
            "\u9119\u89c6": "e148.gif",
            "\u6655": "e134.gif",
            "\u5927\u5175": "e129.gif",
            "\u53ef\u601c": "e154.gif",
            "\u5f3a": "e179.gif",
            "\u5f31": "e180.gif",
            "\u63e1\u624b": "e181.gif",
            "\u80dc\u5229": "e182.gif",
            "\u62b1\u62f3": "e183.gif",
            "\u51cb\u8c22": "e164.gif",
            "\u996d": "e161.gif",
            "\u86cb\u7cd5": "e168.gif",
            "\u897f\u74dc": "e156.gif",
            "\u5564\u9152": "e157.gif",
            "\u74e2\u866b": "e173.gif",
            "\u52fe\u5f15": "e184.gif",
            "OK": "e189.gif",
            "\u7231\u4f60": "e187.gif",
            "\u5496\u5561": "e160.gif",
            "\u6708\u4eae": "e175.gif",
            "\u5200": "e171.gif",
            "\u53d1\u6296": "e193.gif",
            "\u5dee\u52b2": "e186.gif",
            "\u62f3\u5934": "e185.gif",
            "\u5fc3\u788e": "e167.gif",
            "\u592a\u9633": "e176.gif",
            "\u793c\u7269": "e177.gif",
            "\u8db3\u7403": "e172.gif",
            "\u9ab7\u9ac5": "e137.gif",
            "\u6325\u624b": "e199.gif",
            "\u95ea\u7535": "e169.gif",
            "\u9965\u997f": "e124.gif",
            "\u56f0": "e125.gif",
            "\u5492\u9a82": "e131.gif",
            "\u6298\u78e8": "e135.gif",
            "\u62a0\u9f3b": "e141.gif",
            "\u9f13\u638c": "e142.gif",
            "\u6eb4\u5927\u4e86": "e143.gif",
            "\u5de6\u54fc\u54fc": "e145.gif",
            "\u54c8\u6b20": "e147.gif",
            "\u5feb\u54ed\u4e86": "e150.gif",
            "\u5413": "e153.gif",
            "\u7bee\u7403": "e158.gif",
            "\u4e52\u4e53": "e159.gif"
        };
        var tpl = '<div class="expreBox">'+
            '<ul class="expreCon expreConNew" id="exp_emo0">'+
            '<li class="bg1" style="background-position: 50% 50%;">'+
            '<a href="javascript:void(0);" title="微笑"></a>'+
            '<a href="javascript:void(0);" title="撇嘴"></a>'+
            '<a href="javascript:void(0);" title="色"></a>'+
            '<a href="javascript:void(0);" title="发呆"></a>'+
            '<a href="javascript:void(0);" title="得意"></a>'+
            '<a href="javascript:void(0);" title="流泪"></a>'+
            '<a href="javascript:void(0);" title="害羞"></a>'+
            '<a href="javascript:void(0);" title="闭嘴"></a>'+
            '<a href="javascript:void(0);" title="睡"></a>'+
            '<a href="javascript:void(0);" title="大哭"></a>'+
            '<a href="javascript:void(0);" title="尴尬"></a>'+
            '<a href="javascript:void(0);" title="发怒"></a>'+
            '<a href="javascript:void(0);" title="调皮"></a>'+
            '<a href="javascript:void(0);" title="呲牙"></a>'+
            '<a href="javascript:void(0);" title="惊讶"></a>'+
            '<a href="javascript:void(0);" title="难过"></a>'+
            '<a href="javascript:void(0);" title="酷"></a>'+
            '<a href="javascript:void(0);" title="冷汗"></a>'+
            '<a href="javascript:void(0);" title="抓狂"></a>'+
            '<a href="javascript:void(0);" title="吐"></a>'+
            '<a href="javascript:void(0);"></a>'+
            '</li>'+
            '</ul>'+
            '</div>'+
            '<p class="pNumCon" id="exp_emo0_page">'+
            '<a href="javascript:void(0);" class=" pNumOn  pNum "></a>'+
            '</p>';
        return {
            init:function(options) {
                var opts = options || {} ,
                    $container = $(opts.container),
                    $textarea = opts.textarea?$(opts.textarea):$('#content'),
                    $select = opts.select?$(opts.select):$('.expreSelect');

                $container.html(tpl);

                libScroll.initScroll('.expreBox ul', true, 'body', 'pNumOn');

                // 表情按钮选中后 显示表情列表
                $select.bind('click', function(){
                    var target = $(this);
                    target.toggleClass('expreSelectOn');
                    if(target.hasClass('expreSelectOn')){
                        $container.show();
                    }else{
                        $container.hide();
                    }
                });

                $container.find(".expreCon li a").each(function(i){

                    jQuery(this).on("click", function() {
                        var title = jQuery(this).attr("title");

                        if($textarea) {
                            var content = $textarea.val();
                            if(!title) {
                                if(content && content.lastIndexOf(']') == content.length - 1) {
                                    var LeftIndex = content.lastIndexOf('[');
                                    content = content.substring(0, LeftIndex);
                                } else {
                                    content = content.substring(0, content.length - 1);
                                }
                            } else {
                                content = content + "[" + title + "]";
                            }
                            $textarea.val(content);
                        }
                    });
                });

            },
            hide:function(options){
                var opts = options || {} ,
                    $container = $(opts.container),
                    $select = opts.select?$(opts.select):$('.expreSelect');

                $select.removeClass('expreSelectOn');
                $container.hide();

            },
            replace_em:function(str) {
                var str = str || '' , prefix = '/assets/img/news/emotion/',qqFace = '/assets/img/news/emotion1/';

                // 为了兼容成长档案里的表情
                str = str.replace(/\</g,'&lt;');
                str = str.replace(/\>/g,'&gt;');
                str = str.replace(/\n/g,'<br/>');
                str = str.replace(/\[em_([0-9]*)\]/g,'<img src="'+qqFace+'$1.gif" border="0" />');

                return str.replace(/\[(.*?)\]/igm , function(match, key) {
                    var url;
                    if(typeof ICON[key] != 'undefined'){
                        url = prefix + ICON[key];
                        return '<img src="'+url+'" border="0" />';
                    }
                    return match;
                });
            }


        };
    }]);
}).call(angular.module('m.utils', []));