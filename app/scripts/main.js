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
        componentCollection: 'component-collection'
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
    DataHandler.init();
});