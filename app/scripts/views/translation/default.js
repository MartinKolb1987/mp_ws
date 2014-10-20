define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'text!../../templates/translation/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, DefaultTemplate) {
    'use strict';
    console.log('component translation');
    Vue.component('translation', {
        template: DefaultTemplate,
        ready: function () {
            ComponentCollection.addComponent('translation', this.$data);
        }
    });

});
