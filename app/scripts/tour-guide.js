define([
    'text!tour-guide/upload-track.json',
    'text!tour-guide/downvote-track-and-dj-image.json',
], function(TourGuideUploadTrackData, TourGuideDownvoteTrackAndDjImageData) {
    'use strict';

    // --------------------------
    // useable tour functions
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

        // default data & options
        // --------------------------
        tourGuideAppend: '#app',
        tourGuideDefaultStructure: '',
        tourGuideOverlayTarget: '#tour-guide-overlay',

        tourGuideTitleContent: 'No tour guide title',
        tourGuideTitleTarget: '#tour-guide-title',
        
        tourGuideCloseContent: 'x',
        tourGuideCloseTarget: '#tour-guide-close',

        tourGuideNextContent: '>',
        tourGuideNextTarget: '#tour-guide-next',

        tourGuidePrevContent: '<',
        tourGuidePrevTarget: '#tour-guide-prev',

        tourGuidePaginationContent: '%from% / %to%',
        tourGuidePaginationTarget: '#tour-guide-pagination',
        
        fadeInTourGuide: false,
        fadeOutTourGuide: false,

        preloadNextTourGuide: '',
        nextTourGuideButtonContent: 'Next Chapter',

        tourGuideHint: '#tour-guide-hint',

        // set tour data
        // --------------------------
        fill: function(tourPoints, options){
            // set tour guide data
            this.isTourGuideModeActive = false;
            this.tourPoints = tourPoints;
            this.options = options;
            
            // set tour data
            this.isTourActive = false;
            this.currentTourPoint = 0;
            this.countedTourPoints = tourPoints.length;

            // set options
            this.tourGuideAppend = '';
            this.tourGuideAppend = (options.tourGuideAppend === undefined) ? this.tourGuideAppend : options.tourGuideAppend;
            this.tourGuideDefaultStructure = '';
            this.tourGuideDefaultStructure = (options.tourGuideDefaultStructure === undefined) ? this.tourGuideDefaultStructure : options.tourGuideDefaultStructure;
            this.tourGuideOverlayTarget = '';
            this.tourGuideOverlayTarget = (options.tourGuideOverlay === undefined) ? this.tourGuideOverlayTarget : options.tourGuideOverlay.target;
            
            this.tourGuideTitleContent = '';
            this.tourGuideTitleContent = (options.tourGuideTitle === undefined) ? this.tourGuideTitleContent : options.tourGuideTitle.content;
            this.tourGuideTitleTarget = '';
            this.tourGuideTitleTarget = (options.tourGuideTitle === undefined) ? this.tourGuideTitleTarget : options.tourGuideTitle.target;
            
            this.tourGuideCloseContent = '';
            this.tourGuideCloseContent = (options.tourGuideClose === undefined) ? this.tourGuideCloseContent : options.tourGuideClose.content;
            this.tourGuideCloseTarget = '';
            this.tourGuideCloseTarget = (options.tourGuideClose === undefined) ? this.tourGuideCloseTarget : options.tourGuideClose.target;

            this.tourGuideNextContent = '';
            this.tourGuideNextContent = (options.tourGuideNext === undefined) ? this.tourGuideNextContent : options.tourGuideNext.content;
            this.tourGuideNextTarget = '';
            this.tourGuideNextTarget = (options.tourGuideNext === undefined) ? this.tourGuideNextTarget : options.tourGuideNext.target;

            this.tourGuidePrevContent = '';
            this.tourGuidePrevContent = (options.tourGuidePrev === undefined) ? this.tourGuidePrevContent : options.tourGuidePrev.content;
            this.tourGuidePrevTarget = '';
            this.tourGuidePrevTarget = (options.tourGuidePrev === undefined) ? this.tourGuidePrevTarget : options.tourGuidePrev.target;
 
            this.tourGuidePaginationContent = '';
            this.tourGuidePaginationContent = (options.tourGuidePagination === undefined) ? this.tourGuidePaginationContent : options.tourGuidePagination.content;
            this.tourGuidePaginationTarget = '';
            this.tourGuidePaginationTarget = (options.tourGuidePagination === undefined) ? this.tourGuidePaginationTarget : options.tourGuidePagination.target;

            this.fadeInTourGuide = '';
            this.fadeInTourGuide = (options.fadeInTourGuide === undefined) ? this.fadeInTourGuide : options.fadeInTourGuide;
            this.fadeOutTourGuide = '';
            this.fadeOutTourGuide = (options.fadeOutTourGuide === undefined) ? this.fadeOutTourGuide : options.fadeOutTourGuide;
            
            this.preloadNextTourGuide = '';
            this.preloadNextTourGuide = (options.preloadNextTourGuide === undefined) ? this.preloadNextTourGuide : options.preloadNextTourGuide;
            this.nextTourGuideButtonContent = '';
            this.nextTourGuideButtonContent = (options.nextTourGuideButtonContent === undefined) ? this.nextTourGuideButtonContent : options.nextTourGuideButtonContent;

            this.tourGuideHint = '';
            this.tourGuideHint = (options.tourGuideHint === undefined) ? this.tourGuideHint : options.tourGuideHint;
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
            if(this.isTourGuideModeActive === true){
                this.currentTourPoint++;
                this.renderTourPointView();
                console.log('next point');
            }
        },

        prev: function(){
            if(this.isTourGuideModeActive === true){
                this.currentTourPoint--;
                this.renderTourPointView();
                console.log('prev point');
            }
        },

        startGuide: function(){
            var that = this;
            this.isTourActive = true;

            // add tour guide markup (default structure)
            $(that.tourGuideAppend).append(that.tourGuideDefaultStructure);
            this.tourGuideOverlayTarget = $(that.tourGuideOverlayTarget);

            this.tourGuideCloseTarget = $(that.tourGuideCloseTarget);
            this.tourGuideCloseTarget.html(that.tourGuideCloseContent);

            this.tourGuideTitleTarget = $(that.tourGuideTitleTarget);
            this.tourGuideTitleTarget.html(that.tourGuideTitleContent);

            this.tourGuidePrevTarget = $(that.tourGuidePrevTarget);
            this.tourGuidePrevTarget.html(that.tourGuidePrevContent);
            
            this.tourGuideNextTarget = $(that.tourGuideNextTarget);
            this.tourGuideNextTarget.html(that.tourGuideNextContent);

            this.tourGuidePaginationTarget = $(that.tourGuidePaginationTarget);
            this.tourGuidePaginationTarget.html(that.tourGuidePaginationContent);
            
            this.tourGuideHint = $(that.tourGuideHint);

            // fade guide in or not
            if(this.fadeInTourGuide === true){
                setTimeout(function(){
                    $('#tour-guide-overlay').fadeIn();
                }, 1000);
            } else {
                $('#tour-guide-overlay').show();
            }

            console.log('start tour');
            this.renderTourPointView();
        },

        stopGuide: function(){
            var that = this;
            this.isTourActive = false;
            this.isTourGuideModeActive = false;

            $('#navigation > li > a[data-route=help]').click();
            
            // ux feeling

            // fade guide out or not
            if(this.fadeOutTourGuide === true){
                setTimeout(function(){
                    that.tourGuideOverlayTarget.fadeOut();
                }, 400);
                setTimeout(function(){
                    // clean needed tour guide markup from dom
                    that.tourGuideOverlayTarget.remove();
                }, 1000);
            } else {
                that.tourGuideOverlayTarget.remove();
            }

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
            var closeButton = $(that.tourGuideCloseTarget);
            closeButton.unbind('click');
            closeButton.on('click', function(){
                that.stop();
            });

            // close whole tour guide
            this.tourGuideCloseTarget.unbind('click');
            this.tourGuideCloseTarget.on('click', function(){
                that.stop();
            });

            // next point
            this.tourGuideNextTarget.unbind('click');
            this.tourGuideNextTarget.on('click', function(){
                that.next();
            });

            // prev point
            this.tourGuidePrevTarget.unbind('click');
            this.tourGuidePrevTarget.on('click', function(){
                that.prev();
            });
        
        },

        // helper functions
        // --------------------------
        renderTourPointView: function(){
            var that = this;
            var currentTourPointData = this.tourPoints[that.currentTourPoint];
            var lastIndexFromTourPoints = this.countedTourPoints - 1;
            
            // next chapter exists 
            // --> fill new tour guide data in
            // --> start next tour
            // -----------------------------------
            if(this.currentTourPoint > lastIndexFromTourPoints){
                this.fillTourData(this.preloadNextTourGuide);
                this.init();
                this.start();
                return true;
            }

            // hide and show NEXT button
            // -----------------------------------
            if(this.currentTourPoint === lastIndexFromTourPoints){

                // fill next tour guide data in
                if(this.preloadNextTourGuide.length > 0){
                    this.tourGuideNextTarget.html(that.nextTourGuideButtonContent);
                    console.log('init next chapter');
                } else {
                    console.log('there is no next chapter');
                    this.tourGuideNextTarget.hide();
                }

            } else {
                this.tourGuideNextTarget.html(that.tourGuideNextContent);
                this.tourGuideNextTarget.show();
            }

            // hide and show PREV button
            // -----------------------------------
            if(this.currentTourPoint === 0){
                this.tourGuidePrevTarget.hide();
            } else {
                this.tourGuidePrevTarget.show();
            }

            // render info box content
            // -----------------------------------
            var infoTarget = $(currentTourPointData.info.target);
            var infoContent = currentTourPointData.info.content;
            if(currentTourPointData.info.positionCss !== undefined){
                var infoStructure = this.splitData(currentTourPointData.info.positionCss);
                var infoCssPosition = infoStructure[0]; // top, bottom
                var infoCssPositionUnit = infoStructure[1]; // e.g. 50px
                var infoCssHeight = infoStructure[2]; // height
                var infoCssHeightUnit = infoStructure[3]; // e.g. 20vh
                if(infoCssPosition === 'top'){
                    infoTarget.css({'top': infoCssPositionUnit, 'bottom': 'initial', 'height': infoCssHeightUnit});
                } else if(infoCssPosition === 'bottom'){
                    infoTarget.css({'bottom': infoCssPositionUnit, 'top': 'initial', 'height': infoCssHeightUnit});
                }
            }

            infoTarget.html(infoContent);

            // render pagination
            // -----------------------------------
            var parsedPagination = this.parsePagination();
            this.tourGuidePaginationTarget.html(parsedPagination);

            // highlight elements if exists
            // -----------------------------------
            this.highlightElements(currentTourPointData);

            // set all needed click events
            // -----------------------------------
            this.setEventlistener();

        },

        highlightElements: function(currentTourPointData){
            var that = this;
            
            // elements
            var element = '';
            var hint = '';
            var position = '';
            var highlightElementData = '';
            var hintElement = $('#tour-guide-hint');

            // find all highlighted elements and remove class
            $('.tour-guide-highlight-element').removeClass('tour-guide-highlight-element');

            // hide hint element
            this.tourGuideHint.hide();

            // check if elements to highlight exists
            if(currentTourPointData.elements !== undefined ){
                $.each(currentTourPointData.elements, function(innerKey, innerValue){
                    highlightElementData = that.splitData(innerValue);
                    element = highlightElementData[0];
                    
                    if(highlightElementData[1] !== undefined && highlightElementData[2] !== undefined){
                        hint = highlightElementData[1];
                        position = highlightElementData[2];
                        // user playlist is rendering
                        // give it some time
                        setTimeout(function(){
                            var offset = $(element).offset();

                            // add hint
                            if(position === 'top'){
                                that.tourGuideHint.css({'top': (offset.top - 10), 'left': offset.left});
                                that.tourGuideHint.html('&#9660;');
                            } else if(position === 'bottom'){
                                that.tourGuideHint.css({'top': offset.top, 'left': offset.left});
                                that.tourGuideHint.html('&#9650;');
                            }

                            that.tourGuideHint.fadeIn(1000);
                        }, 100);
                            
                        
                    }

                    $(element).addClass('tour-guide-highlight-element');

                });
            }

        },

        splitData: function(innerValue){
            return innerValue.split('::');
        },

        parsePagination: function(){
            var that = this;
            return this.tourGuidePaginationContent.replace('%from%', (that.currentTourPoint + 1)).replace('%to%', that.countedTourPoints);
        },

        // tour data filler
        // --------------------------
        fillTourData: function(route){
            var that = this;
            var tourGuideObject = {};

            switch(route){
                case 'uploadTrack':
                    tourGuideObject = JSON.parse(TourGuideUploadTrackData);
                    // fill tour points in and set options
                    that.fill(tourGuideObject.tourPoints, tourGuideObject.options);
                    break;
            
                case 'downvoteTrackAndDjImage':
                    tourGuideObject = JSON.parse(TourGuideDownvoteTrackAndDjImageData);
                    // fill tour points in and set options
                    that.fill(tourGuideObject.tourPoints, tourGuideObject.options);
                    break;
            
            
                default:
            }

        }

    };

    return tourGuide;

});
