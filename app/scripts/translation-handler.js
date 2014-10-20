define([
    'vue',
    'error',
    'debug'
], function(Vue, ErrorHandler, DebugHandler) {
    'use strict';

    var translation = {

        language : {
            de: {
                langSubtitle: 'Deutsch',
                langDescription: 'Das ist die deutsche Übersetzung.',
                langHome: 'Heimat',
                langNotfound: 'Emmm, keine Ahnung...'
            },
            en: {
                langSubtitle: 'English',
                langDescription: 'This is the english translation.',
                langHome: 'Home',
                langNotfound: 'Sorry, not found...'
            }
        },

        translate: function(lang, view){
            for (var el in this.language[lang]) {
                if(this.language[lang].hasOwnProperty(el)){
                    if(view.hasOwnProperty(el)){
                        view[el] = this.language[lang][el];
                    }
                }
            }
        }
    };
    return translation;

});
