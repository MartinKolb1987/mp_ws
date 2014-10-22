define([
    'error',
    'debug'
], function(ErrorHandler, DebugHandler) {
    'use strict';

    var dataHandler = {
        
        isWebsocketActive: false,
        websocketHost: 'ws://localhost:54321/server.php',
        websocket: {},
        regularHost: '../../server/client.php',

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

                this.websocket.onerror = function (error){
                    that.isWebsocketActive = false;
                    // unidentified websocket error
                    ErrorHandler.log('unidentified websocket error', new Error().stack);
                };

                this.websocket.onmessage = function(msg){
                    that.getData(msg.data);
                };

                this.websocket.onclose = function(msg){
                    that.isWebsocketActive = false;
                };

            } catch(error){
                that.isWebsocketActive = false;
                // no websocket is available
                ErrorHandler.log('no websocket is available', new Error().stack);
            }
        },

        closeWebsocket: function(){
            this.websocket.close();
            this.websocket = '';
        },

        // -----------------------------------------------------------
        // SEND & RECEIVE DATE FROM SERVER
        // -----------------------------------------------------------

        sendData: function(type, data){
            
            // if(data === undefined){
            //     data = 'no data should be send';
            // }

            // build json 
            var sendData = {
                type: type,
                sendData: data
            };

            // convert json to string
            sendData = this.toJsonString(sendData);

            if(this.isWebsocketActive){
                // do websocket stuff
                this.websocket.send(sendData);
                if(DebugHandler.isActive){ console.log('Send data to server via websocket: ' + sendData); }
            
            } else {
               
                // do shortpolling stuff
            
            }

        },

        getData: function(receivedData){

            if(this.isWebsocketActive){
                // do websocket stuff
                receivedData = this.fromJsonString(receivedData);
                console.log('bingo');
                console.log('Data from server: ');
                console.log(receivedData);

                if(DebugHandler.isActive){ console.log('Data from server via websocket: ' + receivedData); }
            
            } else {
            
                // do shortpolling stuff
            
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
            
            if(DebugHandler.isActive){ console.log('okay, no websocket alive... short polling...'); }

        },


        // -----------------------------------------------------------
        // HELPER FUNCTIONS SEND & GET DATA
        // -----------------------------------------------------------

        // currently playing track
        // --------------------------
        getCurrentlyPlayingTrack: function(){
            console.log('getCurrentlyPlayingTrack');
            this.sendData('getInfo');
            // type = getInfo
        },

        // get user uploaded playlist
        // --------------------------
        getUserPlaylist: function(){
            // type = getPlaylist
            // url: 'json/musicHivePlaylist.json'
        },

        // user image
        // --------------------------
        uploadUserImage: function(file){
            // type = uploadUserImage
            // file = givenFile
        },

        getUserImage: function(){
            // type = getUserImage
            // url: 'json/musicHiveUserImage.json'
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
        // HELPER FUNCTIONS GENERALLY
        // -----------------------------------------------------------

        toJsonString: function(data){
            return JSON.stringify(data);
        },

        fromJsonString: function(data){
            return JSON.parse(data);
        }

    };

    return dataHandler;

});
