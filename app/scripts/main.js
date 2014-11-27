require.config({
    shim: {
        baseUrl: 'app/scripts',
        vue: {
            exports: 'Vue'
        },
        zeptoCore: {
            exports: '$',
        },
        translation: {
            deps: ['componentCollection']
        },
        zeptoEvents: {
            deps: ['zeptoCore']
        },
        zeptoCallbacks: {
            deps: [
                'zeptoCore',
                'zeptoEvents'
            ]
        },
        zeptoSelector: {
            deps: [
                'zeptoCore',
                'zeptoEvents',
                'zeptoCallbacks'
            ]
        }
    },
    paths: {
        vue: '../bower_components/vue/dist/vue',
        text: '../bower_components/requirejs-text/text',
        zeptoCore: '../bower_components/zeptojs/src/zepto',
        zeptoEvents: '../bower_components/zeptojs/src/event',
        zeptoCallbacks: '../bower_components/zeptojs/src/callbacks',
        zeptoSelector: '../bower_components/zeptojs/src/selector',
        dataHandler: 'data-handler',
        debug: 'debug-handler',
        error: 'error-handler',
        translation: 'translation-handler',
        componentCollection: 'component-collection',
        tourGuide: 'tour-guide'
    }
});

require([
    'router/router',
    'dataHandler',
    'componentCollection',
    'zeptoCore',
    'zeptoEvents',
    'zeptoCallbacks',
    'zeptoSelector'
], function(Router, DataHandler, ComponentCollection, $, ZeptoEvents, ZeptoCallbacks, ZeptoSelector) {
    ComponentCollection.init();

    var currentUrl = String(window.location);
    // // redirect to music-magnet url
    // if(currentUrl.indexOf('musicmagnet.de') === -1 && currentUrl.indexOf('music-magnet.de') === -1  && currentUrl.indexOf('192.168.1.80') === -1  && currentUrl.indexOf('192.168.0.1') === -1){
    //     window.location = 'http://music-magnet.de';
    // }

    // decide which websocket should be used
    if(currentUrl.indexOf('localhost') > 0){
        DataHandler.websocketHost = 'ws://localhost:54321';
    } else{
        DataHandler.websocketHost = 'ws://192.168.0.1:54321';
    }

    DataHandler.init();
});