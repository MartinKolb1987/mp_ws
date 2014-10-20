define([
    'error',
    'debug'
], function(ErrorHandler, DebugHandler) {
    'use strict';

    var dataRouter = {
        
        isWebsocketActive: false,
        websocketHost: 'ws://localhost:54321/server.php',
        websocket: {},

        init: function(){
            this.checkWebsocket();
        },

        // -----------------------------------------------------------
        // WEBSOCKET
        // -----------------------------------------------------------

        checkWebsocket: function(){
            if(window.WebSocket){
                this.initWebsocket();
            } else {
                this.initLongPolling();
            }
        },

        initWebsocket: function(){
            var that = this;
            try{
                this.websocket = new WebSocket(that.websocketHost);
                
                this.websocket.onopen  = function(msg){
                    that.isWebsocketActive = true;

                    if(DebugHandler.isActive){console.log('Websocket is established: Status ' + this.readyState); }

                    that.sendData('Hallo');
                };

                this.websocket.onerror = function (error){
                    // unidentified websocket error
                    ErrorHandler.log('unidentified websocket error', new Error().stack);
                    that.initLongPolling();
                };

                this.websocket.onmessage = function(msg){
                    that.getData(msg.data);
                };

                this.websocket.onclose = function(msg){};

            } catch(error){
                // no websocket is available
                ErrorHandler.log('no websocket is available', new Error().stack);
                that.initLongPolling();
            }
        },

        closeWebsocket: function(){
            this.websocket.close();
            this.websocket = '';
        },

        // -----------------------------------------------------------
        // SEND & RECEIVE DATE FROM SERVER
        // -----------------------------------------------------------

        sendData: function(data){
            if(this.isWebsocketActive){
                // do websocket stuff
                this.websocket.send(data);
                if(DebugHandler.isActive){ console.log('Send data to server via websocket: ' + data); }
            } else {
                // do longpolling stuff
            }
        },

        getData: function(data){
            if(this.isWebsocketActive){
                // do websocket stuff
                if(DebugHandler.isActive){ console.log('Data from server via websocket: ' + data); }
            } else {
                // do longpolling stuff
            }
        },

        // -----------------------------------------------------------
        // LongPolling
        // -----------------------------------------------------------

        initLongPolling: function(){
            this.websocketHost = this.websocketHost.replace('ws:', 'http:').replace('wss:', 'https:').replace(':54321', '');
            
            if(DebugHandler.isActive){ console.log('okay, no websocket alive... long polling...'); }

        }
    };

    return dataRouter;

});
