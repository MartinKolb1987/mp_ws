define([
    'error',
    'debug',
    'translation',
    'componentCollection',
    'tourGuide'
], function(ErrorHandler, DebugHandler, TranslationHandler, ComponentCollection, TourGuide) {
    'use strict';

    var dataHandler = {

        // ------------------------------------------------------------
        // custom settings
        // ------------------------------------------------------------
        
        // websocket
        websocketHost: 'ws://localhost:54321',
        checkForNewUpdatesIntervalTimeWebsocket: 2000, // milliseconds
        
        // xhr
        regularHost: '../server/core/client.php',
        checkForNewUpdatesIntervalTimeXHR: 4000, // milliseconds

        // transition timeout dj image change
        currentlyPlayingDjImageChangeTimeout: 600, // milliseconds


        // ------------------------------------------------------------
        // state variables – just for music system info
        // --> what track is playing, how looks user playlist, etc.
        // ------------------------------------------------------------

        currentLanguage: 'de', // router takes care of it and set default lang based on browser language

        // after care
        checkIfAppIsWorkingTimeout: 5000,

        // websocket
        isWebsocketActive: false,

        // short polling
        isShortPollingActive: false,
        
        // xhr and websocket request queue
        sendDataRequestByRequestDelay: 10, // milliseconds (take care of requests)

        // current music player system infos
        lastPlayedTrackId: 0,
        currentlyPlayingTrackId: 0,
        currentlyPlayingDjImage: '',
        currentClientSidePlaylist: [],
        currentlyClientSideUploadingTrack: false,
        autoChangeDjImage: true,

        init: function(){
            var that = this;
            this.checkWebsocket();
            this.checkIfAppIsWorking();
        },

        // -----------------------------------------------------------
        // AFTER CARE CHECK
        // -----------------------------------------------------------

        checkIfAppIsWorking: function(){
            var that = this;
            
            setTimeout(function(){

                // check if websocket is ready, otherwise do short polling manually
                if(that.isWebsocketActive === false){
                    if(that.isShortPollingActive === false ){
                        that.initShortPolling();
                        if(DebugHandler.isActive){ console.log('After care check: initShortPolling manually: Status ' + this.readyState); }
                    }
                }

                // check if user playlist on home site exists
                var isHomeSite = $('#home');
                var playlistExits = isHomeSite.find('#playlist-wrapper ul .playlist');
                
                if(isHomeSite.length > 0){
                    if(playlistExits.length === 0){
                        that.getUserPlaylist('home');
                        that.getCurrentlyPlayingTrack('home');
                        if(DebugHandler.isActive){ console.log('After care check: No playlist is rendered, do it again: Status ' + this.readyState); }
                    }
                }

            }, that.checkIfAppIsWorkingTimeout);

        },

        // -----------------------------------------------------------
        // WEBSOCKET
        // -----------------------------------------------------------

        checkWebsocket: function(){
            if(window.WebSocket){
                this.initWebsocket();
            } else {
                this.initShortPolling();
            }
        },

        websocket: {},

        initWebsocket: function(){

            var that = this;

            try{

                this.websocket = new WebSocket(that.websocketHost);

                this.websocket.onopen  = function(msg){
                    that.isWebsocketActive = true;

                    // trigger dataHandlerInitEvent if webSocket is ready to go
                    // --> event listener router.js
                    var dataHandlerEvent = document.createEvent('Event');
                    dataHandlerEvent.initEvent('dataHandlerIsReady', true, false);
                    document.dispatchEvent(dataHandlerEvent);

                    if(DebugHandler.isActive){ console.log('Websocket is established: Status ' + this.readyState); }

                };

                this.websocket.onmessage = function(msg){
                    that.getData(msg.data);
                };

                this.websocket.onclose = function(msg){
                    that.isWebsocketActive = false;
                    that.initShortPolling();
                    ErrorHandler.log('websocket is closed', new Error().stack);
                };

            } catch(error){
                that.isWebsocketActive = false;
                that.initShortPolling();
                // no websocket is available
                ErrorHandler.log('no websocket is available', new Error().stack);
            }
        },

        closeWebsocket: function(){
            this.websocket.close();
            this.websocket = '';
        },

        // -----------------------------------------------------------
        // SEND & RECEIVE DATA FROM SERVER
        // -----------------------------------------------------------
        queue: [],
        queueTimeout: '',

        sendData: function(route, type, data){
            var that = this;
            var sendData = '';
            var counter = 0;

            // build request queue
            this.queue.push({route: route, type: type, data: data});

            clearTimeout(that.queueTimeout);
            this.queueTimeout = setTimeout(function(){

                (function sendDataRequestByRequest() {

                    // take care of undefined request queues
                    if(that.queue[counter] === undefined){
                        ErrorHandler.log('counter and request queue doesn‘t fit, start request again: ' + type , new Error().stack);
                        return true;
                    }

                    // Websocket
                    // --------------------------
                    if(that.isWebsocketActive && that.queue[counter].type !== 'uploadUserImage' && that.queue[counter].type !== 'uploadUserTrack'){
                        // build json
                        sendData = {
                            route: that.queue[counter].route,
                            type: that.queue[counter].type,
                            data: that.queue[counter].data
                        };

                        // convert json to string
                        sendData = that.fromJsonToString(sendData);
                        that.websocket.send(sendData);

                        if(DebugHandler.isActive){ console.log('Send data to server via websocket: ' + sendData); }


                    // Shortpolling
                    // --------------------------
                    } else {

                        that.xhrCall(that.queue[counter].route, that.queue[counter].type, that.queue[counter].data);

                    }

                    counter++;

                    // clear request queue
                    if(counter === that.queue.length){
                        counter = 0;
                        that.queue = [];
                        return true;
                    }

                    setTimeout(function(){
                        sendDataRequestByRequest();
                    }, that.sendDataRequestByRequestDelay);

                })();

            }, 20);

        },

        getData: function(receivedData){

            // this function getData() handles response
            // data from websocket or xhr
            // --------------------------------

            receivedData = this.fromStringToJson(receivedData);
            var view = ComponentCollection.getComponent(receivedData.route);

            if(receivedData.type === 'error'){
                ErrorHandler.log(receivedData.message, receivedData.route);
                return false;
            }

            switch(receivedData.route){
                case 'home':
                    if(receivedData.type === 'checkForNewUpdates'){
                        this.responseDataCheckForNewUpdates(receivedData, view);
                    
                    } else if(receivedData.type === 'getCurrentlyPlaying'){
                        // currentlyPlaying
                        this.distributeCurrentlyPlayingTrack(receivedData, view);
                    
                    } else if(receivedData.type === 'getUserPlaylist' || receivedData.type === 'uploadUserTrack' || receivedData.type === 'deleteUserTrack' || receivedData.type === 'swapUserTrack'){
                        this.distributeUserPlaylist(receivedData, view);
                    
                    } else if(receivedData.type === 'downvoteTrack'){
                        this.distributeDownVoteTrack(receivedData, view);
                    }
                    break;

                case 'settings':
                    if(receivedData.type === 'getUserImage' || receivedData.type === 'uploadUserImage' || receivedData.type === 'deleteUserImage'){
                        this.distributeUserImage(receivedData, view);
                    
                    } else if(receivedData.type === 'getInternetAccess' || receivedData.type === 'setInternetAccess'){
                        this.distributeInternetAccess(receivedData, view);
                    
                    } else if(receivedData.type === 'getDownvoteLevel' || receivedData.type === 'setDownvoteLevel'){
                        this.distributeDownvoteLevel(receivedData, view);
                    }
                    break;
                default:
            }


            if(DebugHandler.isActive){ console.log('Data from server via websocket or xhr: ' + receivedData); }

        },


        // -----------------------------------------------------------
        // SHORT POLLING
        // -----------------------------------------------------------

        initShortPolling: function(){
            this.isShortPollingActive = true;

            // trigger dataHandlerInitEvent if short polling is active
            // --> event listener router.js
            var dataHandlerEvent = document.createEvent('Event');
            dataHandlerEvent.initEvent('dataHandlerIsReady', true, false);
            document.dispatchEvent(dataHandlerEvent);

            if(DebugHandler.isActive){ console.log('okay, no websocket alive... do short polling instead...'); }

        },


        // -----------------------------------------------------------
        // HELPER FUNCTIONS SEND & GET & DISTRIBUTE DATA
        // -----------------------------------------------------------

        // check user
        // --------------------------

        checkUser: function(route){
            this.sendData(route, 'checkUser');
        },

        // currently playing track
        // --------------------------
        getCurrentlyPlayingTrack: function(route){
            this.sendData(route, 'getCurrentlyPlaying'); // route = 'home', type = currentlyPlaying, data = ''
        },


        distributeCurrentlyPlayingTrack: function(data, view){
            var that = this;
            view.route = data.route;
            view.id = data.info.currentlyPlaying.id;
            
            // if no data exists 
            // --> just let the translations handler do the job
            if(data.info.currentlyPlaying.title){
                view.album = data.info.currentlyPlaying.album;
                view.title = data.info.currentlyPlaying.title;
                view.artist = data.info.currentlyPlaying.artist;

                var minutes = Math.floor(data.info.currentlyPlaying.length / 60);
                var seconds = data.info.currentlyPlaying.length - minutes * 60;
                var secondsTest = seconds.toString().length;
                if (secondsTest > 1){
                    view.length = minutes + ':' + seconds + ' min';
                } else {
                    view.length = minutes + ':0' + seconds + ' min';
                }

            } else {
                TranslationHandler.translate(that.currentLanguage, view);
            }

            // client music player system info
            this.lastPlayedTrackId = this.currentlyPlayingTrackId;
            this.currentlyPlayingTrackId = data.info.currentlyPlaying.id;
            this.currentlyPlayingDjImage = data.info.currentlyPlaying.image;

            // dj image and states
            setTimeout(function(){
                view.djImageInfoStateClass = 'hide';
                that.autoChangeDjImage = true;
                that.changeDjImage(view, data.info.currentlyPlaying.image);
            }, that.currentlyPlayingDjImageChangeTimeout + 600);
            
            // system info
            view.users = data.info.status.users;
            view.internetAccess = data.info.status.internetAccess;

            // check if user has already downvoted current track
            if(data.info.currentlyPlaying.downvote === 1 || data.info.currentlyPlaying.id === -1){
                view.downvoteActiveStateClass = '';
                view.downvoteDisabledStateClass = 'disabled';
            } else {
                view.downvoteActiveStateClass = 'active';
                view.downvoteDisabledStateClass = '';
            }

        },

        changeDjImage: function(view, dataCurrentlyPlayingDjImage){
            var that = this;

            if(this.autoChangeDjImage === true){

                // if(view.imageOne !== this.currentlyPlayingDjImage){
                    view.imageOne = dataCurrentlyPlayingDjImage;
                    // view.djImageStateClassTwo = 'inactive';
                    setTimeout(function(){
                        view.djImageStateClassOne = 'active';
                    }, that.currentlyPlayingDjImageChangeTimeout - 300);
                
                // } else {
                //     view.imageTwo = dataCurrentlyPlayingDjImage;
                //     view.djImageStateClassOne = 'inactive';
                //     setTimeout(function(){
                //         view.djImageStateClassTwo = 'active';
                //     }, that.currentlyPlayingDjImageChangeTimeout - 300);
                
                // }
            
                this.autoChangeDjImage = false;
            
            }
            this.currentlyPlayingDjImage = dataCurrentlyPlayingDjImage;
        },

        // get user uploaded playlist
        // --------------------------
        getUserPlaylist: function(route){
            this.sendData(route, 'getUserPlaylist');
        },

        distributeUserPlaylist: function(data, view){
            var that = this;
            var playlist = [];
            var set = false;
            var index = 0;
            var lastFilledLine = 0;
            this.currentClientSidePlaylist = [];

            $.each(data.playlist, function(key, item){

                // collect all current user track ids (playlist)
                that.currentClientSidePlaylist.push((item.t_id === false) ? '' : item.t_id);

                item.displaySwapDownClass = 'showSwapDownClass';
                item.playlistStatus = '';
                
                // toggle upload button and mark last filled line
                if (item.t_id === false && set === false){
                    item.displayUploadClass = 'showUploadClass';
                    item.playlistStatus = 'browse-playlist';
                    set = true;
                    lastFilledLine = index - 1;
                } else {
                    item.displayUploadClass = '';
                }

                // toggle swap up button
                if (index === 0){
                    item.displaySwapUpClass = '';
                } else {
                    item.displaySwapUpClass = 'showSwapUpClass';
                }                

                index = index + 1;
                playlist.push(item);
            });


            // toggle swap down button and mark last filled playlist
            if (set === false){
                playlist[4].displaySwapDownClass = '';
            } else if (lastFilledLine > -1){
                playlist[lastFilledLine].playlistStatus = 'last-filled-playlist';
                playlist[lastFilledLine].displaySwapDownClass = '';

            }

            // mark second empty playlist
            if (set === true && lastFilledLine <= 2 && lastFilledLine >= -1){
                playlist[(lastFilledLine + 2)].playlistStatus = 'second-empty-playlist';
            }

            // display browser button
            view.triggerUploadFileStateClass = '';

            // reset upload action
            view.uploadAction = false;

            view.playlist = playlist;
        },

        // user image
        // --------------------------
        uploadUserImage: function(file, element){
            var data = [file, element];
            this.sendData('settings', 'uploadUserImage', data);
        },

        getUserImage: function(route){
            this.sendData(route, 'getUserImage'); // route = 'home', type = getInfo, data = ''
        },

        distributeUserImage: function(data, view){
            view.route = data.route;
            view.userImageUrl = data.userImage.url;

            // check if user has a uploaded file
            // --> show delete image button
            if(data.userImage.url.indexOf('images') > 0){
                view.fileControlStateClass = '';
                view.triggerUploadFileStateClass = '';
                view.uploadImageFilename = 'hide';
            } else {
                view.fileControlStateClass = 'hide';
            }
        },

        deleteUserImage: function(){
            this.sendData('settings', 'deleteUserImage');
        },

        // track
        // --------------------------
        uploadUserTrack: function(file, element){
            var data = [file, element];
            this.sendData('home', 'uploadUserTrack', data);
        },

        deleteUserTrack: function(trackId){
            this.sendData('home', 'deleteUserTrack', trackId);
        },

        swapUserTrack: function(swapTracks){
            this.sendData('home', 'swapUserTrack', swapTracks);
        },

        downvoteTrack: function(trackId){
            this.sendData('home', 'downvoteTrack', trackId);
        },

        distributeDownVoteTrack: function(data, view){
            if(data.downvote === 1){

                view.downvoteActiveStateClass = '';
                var downvoteTrackResponse = $('#downvote-response-message');
                
                // show downvote track response
                view.downvoteResponseMessageStateClass = 'active';
                setTimeout(function(){
                    view.downvoteResponseMessageStateClass = '';
                }, 3000);

                // color downvote button
                setTimeout(function(){
                    view.downvoteDisabledStateClass = 'disabled';
                    // trigger tour guide next if tour guide is active
                    TourGuide.next();
                }, 3800);

            }

        },
        

        // internet access
        // --------------------------
        getInternetAccess: function(route){
            this.sendData(route, 'getInternetAccess');
        },

        setInternetAccess: function(){
            this.sendData('settings', 'setInternetAccess');
        },

        distributeInternetAccess: function(data, view){
            view.route = data.route;
            if (data.internetAccess === 0) {
                view.internetAccess = 'Activate Internet';
            } else {
                view.internetAccess = 'Deactivate Internet';
            }
        },

        // downvote level
        // --------------------------
        getDownvoteLevel: function(route){
            this.sendData(route, 'getDownvoteLevel');
        },

        setDownvoteLevel: function(level){
            this.sendData('settings', 'setDownvoteLevel', level);
        },

        distributeDownvoteLevel: function(data, view){
            view.route = data.route;
            view.downvoteLevel = data.downvoteLevel;
        },


        // -----------------------------------------------------------
        // HELPER FUNCTIONS ALL UP TO DATE
        // -----------------------------------------------------------

        checkForNewUpdatesInterval: '',

        checkForNewUpdates: function(route){
            var that = this;
            var interval = 0;

            if(this.isWebsocketActive){
                interval = this.checkForNewUpdatesIntervalTimeWebsocket;
            } else {
                interval = this.checkForNewUpdatesIntervalTimeXHR;
            }

            // interval
            clearInterval(this.checkForNewUpdatesInterval);
            this.checkForNewUpdatesInterval = setInterval(function(){
                that.sendData(route, 'checkForNewUpdates'); // route = 'home', type = checkForNewUpdates, data = ''
            }, interval);

        },

        updateUserPlaylistInterval: {},

        responseDataCheckForNewUpdates: function(data, view){
            var that = this;
            var route = data.route;

            switch(route){
                case 'home':
                    // if it‘s not equal, just start an update request
                    if(data.currentlyPlayingTrackId !== this.currentlyPlayingTrackId){

                        if(DebugHandler.isActive){ console.log('Auto update track id: ' + this.readyState); }

                        // refresh currently playing track
                        this.getCurrentlyPlayingTrack(route);
    
                        // only do auto update user playlist if no tour guide mode is active
                        if(TourGuide.getTourGuideState() !== true){

                            // check if user is uploading a track
                            if(this.currentlyClientSideUploadingTrack === false){
                                // refresh user playlist 
                                this.getUserPlaylist(route);
                            } else {
                                // upload user playlist if upload is ready
                                this.updateUserPlaylistInterval = setInterval(function(){
                                    if(that.currentlyClientSideUploadingTrack === false){
                                        // refresh user playlist 
                                        that.getUserPlaylist(route);
                                        clearInterval(that.updateUserPlaylistInterval);
                                        return true;
                                    }
                                }, 1000);
                            }

                        }


                        that.currentlyPlayingTrackId = data.currentlyPlayingTrackId;
    
                    }

                    // update user image
                    // --> needed for transition (vue.js updates view too fast)
                    if(data.currentlyPlayingDjImage !== this.currentlyPlayingDjImage){
                        this.autoChangeDjImage = true;
                        this.changeDjImage(view, data.currentlyPlayingDjImage);
                    }

                    break;

                case 'settings':
                    // this.getUserImage(route);
                    break;

                case 'help':
                    break;

                case 'notfound':
                    break;

                case 'translation':
                    break;

                default:
            }

        },

        // -----------------------------------------------------------
        // HELPER FUNCTIONS GENERALLY
        // -----------------------------------------------------------

        xhrCall: function(route, type, data){
            var that = this;
            var formData = new FormData();
            var xhr = new XMLHttpRequest();
            var view = ComponentCollection.getComponent(route);

            formData.append('type', type);
            formData.append('route', route);

            if (type === 'uploadUserImage' || type === 'uploadUserTrack') {
                formData.append('file', data[0]);
                formData.append('data', data[1]);
            } else {
                formData.append('data', data);
            }

            xhr.onerror = function(e) {
                that.currentlyClientSideUploadingTrack = false;
                ErrorHandler.log('xhr error, please try again: ' + type , new Error().stack);
            };

            xhr.onload = function(e) {
                that.currentlyClientSideUploadingTrack = false;
                // distribute responsed data 
                that.getData(e.target.responseText);

                if(type === 'uploadUserImage' || type === 'uploadUserTrack'){
                    // trigger next tour guide step if tour guide is active
                    TourGuide.next();
                }
            };


            xhr.upload.onprogress = function(e) {
                var procent = Math.round(100 / e.total * e.loaded);
                that.currentlyClientSideUploadingTrack = true;

                if(type === 'uploadUserImage' || type === 'uploadUserTrack'){
                    view.displayUploadClass = 'hide';
                    
                    if(procent > 0 && procent < 10 && type === 'uploadUserTrack'){
                        // hide upload control panel
                        $(data[1]).parents('.line-wrapper').siblings('#upload-wrapper').children('#upload-control-wrapper').addClass('slide-hide');
                    }

                    if(procent > 0 && procent < 10 && type === 'uploadUserImage'){
                        // hide upload control panel
                        $(data[1]).parents('.image-text').siblings('#image-upload-wrapper').addClass('slide-hide');
                    }

                    if (procent < 98){
                        $(data[1]).css('width', procent + '%');
                    } else {
                        view.uploadFileControlWrapperStateClass = 'hide';
                    }

                }

            };

            xhr.open('POST', that.regularHost);
            xhr.send(formData);

        },

        fromJsonToString: function(data){
            return JSON.stringify(data);
        },

        fromStringToJson: function(data){
            var checkedData = '';

            // check if data is json string
            if(data.substr(0,1) === '{' && data.substr(-1) === '}'){
                checkedData = JSON.parse(data);
            } else {
                checkedData = data;
            }

            return checkedData;
        }


    };

    return dataHandler;

});
