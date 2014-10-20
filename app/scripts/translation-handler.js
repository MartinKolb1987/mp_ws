define([
], function() {
    'use strict';

    var translation = {

        language : {
            de: {
                langSubtitle: 'Deutsch',
                langDescription: 'Das ist die deutsche Übersetzung.',
                langHome: 'Heimat'
            },
            en: {
                langSubtitle: 'English',
                langDescription: 'This is the english translation.'
            }
        },

        translate: function(lang, view){
            for (var el in this.language[lang]) {
                if(this.language[lang].hasOwnProperty(el)){
                    if(view.hasOwnProperty(el)){
                        view[el] = this.language[lang][el];
                    } else {
                        console.log('Element not found');
                    }
                }
            }
        }
    };
    return translation;

});
