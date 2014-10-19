define([
], function() {
    'use strict';

    var translation = {

        data : {
            de: {
                t_subtitle: 'Deutsch',
                t_description: 'Das ist die deutsche Übersetzung.'
            },
            en: {
                t_subtitle: 'English',
                t_description: 'This is the english translation.'
            }
        },

        translate: function(lang){
            console.log("lang: " + lang);

            for (var el in this.data[lang]) {
                if(this.data[lang].hasOwnProperty(el)){
                    console.log(this.data[lang][el]);

                    // this.data.t_subtitle = this.data[lang][el];
                }
            }

            // this.data.t_subtitle = this.data[lang].t_subtitle;
            // this.data.t_description = this.data[lang].t_description;
        }        
    };

    return translation;

});
