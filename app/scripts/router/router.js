define([
    'vue',
    'translation',
    'dataHandler',
    'componentCollection',
    'tourGuide',
    '../views/home/default',
    '../views/settings/default',
    '../views/help/default',
    '../views/notfound/default',
    '../views/translation/default',
], function(Vue, TranslationHandler, DataHandler, ComponentCollection, TourGuide, HomeView, SettingsView, HelpView, NotfoundView, TranslationView) {
    'use strict';

    var app = {
        vue: {},
        routes: ['home', 'settings', 'help', 'notfound', 'translation'],

        init: function(){
            var that = this;

            this.vue = new Vue({
                el: '#app',
                data: {
                    currentView: that.getRoute(),
                    routes: that.routes
                }
            });

            // set system admin, if not set yet
            DataHandler.checkUser(that.getRoute());

            this.setEventlistener();
            this.initMainNavigation();

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
                that.removeInitialLoaderAnimation();
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
                    DataHandler.getCurrentlyPlayingTrack(route);
                    DataHandler.getUserPlaylist(route);
                    // ----------------------
                    // ONLY TESTING STUFF !!
                    // ----------------------
                    // fill tour points in and set options
                    // --> data is selcted in tour guide
                    // TourGuide.fillTourData('uploadTrack', 'interactive');
                    // // TourGuide.fillTourData('downvoteTrackAndDjImage', 'text');
                    
                    // // initialize tour with tour points and options
                    // TourGuide.init();
                    // // start
                    // TourGuide.start();
                    break;
 
                case 'settings':
                    DataHandler.getUserImage(route);
                    DataHandler.getInternetAccess(route);
                    DataHandler.getDownvoteLevel(route);
                    break;
 
                case 'help':
                    break;
 
                case 'notfound':
                    break;
 
                case 'translation':
                    break;
 
                default:
            }

            // because of websocket
            // --> ws can only answer after request
            // server send event doesn‘t fit in our web app context
            DataHandler.checkForNewUpdates(route);



        },

        getBrowserLanguage: function(){
            var that = this;
            // safari (mac osx) de-de en-us , chrome de en (mac osx), firefox de en (mac osx), firefox (linux) en-US de-DE
            // chrome (linux) en-US de-DE , firefox (win) de en, chrome (win) de en, ie (win) de-DE en-US
            var lang = window.navigator.userLanguage || window.navigator.language;
            lang = lang.substr(0, 2).toLowerCase();
            this.translateCurrentView(lang);

            // set language in data handler
            DataHandler.currentLanguage = lang;
        },

        translateCurrentView: function(lang){
            var that = this;
            TranslationHandler.translate(lang, ComponentCollection.getComponent(that.vue.$data.currentView));
        },

        initMainNavigation: function(){
            var that = this;
            var route = this.getRoute();
            var mainNavigation = $('#navigation');
            var allMainNavigationItems = mainNavigation.find('li');

            if(allMainNavigationItems !== 'undefined'){
                // set init navigation state
                // based on route
                allMainNavigationItems.addClass('inactive');
                allMainNavigationItems.find('a[data-route=' + route + ']').parents('li').addClass('active').removeClass('inactive');
                
                // needed for different background-colors
                // --> there is no other possibility, otherwise feel free to change it ;-)
                if(route === 'help'){
                    allMainNavigationItems.eq(1).addClass('second');
                    mainNavigation.addClass('last');
                }

                // add click eventlistener
                allMainNavigationItems.on('click', function(e){
                    route = $(this).find('a').attr('data-route');

                    mainNavigation.removeClass('last');
                    allMainNavigationItems.removeClass('second active inactive').addClass('inactive');
                    $(this).removeClass('inactive').addClass('active');
                    
                    // needed for different background-colors
                    // --> there is no other possibility, otherwise feel free to change it ;-)
                    if(route === 'help'){
                        allMainNavigationItems.eq(1).addClass('second');
                        mainNavigation.addClass('last');
                    }
                });
            } else {
                this.initMainNavigation();
            }
        },

        loader: '',
        removeInitialLoaderAnimation: function(){
            clearTimeout(this.loader);
            // timeout it‘s only for user experience
            // --> system is already ready
            this.loader = setTimeout(function(){
                $('#inital-loader-wrapper').addClass('fadeOut');
            }, 200);
        }

    };


    app.init();

});
