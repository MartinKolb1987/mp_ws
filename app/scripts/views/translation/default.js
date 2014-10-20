define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'text!../../templates/translation/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, DefaultTemplate) {
    'use strict';

    Vue.component('translation', {
        template: DefaultTemplate,
        methods: {
            setTranslation: function(lang){
                // this.$data.t_subtitle = 'sdfsdf';
                TranslationHandler.translate(lang, this.$data);
            }
        }
    });

});
