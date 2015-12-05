var sites = require('../../app/controllers/sites');
module.exports = function(app, auth) {
    //用户登陆场成功后，显示site文档相关信息
    app.get('/u/getsites', auth.requiresLogin, sites.getSiteList);
    //得到某个siteID,得到此site对应的信息
    //  app.get('/u/getsiteInfo', auth.requiresLogin, sites.getsiteinfo);
    //创建项目
    app.post('/u/sites/createdSite', auth.requiresLogin, sites.createSite);
    //检测这个站是否可用
    //  app.get('/u/sites/hostDetect', auth.requiresLogin, sites.hostDetect);
    //手动同步
    app.get('/download', auth.requiresLogin, sites.download);
    //更改适配状态
    app.post('/u/sites/noconvert', auth.requiresLogin, sites.noconvert);
    //获得当前用户所有操作日志
    app.get('/u/sites/getlogs', auth.requiresLogin, sites.getlogs);
    //获得日志分页接口
    app.get('/u/sites/logcount', auth.requiresLogin, sites.logCount);
    //获取适配服务器状态
    app.get('/testhost', auth.requiresLogin, sites.hostTest);
};
