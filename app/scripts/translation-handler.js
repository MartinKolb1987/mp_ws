define([
], function() {
    'use strict';

    var translation = {

        language : {
            de: {
                t_subtitle: 'Deutsch',
                t_description: 'Das ist die deutsche Übersetzung.'
            },
            en: {
                t_subtitle: 'English',
                t_description: 'This is the english translation.'
            }
        },

        translate: function(lang, view){
            console.log("lang: " + lang);

            for (var el in this.language[lang]) {
                if(this.language[lang].hasOwnProperty(el)){
                    console.log(this.language[lang][el]);
                    console.log(view);
                    if(view.t_subtitle){
                        console.log('jup');
                    } else {
                        console.log('false');
                    }
                    // this.$data.t_subtitle = this.$data[lang][el];
                }
            }

            // view.t_subtitle = this.language[lang].t_subtitle;
            // this.data.t_description = this.data[lang].t_description;
        }
    };

    return translation;

});
