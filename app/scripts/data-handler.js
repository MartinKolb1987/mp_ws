define([
    'error',
    'debug',
    'componentCollection'
], function(ErrorHandler, DebugHandler, ComponentCollection) {
    'use strict';

    var dataHandler = {

        // settings and paths
        // websocket
        isWebsocketActive: false,
        websocketHost: 'ws://localhost:54321',
        checkForNewUpdatesIntervalTimeWebsocket: 1000, // milliseconds
        
        // xhr
        regularHost: '../server/core/client.php',
        checkForNewUpdatesIntervalTimeXHR: 50000, // milliseconds
        
        // xhr and websocket request queue
        sendDataRequestByRequestDelay: 10, // milliseconds (take care of requests)

        // current music player system infos
        lastPlayedTrackId: 0,
        currentlyPlayingTrackId: 0,
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
                    if(that.isWebsocketActive && that.queue[counter].type !== 'uploadUserImage'){ // TODO: && is not file upload (user image or track)
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
                    }
                    break;
                case 'settings':
                    if(receivedData.type === 'getUserImage' || receivedData.type === 'uploadUserImage'){
                        this.distributeUserImage(receivedData, view);
                    } else if(receivedData.type === 'getInternetAccess'){
                        this.distributeInternetAccess(receivedData, view);
                    } else if(receivedData.type === 'setInternetAccess'){
                        this.distributeInternetAccess(receivedData, view);
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

        // currently playing track
        // --------------------------
        getCurrentlyPlayingTrack: function(route){
            this.sendData(route, 'getCurrentlyPlaying'); // route = 'home', type = currentlyPlaying, data = ''
        },

        distributeCurrentlyPlayingTrack: function(data, view){
            view.route = data.route;
            view.album = data.info.currentlyPlaying.album;
            view.title = data.info.currentlyPlaying.title;
            view.artist = data.info.currentlyPlaying.artist;
            view.downvote = data.info.currentlyPlaying.downvote;
            view.id = data.info.currentlyPlaying.id;
            view.length = data.info.currentlyPlaying.length;

            // music player system info
            this.lastPlayedTrackId = this.currentlyPlayingTrackId;
            this.currentlyPlayingTrackId = data.info.currentlyPlaying.id;
        },

        // get user uploaded playlist
        // --------------------------
        getUserPlaylist: function(route){
            this.sendData(route, 'getPlaylist'); // route = 'home', type = getPlaylist, data = ''
            // type = getPlaylist
            // url: 'json/musicHivePlaylist.json'
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
        },

        deleteUserImage: function(){
            // type = deleteUserImage
        },

        // track
        // --------------------------
        uploadTrack: function(file){
            // post
            // type = uploadTrack
            // file = givenFile
        },

        removeTrack: function(trackId){
            // post
            // type = removeTrack
            // trackId = trackId
        },

        downvoteTrack: function(trackId){
            // type = downvoteTrack
            // trackId = trackId
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
        getInternetAccess: function(){
            this.sendData('settings', 'getInternetAccess');
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
                        this.getCurrentlyPlayingTrack(route);
                        this.getUserPlaylist(route);
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

            if(type === 'uploadUserImage'){
                formData.append('file', data);
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

                if(type === 'uploadUserImage'){ // TODO: upload user track

                    if (procent < 98){
                        that.$data.uploadProgressWrapperStateClass = ''; // show progress wrapper
                        view.uploadProgressValue = procent + '%';
                    } else {
                        view.fileControlStateClass = '';
                        view.uploadFileControlWrapperStateClass = 'hide';
                        view.uploadProgressValue = procent + '% --> fertig';
                        view.uploadProgressWrapperStateClass = 'hide'; // hide progress wrapper
                        // finished
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
