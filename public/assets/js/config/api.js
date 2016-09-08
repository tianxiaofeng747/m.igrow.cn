/*
    全局 api 配置 
    请求地址:version + api
    @params
        demo:'统一本地资源前缀'
        host:'http://api.igrow.com'
        version:''  
        mode: 'server' or 'demo' or '' 。 'server':全局使用服务器接口,'demo':全局使用本地模拟数据,'':根据匹配到的api具体配置
 */
(function(){
    window.API = {
        host:'http://' + location.host,
        version:'/api/1.1b',
        demo:'/api',
        mode:'server',
        map:{
            '/school/semester/list':{
                mode:'demo',
                description:''
            },
            '/school/class/teacher/list':{
                mode:'demo',
                description:''
            },
            '/school/student/get':{
                mode:'demo',
                description:''
            },
            '/school/class/get':{
                mode:'demo',
                description:''
            },
            '/user/get':{
                mode:'demo',
                description:''
            },
            '/yo/syllabus/get':{
                mode:'demo',
                description:''
            },
            '/yo/useralbum/list':{
                mode:'demo',
                description:''
            },
            '/yo/photo/list':{
                mode:'demo',
                description:''
            },
            '/yo/album/get':{
                mode:'demo',
                description:''
            }
            
        }
    };
})();
    