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
                // --------------------------
                langHome: 'Heimat',
                downvoteResponseMessage: 'Dein Downvote war erfolgreich!',
                djImageInfo: 'Dein DJ!',
                trackTitle: 'Wähle einen Musiktitel!',
                
                // currently playing track
                title: 'Kein Titel',
                artist: 'Kein Künstler',
                album: 'Kein Album',
                length: '',
                
                // settings
                // --------------------------
                langSettings: 'Einstellungen',
                uploadProgressImageMessage: 'Ich lade gerade dein Bild hoch...',

                // help
                // --------------------------
                langHelp: 'Hilfe',

                // not found
                // --------------------------
                langNotfound: 'Emmm, keine Ahnung...',
                
                // translation
                // --------------------------
                langSubtitle: 'Deutsch',
                langDescription: 'Das ist die deutsche Übersetzung.',
            },
            en: {
                // home
                // --------------------------
                langHome: 'Home',
                downvoteResponseMessage: 'Your downvote has been counted!',
                djImageInfo: 'Your DJ!',
                trackTitle: 'Choose a track!',

                // currently playing track
                title: 'No title',
                artist: 'No artist',
                album: 'No album',
                length: '',
                
                // settings
                // --------------------------
                langSettings: 'Settings',
                uploadProgressImageMessage: 'Currently i‘m uploading your image...',

                // help
                // --------------------------
                langHelp: 'Help',

                // not found
                // --------------------------
                langNotfound: 'Sorry, not found...',
                
                // translation
                // --------------------------
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
