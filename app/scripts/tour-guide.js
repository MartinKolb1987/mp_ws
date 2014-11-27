define([
], function() {
    'use strict';

    // --------------------------
    // useable tour function
    // --------------------------
    // tourGuide.fill( fill in tour points as an array, options);
    // tourGuide.init(); // activate tour guide
    // tourGuide.start(); // trigger manual start (only needed if tourguide is on the same site), otherwise every TourGuide.checkTourGuideModeStatus() is triggerd automatically
    // tourGuide.next(); // go to next tour point
    // tourGuide.prev(); // go to prev tour point
    // tourGuide.stop(); // stop guide and remove hooked markup
    // --------------------------

    var tourGuide = {

        // tour guide
        // --------------------------
        isTourGuideModeActive: false,
        tourPoints: [],
        options: {},

        // current tour guide states
        // --------------------------
        isTourActive: false,
        currentTourPoint: 0,
        countedTourPoints: 0,
        
        // set tour data
        // --------------------------
        fill: function(tourPoints, options){
            // initialize data
            this.isTourGuideModeActive = false;
            this.tourPoints = tourPoints;
            this.options = options;
            this.isTourActive = false;
            this.currentTourPoint = 0;
            this.countedTourPoints = tourPoints.length;
        },

        init: function(){
            this.isTourGuideModeActive = true;
        },

        // control functions
        // --------------------------
        start: function(){
            this.checkTourGuideModeStatus();
        },

        stop: function(){
            this.stopGuide();
        },

        next: function(){
            this.currentTourPoint++;
            console.log('next point');
        },

        prev: function(){
            this.currentTourPoint--;
            console.log('prev point');

        },

        startGuide: function(){
            var that = this;
            this.isTourActive = true;

            // add tour guide markup
            $('body').append(that.options.tourGuideWrapper);
            
            // ux feeling
            setTimeout(function(){
                $('#tour-guide-overlay').addClass('fadeIn');
            }, 700);

            console.log('start tour');

            this.renderNeededTourPoint();
        },

        stopGuide: function(){
            this.isTourActive = false;
            this.isTourGuideModeActive = false;

            $('#navigation > li > a[data-route=help]').click();
            
            // ux feeling
            setTimeout(function(){
                // fade tour guide out
                $('#tour-guide-overlay').removeClass('fadeIn');
            }, 400);

            // ux feeling
            setTimeout(function(){
                // clean needed tour guide markup from dom
                $('#tour-guide-overlay').remove();
            }, 1000);

            console.log('stop tour');
        },

        // current tour guide states
        // --------------------------
        checkTourGuideModeStatus: function(){
            if(this.isTourGuideModeActive === true){
                this.checkTourStatus();
            }
        },

        checkTourStatus: function(){
            // check if tour already running
            // --> otherwise start it
            if(this.isTourActive === true){
                this.next();
            } else {
                this.startGuide();
            }
        },

        // set eventlistener
        // --------------------------
        setEventlistener: function(){
            var that = this;

            // close whole tour guide
            var closeButton = $('#close-tour-guide');
            closeButton.unbind('click');
            closeButton.on('click', function(){
                that.stop();
            });
        
        },

        // helper functions
        // --------------------------
        highliteElements: function(){
            // extract only elements which should be shown
        },

        renderNeededTourPoint: function(){


            this.setEventlistener();

        }

    };

    return tourGuide;

});
