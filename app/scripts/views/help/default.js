define([
    'vue',
    'componentCollection',
    'tourGuide',
    'text!../../tour-guide/interactive.json',
    'text!../../templates/help/default.html'
], function(Vue, ComponentCollection, TourGuide, TourGuideInteractive, DefaultTemplate) {
    'use strict';

    Vue.component('help', {
        el: '#help',
        template: DefaultTemplate,

        ready: function () {
            ComponentCollection.addComponent('help', this.$data);
            // check if tour guide should be shown or not
            TourGuide.checkTourGuideModeStatus();
        },

        methods: {
            startTutorial: function(type){
                var that = this;
                var tourGuideObject = {};

                if(type === 'interactive'){
                    
                    tourGuideObject = JSON.parse(TourGuideInteractive);
                    // fill tour points in and set options
                    TourGuide.fill(tourGuideObject.tourPoints, tourGuideObject.options);
                    // initialize tour with tour points and options
                    TourGuide.init();

                    // trigger click event
                    $('#navigation > li > a[data-route=home]').click();

                } else {
                    // TourGuide.fill(); // fill tour points in and set options
                    TourGuide.init(); // initialize tour with tour points and options
                }

            }
        }

    });

});
