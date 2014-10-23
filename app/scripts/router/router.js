define([
    'vue',
    'translation',
    'dataHandler',
    'componentCollection',
    '../views/home/default',
    '../views/notfound/default',
    '../views/translation/default'
], function(Vue, TranslationHandler, DataHandler, ComponentCollection, HomeView, NotfoundView, TranslationView) {
    'use strict';

    var app = {
        initialStart: true,
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

            // triggerd from component-collection.js
            // it‘s important because $data for every component
            // must be ready to work with 2 way databinding 
            window.addEventListener('collectionChanged', function (e) {
                that.afterCareCollectionChanged();
            }, false);

            // triggerd from data-handler.js
            window.addEventListener('dataHandlerIsReady', function (e) {
                that.afterCareCollectionChanged();
            }, false);

        },

        afterCareCollectionChanged: function(){
            var that = this;
            var route = this.vue.currentView;
            
            this.getBrowserLanguage();
            
            // check and load which data is needed
            // --> based on current route
            switch(route){
                case 'home':
                    DataHandler.checkForNewUpdates(route);
                    break;
                case 'notfound':
                    break;
                case 'translation':
                    break;
                default:
            }

        },

        getBrowserLanguage: function(){
            var that = this;
            // safari (mac osx) de-de en-us , chrome de en (mac osx), firefox de en (mac osx), firefox (linux) en-US de-DE
            // chrome (linux) en-US de-DE , firefox (win) de en, chrome (win) de en, ie (win) de-DE en-US
            var lang = window.navigator.userLanguage || window.navigator.language;
            lang = lang.substr(0, 2).toLowerCase();
            this.translateCurrentView(lang);
        },

        translateCurrentView: function(lang){
            var that = this;
            TranslationHandler.translate(lang, ComponentCollection.getComponent(that.vue.$data.currentView));
        }

    };


    app.init();

});
