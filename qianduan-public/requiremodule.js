var require = require('../plugin/require.js');

require.config({
	 shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'foo': {
            deps: ['bar'],
            exports: function (bar) {
                //Using a function allows you to call noConflict for libraries
                //that support it. However, be aware that plugins for those
                //libraries may still want a global.
                return this.Foo.noConflict();
            }
        }
    }
})