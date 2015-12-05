// Filename: router.js
define([], function() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            'index': 'index'
         
        },
        index: function() {
            require(['./lib/view/index'], function(LoginView) {
                //var loginView = viewsmanager.create("loginView", LoginView);
                LoginView.render();
            });
        },
      


   /* Backbone.history.on('route', function(r, u) {
        if (['login'].indexOf(u) !== -1) {
            $(".nav").hide();
        } else {
            $(".nav").show();
        }
    });*/
    return AppRouter;
});
