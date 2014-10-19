define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'text!../../templates/translation/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, DefaultTemplate) {
    'use strict';

    Vue.component('translation', {
        template: DefaultTemplate,
        data: {
            title: 'Translation',
            de: {
                t_subtitle: 'Deutsch',
                t_description: 'Das ist die deutsche Übersetzung'
            },
            en: {
                t_subtitle: 'English',
                t_description: 'This is the english translation.'
            }
        },
        methods: {
            setTranslation: function(lang){
                console.log("lang: " + lang);
                var t_subtitle = this.$data[lang].t_subtitle;
                var t_description = this.$data[lang].t_description;
                console.log("subtitle: " + t_subtitle + " description: " + t_description);
                return t_subtitle, t_description;
            },
        }

    });

});
