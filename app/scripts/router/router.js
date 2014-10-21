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
            that.getLanguage();

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

            // triggerd from component-collection.js
            window.addEventListener('collectionChanged', function (e) {
                that.getLanguage();
            }, false);

        },

        getLanguage: function(){
            var that = this;
            // safari (mac osx) de-de en-us , chrome de en (mac osx), firefox de en (mac osx), firefox (linux) en-US de-DE
            // chrome (linux) en-US de-DE , firefox (win) de en, chrome (win) de en, ie (win) de-DE en-US
            var autoLang = window.navigator.userLanguage || window.navigator.language;
            autoLang = autoLang.substr(0, 2).toLowerCase();

            TranslationHandler.translate(autoLang, ComponentCollection.getComponent(that.vue.$data.currentView));
        }
    };


    app.init();

});
