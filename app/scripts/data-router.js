define([
    'error'
], function(ErrorHandler) {
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
                    console.log("Websocket is established: Status " + this.readyState); 
                };

                this.websocket.onerror = function (error) {
                    // unidentified websocket error
                    ErrorHandler.log(error);
                    that.initLongPolling();
                };

                this.websocket.onmessage = function(msg){ 
                    that.getData(msg.data); 
                };

                this.websocket.onclose = function(msg){};

            } catch(error){ 
                // no websocket is available
                ErrorHandler.log(error);
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
                // this.websocket.send(msg);
            } else {
                // do longpolling stuff
            }
        },

        getData: function(data){
            if(that.isWebsocketActive){
                // do websocket stuff
            } else {
                // do longpolling stuff
            }
        },

        // -----------------------------------------------------------
        // LongPolling
        // -----------------------------------------------------------

        initLongPolling: function(){
            // this.websocketHost.replace('ws:', 'http:').replace('wss:', 'https:'),
            console.log('okay, long polling...');
        }
    };

    return dataRouter;

});
