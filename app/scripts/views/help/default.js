define([
    'vue',
    'componentCollection',
    'tourGuide',
    'text!../../templates/help/default.html'
], function(Vue, ComponentCollection, TourGuide, DefaultTemplate) {
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
                    // fill tour points in and set options
                    // --> data is selected in tour guide
                    TourGuide.fillTourData('uploadTrack', 'interactive');
                    // initialize tour with tour points and options
                    TourGuide.init();

                    // trigger click event
                    $('#navigation > li > a[data-route=home]').click();

                } else {
                    // fill tour points in and set options
                    // --> data is selected in tour guide
                    TourGuide.fillTourData('uploadTrack', 'text');
                    // initialize tour with tour points and options
                    TourGuide.init();

                    // trigger click event
                    $('#navigation > li > a[data-route=home]').click();
                }

            }
        }

    });

});
