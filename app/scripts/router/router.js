define([
    'vue',
    'translation',
    'componentCollection',
    '../views/home/default',
    '../views/notfound/default',
    '../views/translation/default'
], function(Vue, TranslationHandler, ComponentCollection, HomeView, NotfoundView, TranslationView) {
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
            this.getLanguage();
        },

        getRoute: function(){
            var path = location.hash.replace(/^#!\/?/, '') || 'home';
            return this.routes.indexOf(path) > -1 ? path : 'notfound';
        },

        setEventlistener: function(){
            var that = this;
            window.addEventListener('hashchange', function () {
                that.vue.currentView = that.getRoute();
                that.getLanguage();
            });
        },

        getLanguage: function(){
            var that = this;
            var language = window.navigator.userLanguage || window.navigator.language;
            console.log('render');
            // TranslationHandler.translate('de', ComponentCollection.getComponent('home'));
            TranslationHandler.translate('de', ComponentCollection.getComponent(that.vue.$data.currentView));
        }
    };


    app.init();

});
