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

    Vue.component('translation', {
        el: '#translation',
        template: DefaultTemplate,
        ready: function () {
            ComponentCollection.addComponent('translation', this.$data);
        },
        methods: {
            setTranslation: function(lang){
                TranslationHandler.setCurrentLang(lang);
                TranslationHandler.translate(lang, this.$data);
            }
        }
    });

});
