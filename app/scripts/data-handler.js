define([
    'error',
    'debug',
    'componentCollection'
], function(ErrorHandler, DebugHandler, ComponentCollection) {
    'use strict';

    var dataHandler = {

        // ------------------------------------------------------------
        // custom settings
        // ------------------------------------------------------------
        
        // websocket
        websocketHost: 'ws://localhost:54321',
        checkForNewUpdatesIntervalTimeWebsocket: 500, // milliseconds
        
        // xhr
        regularHost: '../server/core/client.php',
        checkForNewUpdatesIntervalTimeXHR: 2000, // milliseconds

        // transition timeout dj image change
        currentlyPlayingDjImageChangeTimeout: 600, // milliseconds


        // ------------------------------------------------------------
        // state variables – just for music system info
        // --> what track is playing, how looks user playlist, etc.
        // ------------------------------------------------------------

        // websocket
        isWebsocketActive: false,
        
        // xhr and websocket request queue
        sendDataRequestByRequestDelay: 10, // milliseconds (take care of requests)

        // current music player system infos
        lastPlayedTrackId: 0,
        currentlyPlayingTrackId: 0,
        currentlyPlayingDjImage: '',
        currentClientSidePlaylist: [],
        currentlyClientSideUploadingTrack: false,

        init: function(){
            var that = this;
            this.checkWebsocket();
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


            switch(receivedData.route){
                case 'home':
                    if(receivedData.type === 'checkForNewUpdates'){
                        this.responseDataCheckForNewUpdates(receivedData, view);
                    
                    } else if(receivedData.type === 'getCurrentlyPlaying'){
                        // currentlyPlaying
                        this.distributeCurrentlyPlayingTrack(receivedData, view);
                    
                    } else if(receivedData.type === 'getPlaylist'){
                        // user playlist
                        this.distributeUserPlaylist(receivedData, view);

                    } else if(receivedData.type === 'getUserTrack' || receivedData.type === 'uploadUserTrack' || receivedData.type === 'deleteUserTrack'){
                        console.log('distributeUserTrack');
                        this.distributeUserTrack(receivedData, view);
                    
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
            view.album = data.info.currentlyPlaying.album;
            view.title = data.info.currentlyPlaying.title;
            view.artist = data.info.currentlyPlaying.artist;
            view.id = data.info.currentlyPlaying.id;
            view.length = data.info.currentlyPlaying.length;
            
            // dj image and states
            view.imageOne = data.info.currentlyPlaying.image;
            setTimeout(function(){
                view.djImageInfoStateClass = 'hide';
                view.djImageStateClassOne = 'active';
            }, that.currentlyPlayingDjImageChangeTimeout + 600);
            view.djImageStateClassTwo = 'inactive';
            view.imageTwo = data.info.currentlyPlaying.image;
            
            // system info
            view.users = data.info.status.users;
            view.internetAccess = data.info.status.internetAccess;

            // check if user has already downvoted current track
            if(data.info.currentlyPlaying.downvote === 1){
                view.downvoteActiveStateClass = '';
                view.downvoteDisabledStateClass = 'disabled';
            } else {
                view.downvoteActiveStateClass = 'active';
                view.downvoteDisabledStateClass = '';
            }

            // client music player system info
            this.lastPlayedTrackId = this.currentlyPlayingTrackId;
            this.currentlyPlayingTrackId = data.info.currentlyPlaying.id;
            this.currentlyPlayingDjImage = data.info.currentlyPlaying.image;
        },

        // get user uploaded playlist
        // --------------------------
        getUserPlaylist: function(route){
            this.sendData(route, 'getPlaylist'); // route = 'home', type = getPlaylist, data = ''
            // type = getPlaylist
            // url: 'json/playlist.json'
        },

        distributeUserPlaylist: function(data, view){
            view.playlist = data.playlist;
        },

        // user image
        // --------------------------
        uploadUserImage: function(file){
            this.sendData('settings', 'uploadUserImage', file);
            // type = uploadUserImage
            // file = givenFile
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
            } else {
                view.fileControlStateClass = 'hide';
            }
        },

        deleteUserImage: function(){
            this.sendData('settings', 'deleteUserImage');
            // type = deleteUserImage
        },

        // track
        // --------------------------
        uploadUserTrack: function(file){
            this.sendData('home', 'uploadUserTrack', file);
        },

        distributeUserTrack: function(data, view){
            view.route = data.route;
            view.userTrackUrl = data.userTrack.url;

            // check if user has a uploaded file
            // --> show delete track button
            if(data.userImage.url.indexOf('tracks') > 0){
                view.fileControlStateClass = '';
            } else {
                view.fileControlStateClass = 'hide';
            }
        },

        deleteUserTrack: function(trackId){
            this.sendData('home', 'deleteUserTrack', file);
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
                }, 3800);
            }
        },
        
        swapTrack: function(trackIdOne, trackIdTwo){
            // url: 'upload.php', // has to be changed
            // data: {
            //     type: 'swapTrack',
            //     trackIds: [
            //         trackIdOne,
            //         trackIdTwo
            //     ]
            // }
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

        responseDataCheckForNewUpdates: function(data, view){
            var that = this;
            var route = data.route;

            switch(route){
                case 'home':

                    // if it‘s not equal, just start an update request
                    // TODO: take care of user is currently uploading a file
                    // TODO: take care of user is currently swaping a file
                    // --> stop autoUpdate  during user action
                    if(data.currentlyPlayingTrackId !== this.currentlyPlayingTrackId){
                        if(DebugHandler.isActive){ console.log('Auto update track id: ' + this.readyState); }
                        this.getCurrentlyPlayingTrack(route);
                        this.getUserPlaylist(route);
                    }

                    // update user image
                    // --> needed for transition (vue.js updates view too fast)
                    if(data.currentlyPlayingDjImage !== this.currentlyPlayingDjImage){
                        
                        if(view.imageOne !== this.currentlyPlayingDjImage){
                            view.imageOne = data.currentlyPlayingDjImage;
                            view.djImageStateClassTwo = 'inactive';
                            setTimeout(function(){
                                view.djImageStateClassOne = 'active';
                            }, that.currentlyPlayingDjImageChangeTimeout - 300);
                        } else {
                            view.imageTwo = data.currentlyPlayingDjImage;
                            view.djImageStateClassOne = 'inactive';
                            setTimeout(function(){
                                view.djImageStateClassTwo = 'active';
                            }, that.currentlyPlayingDjImageChangeTimeout - 300);
                        }
                        
                        this.currentlyPlayingDjImage = data.currentlyPlayingDjImage;
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

            if(type === 'uploadUserImage' || type === 'uploadUserTrack'){
                formData.append('file', data);
                formData.append('data', '');
            } else {
                formData.append('data', data);
            }

            xhr.onerror = function(e) {
                ErrorHandler.log('xhr error, please try again: ' + type , new Error().stack);
            };

            xhr.onload = function(e) {
                // distribute responsed data 
                that.getData(e.target.responseText);
            };

            xhr.upload.onprogress = function(e) {
                var procent = Math.round(100 / e.total * e.loaded);

                if(type === 'uploadUserImage' || type === 'uploadUserTrack'){

                    if (procent < 98){
                        that.$data.uploadProgressWrapperStateClass = ''; // show progress wrapper
                        view.uploadProgressValue = procent + '%';
                    } else {
                        view.triggerUploadFileStateClass = '';
                        view.uploadFileControlWrapperStateClass = 'hide';
                        view.uploadProgressValue = procent + '% --> fertig';
                        view.uploadProgressWrapperStateClass = 'hide'; // hide progress wrapper
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
