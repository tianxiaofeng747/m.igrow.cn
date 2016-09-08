'use strict';

/*
 * default actions:
 * [
 *      get: { method: 'GET' },
 *      list: { method: 'GET' },
 *      search: { method: 'GET' },
 *      set: { method: 'POST' },
 *      create: { method: 'POST' },
 *      update: { method: 'POST' },
 *      remove: { method: 'POST' } // remove will be convert -> delete,
 *      'delete': { method: 'POST' }
 * ]
 * service:
 * name : [url{String}, paramDefaults{Object}|null, actions{Object}|null, options{Object}|null]
 */

IGrow.Config.service = {
    school: ['/api/school', , { get: { cache: true } }],
    schoolgrade: ['school/grade', , { list: { cache: true } }],
    schoolStudent: ['school/student', , { list: { cache: true } }],
    schoolStudentGroup: ['school/studentgroup', , {
        list: { cache: true },
        studentlist : {url:'school/studentgroup/student/list'}
    }],
    schoolTeacher: ['school/teacher', , { list: { cache: true } }],
    schoolTeacherClass: ['school/teacher/class', , { list: { cache: true } }],
    schoolTeacherGroup: ['school/teachergroup', , { list: { cache: true } }],
    schoolTeacherStudentGroup: ['school/teacher/studentgroup', , { list: { cache: true } }],
    schoolClass: ['school/class', , {
        get: { cache: true },
        list: { cache: true }
    }],
    schoolClassStudent: ['school/class/student', , { list: { cache: true } }],
    schoolClassTeacher: ['school/class/teacher', , { list: { cache: true } }],
    schoolClassClassmaster: ['school/class/classmaster', , { list: { cache: true } }],
    notification: ['notification', , {
        push: {},
        send: { url: 'notification/pm/send', method: 'POST' },
        read: { url: 'notification/pm/read' },
        chat: { url: 'notification/pm/chat/get' },
        stat: { url: 'notification/pm/unread/stat' },
        group: { url: 'notification/pm/group' }
    }],
    yoSchoolnotice: ['yo/schoolnotice'],
    yoClassalbum: ['yo/classalbum'],
    yoFineArticle: ['yo/fine/article'],
    yoPhoto: ['yo/photo'],
    yoAlbum: ['yo/album'],
    yoClassNews: ['yo/class/news'],
    yoClassStar: ['yo/class/star'],
    yoClassProfile: ['yo/class/profile'],
    yoClassNotice: ['yo/class/notice'],
    yoStudentWork: ['yo/student/work', , {
        submitwork: { method: 'POST' }
    }],
    yoStudentAbsent: ['yo/student/absent'],
    yoScore: ['yo/score'],
    yoRecipe: ['yo/recipe',,{
        relationlist:{}
    }],
    yoExam: ['yo/exam'],
    yoSyllabusBase:['yo/syllabus/base'],
    yzoneSubject: ['yzone/subject', , {
        //接口权限公开(list需要指定schoolid)
        proxyGet: { url: '/api/proxy/yzone/subject/get' },
        proxyList: { url: '/api/proxy/yzone/subject/list' }
    }],
    yzoneCategory: ['yzone/category', , {
        //接口权限公开(list需要指定schoolid)
        proxyGet: { url: '/api/proxy/yzone/category/get' },
        proxyList: { url: '/api/proxy/yzone/category/list' }
    }],
    sms: ['sms', , {
        send: { method: 'POST' },
        sendlist: {}
    }],
    wx: ['business/wx', , {
        push: {}
    }],
    userRole: ['auth/user/role'],
    //(获取家长版收件箱发件箱列表)
    businessMessage: ['business/message', , { receivelist: {},confirm:{},senddetail:{params: {_relatedfields:'people.*',_pagesize:1000}} }],
    authitem: ['auth/merged/user/authitem', , { check: { cache:true} }],
    //作业模块
    yoHomeWork: ['yo/home/work'],
    yoCourse: ['yo/course', , {
        list: { cache: true },
        relationcourse : {url:'yo/course/property/relationcourse'}
    }],
    yoClassCourse: ['yo/class/course', , {
        teachercourse: { cache: false },
        teacherclass: { cache: false },
        wxcreate: { method: 'POST' }
    }],
    yoAttend :['yo/attend',,{
        total:{
            cache: true
        },
        studentDetail:{
            url:'yo/student/attend/detail/list'
        },
        teacherDetail:{
            url:'yo/teacher/attend/detail/list'
        },
        schooltotal:{}
    }],
    yoBusiness:['business/wx',,{
        allow:{
            cache: true
        }
    }],
    userAdvise:['crm/advise'],
    childclassCategories:['yo/childclass/categories', , { list: { cache: true } }],
    childclassPosts:['yo/childclass/posts', , { list: { cache: true } }],
    schoolNew:['yo/schoolnew',,{
        get:{
            url:'/api/proxy/yo/schoolnew/get',
        },
        list:{
            url:'/api/proxy/yo/schoolnew/list',
        }
    }],
    interact:['notification',,{
        commentList:{
            url:'notification/comment/list'
        },
        reply:{
            url:'notification/msg/group/reply'
        },
        praise: {method: 'POST'},
        send:{
            url:'notification/msg/group/send'
        }
    }]
};
