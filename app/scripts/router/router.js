define([
	'vue',
	'../views/home/default',
	'../views/notfound/default',
    '../views/translation/default',
], function(Vue, HomeView, NotfoundView, TranslationView) {
    'use strict';

    var app = {
        vue: {},
        routes: ['home', 'notfound', 'translation'],

        init: function(){
            var that = this;

            this.vue = new Vue({
                el: '#app',
                data: {
                    currentView: that.getRoute(),
                    routes: that.routes
                }
            });

            this.setEventlistener();

        },

        getRoute: function(){
            var path = location.hash.replace(/^#!\/?/, '') || 'home';
            return this.routes.indexOf(path) > -1 ? path : 'notfound';
        },

        setEventlistener: function(){
            var that = this;
            window.addEventListener('hashchange', function () {
                that.vue.currentView = that.getRoute();
            });
        }
    };

    app.init();

});
