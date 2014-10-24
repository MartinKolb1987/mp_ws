define([
    'error',
    'debug',
    'componentCollection'
], function(ErrorHandler, DebugHandler, ComponentCollection) {
    'use strict';

    var dataHandler = {
        
        isWebsocketActive: false,
        websocketHost: 'ws://localhost:54321',
        regularHost: '../../server/client.php',
        checkForNewUpdatesTime: 50000, // milliseconds
        sendDataRequestByRequestDelay: 10, // milliseconds (take care of websockets)

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
                    
                    // Websocket
                    // --------------------------
                    if(that.isWebsocketActive){

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

                        // build json 
                        sendData = {
                            route: that.queue[counter].route,
                            type: that.queue[counter].type,
                            data: that.queue[counter].data
                        };
                        console.log('short polling:');
                        console.log(sendData);
                    
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
            

            // Websocket
            // --------------------------
            if(this.isWebsocketActive){
                receivedData = this.fromStringToJson(receivedData);
                var view = ComponentCollection.getComponent(receivedData.route);
                

                switch(receivedData.route){
                    case 'home':
                        if(receivedData.type === 'getCurrentlyPlaying'){
                            // currentlyPlaying
                            this.distributeCurrentlyPlayingTrack(receivedData, view);
                        } else if(receivedData.type === 'getPlaylist'){
                            // user playlist
                            this.distributeUserPlaylist(receivedData, view);
                        }
                        break;
                    case 'settings':
                        this.distributeUserImage(receivedData, view);
                        // this.distributeCurrentlyPlayingTrack(receivedData, view);
                        break;
                    default:
                }


                if(DebugHandler.isActive){ console.log('Data from server via websocket: ' + receivedData); }
            

            // Shortpolling
            // --------------------------
            } else {
            
            
            }

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

            console.log(this.regularHost);
            
            if(DebugHandler.isActive){ console.log('okay, no websocket alive... do short polling instead...'); }

        },


        // -----------------------------------------------------------
        // HELPER FUNCTIONS SEND & GET DATA
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

        // -----------------------------------------------------------
        // HELPER FUNCTIONS TIMER
        // -----------------------------------------------------------

        checkForNewUpdatesInterval: '',

        checkForNewUpdates: function(route){
            var that = this;

            // interval
            clearInterval(this.checkForNewUpdatesInterval);
            this.checkForNewUpdatesInterval = setInterval(function(){
                that.sendData(route, 'checkForNewUpdates'); // route = 'home', type = getInfo, data = ''
            }, that.checkForNewUpdatesTime);

        },

        // -----------------------------------------------------------
        // HELPER FUNCTIONS GENERALLY
        // -----------------------------------------------------------

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
