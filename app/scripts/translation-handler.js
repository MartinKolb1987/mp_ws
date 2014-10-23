define([
    'vue',
    'error',
    'debug'
], function(Vue, ErrorHandler, DebugHandler) {
    'use strict';

    var translation = {
        currentLang: '',

        language : {
            de: {
                // home
                langHome: 'Heimat',
                
                // settings
                langSettings: 'Einstellungen',

                // help
                langHelp: 'Hilfe',

                // not found
                langNotfound: 'Emmm, keine Ahnung...',
                
                // translation
                langSubtitle: 'Deutsch',
                langDescription: 'Das ist die deutsche Übersetzung.',
            },
            en: {
                // home
                langHome: 'Home',
                
                // settings
                langSettings: 'Settings',

                // help
                langHelp: 'Help',

                // not found
                langNotfound: 'Sorry, not found...',
                
                // translation
                langSubtitle: 'English',
                langDescription: 'This is the english translation.',

            }
        },

        translate: function(lang, view){

            if(this.currentLang !== ''){
                lang = this.currentLang;
            }

            for (var el in this.language[lang]) {
                if(this.language[lang].hasOwnProperty(el)){
                    if(view.hasOwnProperty(el)){
                        view[el] = this.language[lang][el];
                    } else {
                        if(DebugHandler.isActive){ console.log('translation for "' + el + '" (' + lang + ') is missing'); }
                    }
                }
            }
        },

        setCurrentLang: function(lang){
            this.currentLang = lang;
        }
    };
    return translation;

});
