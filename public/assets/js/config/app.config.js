'use strict';

(function () {

    var hash = location.hash || '';
    if (hash = hash.match(/^(.*)(\#wechat_redirect|\%23wechat_redirect)/)) { location.hash = hash[1] }

    IGrow.Config = {
        timestamp: '2016010406',
        automask: true,
        autotips: true,
        app: {
            code: 'M',
            dir: 'modules/',
            schoolmanager: 'school.admin,school.master,school.vice_master,school.sysadmin'
        },
        service: {},
        map: [],
        emojis: {}
    };

    IGrow.Config.map = [
        {
            path: [
                'school/public',
                'school/public/:uname/:openid/:type',
                'school/public/:uname/:openid/:type/:schoolid'
            ],
            viewUrl: 'school/public.html',
            scripts: 'school/public.js',
            modules: 'm.school'
        },
        {
            path: [
                'school/bind',
                'school/bind/:uname/:openid'
            ],
            viewUrl: 'school/bind.html',
            scripts: 'school/public.js',
            modules: 'm.school'
        },
        {
            path: [
                'school',
                'school/detail',
                'school/detail/:type/:schoolid'
            ],
            viewUrl: 'school/detail.html',
            scripts: 'school/public.js',
            modules: 'm.school'
        },
        {
            path: [
                'aboutSchool/:action',
                'aboutSchool/news/:id',
                'aboutSchool/:action/:schoolid',
                'aboutSchool/:action/:schoolid/:type'
            ],
            viewUrl: 'school/index.html',
            scripts: ['school/index.js','/assets/js/plugins/swiper/3.2.6/dist/js/swiper.jquery.min.js','/assets/js/core/utils.min',],
            modules: ['m.aboutSchool','m.utils']
        },
        {
            path: [
                'school/dynamic',
                'school/dynamic/:action/:id',
                'school/dynamic/:action/:id/class/:classid',
                'school/dynamic/:action/:schoolid/:id'
            ],
            viewUrl: 'dynamic/schoolDynamic.html',
            scripts: [
                '/assets/js/core/utils.min',
                'dynamic/schoolDynamic.js'
            ],
            modules: ['m.dynamic', 'm.utils']
        },
        {
            path: 'school/dynamic/:action',
            viewUrl: 'dynamic/schoolDynamic.html',
            scripts: [
                '/assets/js/core/utils.min',
                'dynamic/schoolDynamic.js'
            ],
            modules: ['m.dynamic', 'm.utils']
        },
        {
            path: [
                'class',
                'class/:classid',
                'class/:action/:classid'
            ],
            viewUrl: 'class/info.html',
            scripts: 'class/info.js',
            modules: 'm.class'
        },
        {
            path: 'teacher/profile/:id',
            viewUrl: 'teacher/profile.html',
            scripts: 'teacher/info.js',
            modules: 'm.teacher'
        },
        {
            path: [
                'classindex',
                'classindex/:action',
                'classindex/:action/:id'
            ],
            viewUrl: 'class/classindex.html',
            scripts: [
                '/assets/js/plugins/mediaelement/2.13.1/mediaelement-and-player.min.js',
                '/assets/js/core/utils.min',
                'class/classindex.js',
                '/assets/js/plugins/videoJs/5.4.5/video.min',
                '/assets/js/plugins/swiper/3.2.6/dist/js/swiper.jquery.min.js'
            ],
            modules: ['m.classindex', 'm.utils']
        },
        {
            path: [
                'exam',
                'exam/:action',
                'exam/:action/:classid',
                'exam/:action/:classid/:id',
            ],
            viewUrl: 'exam/exam.html',
            scripts: [
                'exam/exam.js'
            ],
            modules: 'm.exam'
        },
        {
            path: [
                'syllabus'
            ],
            viewUrl: 'syllabus/syllabus.html',
            scripts: [
                'syllabus/syllabus.js'
            ],
            modules: 'm.syllabus'
        },
        {
            path: [
                'teacherclub',
                'teacherclub/:action'
            ],
            viewUrl: 'teacherclub/teacherclub.html',
            scripts: [
                'teacherclub/teacherclub.js',
                '/assets/js/core/utils.min'
            ],
            modules: ['m.teacherclub','m.utils']
        },
        {
            path: [
                'sms',
                'sms/:action',
                'sms/:action/:id'
            ],
            viewUrl: 'school/sms.html',
            scripts: ['school/sms.js','/assets/js/core/utils.min'],
            modules: ['m.sms', 'm.utils']
        },
        {
            path: [
                'notice',
                'notice/:classid',
                'notice/:action/:id'
            ],
            viewUrl: 'school/notice.html',
            scripts: 'school/notice.js',
            modules: 'm.notice'
        },
        {
            path: [
                'classaction',
                'classaction/:classid',
                'classaction/:action/:id'
            ],
            viewUrl: 'class/classaction.html',
            scripts: [
                '/assets/js/core/utils.min',
                'class/classaction.js',
                '/assets/js/plugins/videoJs/5.4.5/video.min'
            ],
            modules: ['m.classaction', 'm.utils']
        },
        //班级互动
        {
            path: [
                'interact',
                'interact/:classid',
                'interact/:action/:id'
            ],
            viewUrl: 'class/classInteract.html',
            scripts: [
                'class/classInteract.js',
                '/assets/js/core/utils.min'
            ],
            modules: ['m.classindex.interact', 'm.utils']
        },
        {
            path: [
                'pm',
                'pm/:uid',
                'pm/:uid/:realname'
            ],
            viewUrl: 'user/pm.html',
            scripts: [
                '/dist/js/config/app.emojis.min',
                'user/pm.js'
            ],
            modules: 'm.pm'
        },
        //我的消息
        {
            path: [
                'msg',
                'msg/:action',
                'msg/:action/:uid'
            ],
            viewUrl: 'user/msg.html',
            scripts: 'user/msg.js',
            modules: 'm.msg'
        },
        {
            path: [
                'interactive',
                'interactive/:action',
                'interactive/:action/:id'
            ],
            viewUrl: 'class/interactive.html',
            scripts: [
                '/dist/js/config/app.emojis.min',
                'class/interactive.js'
            ],
            modules: 'm.interactive'
        },
        {
            path: 'subject/:action',
            viewUrl: 'student/subject.html',
            scripts: 'student/subject.js',
            modules: 'm.subject'
        },
        {
            path: [
                'leave',
                'leave/:id'
            ],
            viewUrl: 'student/leave.html',
            scripts: 'student/leave.js',
            modules: 'm.leave'
        },
        {
            path: [
                'recipe',
                'recipe/:action/:id'
            ],
            viewUrl: 'school/recipe.html',
            scripts: [
                '/assets/js/core/utils.min',
                'school/recipe.js'
            ],
            modules: ['m.recipe', 'm.utils']
        },
        {
            path: 'recipe/:action',
            viewUrl: 'school/recipe.html',
            scripts: [
                '/assets/js/core/utils.min',
                'school/recipe.js'
            ],
            modules: ['m.recipe', 'm.utils']
        },
        /*作业模块*/
        {
            path: [
                'homework',
                'homework/:classid'
            ],
            viewUrl: 'homework/list.html',
            scripts: 'homework/homework.js',
            modules: 'm.homework'
        },
        {
            path: 'homework/detail/:id',
            viewUrl: 'homework/detail.html',
            scripts: [
                'homework/homework.js'
            ],
            modules: ['m.homework']
        },
        {
            path: 'homework/:classid/publish',
            viewUrl: 'homework/publish.html',
            scripts: ['homework/homework.js','/assets/js/core/utils.min'],
            modules: ['m.homework', 'm.utils']
        },
        {
            path: 'homework/submit/:id',
            viewUrl: 'homework/submit.html',
            scripts: ['homework/homework.js','/assets/js/core/utils.min'],
            modules: ['m.homework', 'm.utils']
        },
        {
            path: ['attendance','attendance/:classid','attendance/:classid/:studentid'],
            viewUrl: 'attendance/listCount.html',
            scripts: 'attendance/listCount.js',
            modules: 'm.attendance'
        },
        { 
            path: 'feedback',
            viewUrl: 'feedback/feedbackSubmit.html',
            scripts: ['feedback/feedbackSubmit.js','/assets/js/core/utils.min'],
            modules: ['m.feedback','m.utils']
        },
        {             
            path: [
                'knowledge',
                'knowledge/:action',
                'knowledge/:action/:id',
                'knowledge/:id'
            ],
            viewUrl: 'school/knowledge.html',
            scripts: ['school/knowledge.js'],
            modules: ['m.knowledge'] 
        }
    ];

}());
