<!DOCTYPE html>
<html>
<head>
    <base href="/" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <meta name="format-detection" content="telephone=no" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Cache-Control" content="no-cache" />
    <meta http-equiv="Cache-Control" content="max-age=0" />
    <title></title>
    <link rel="stylesheet" href="http://assets.haoyuyuan.com/vendor/libs/bootstrap/3.3.4/css/bootstrap.min.css" />
    <link rel="stylesheet" href="http://at.alicdn.com/t/font_1453452413_7213495.css?t=2016012201" />
    <link rel="stylesheet" href="http://assets.haoyuyuan.com/vendor/plugins/igrow/iconfont-m/1.0.0/iconfont.min.css?t=20150306" />
    <link rel="stylesheet" href="/assets/js/plugins/swiper/3.2.6/dist/css/swiper.min.css"/>
    <link rel="stylesheet" href="/assets/js/plugins/videoJs/5.4.5/video-js.min.css"/>
    <link rel="stylesheet" href="http://assets.haoyuyuan.com/vendor/plugins/bootstrap/bootstrap-datetimepicker/2.3.4/css/bootstrap-datetimepicker.min.css?t=20150306" />
    {{ igrow_style('/dist/css/app.min.css') }}
    {{ igrow_style('/dist/css/modules.min.css') }}
</head>
<body>
    <div class="view-mask"></div>
    <section><div ng-view></div></section>
    <script type="text/javascript">
        (function () {
            var user = '<?php echo IgrowAuth::user(); ?>';
            this.IGrow = { User: user ? JSON.parse(user) : null };
        }).call(window);
    </script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/jquery/jquery-2.1.4.min.js"></script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/angularjs/1.3.16/angular.min.js"></script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/angularjs/1.3.16/angular-resource.min.js"></script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/angularjs/1.3.16/angular-route.min.js"></script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/angularjs/1.3.16/angular-sanitize.min.js"></script>
    <script src="http://assets.haoyuyuan.com/vendor/libs/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    {{--<script type="text/javascript" src="/assets/js/core/flexible.js"></script>--}}
    {{ igrow_script('/dist/js/config/app.config.min.js') }}
    {{ igrow_script('/dist/js/config/app.service.min.js') }}
    {{ igrow_script('/dist/js/core/app.min.js') }}
    {{--<script type='text/javascript' id="__bs_script__">//<![CDATA[
        document.write("<script async src='//HOST:3000/browser-sync/browser-sync-client.2.11.1.js'><\/script>".replace(/HOST/g, location.hostname).replace(/PORT/g, location.port));
    //]]></script>--}}
</body>
</html>