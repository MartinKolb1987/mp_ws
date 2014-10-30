define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'text!../../templates/settings/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('settings', {
        file: '',
        template: DefaultTemplate,
        ready: function () {
            ComponentCollection.addComponent('settings', this.$data);
        },
        data: {
            langSettings: '',
            route: 'no route',
            userImageUrl: 'no image'
        },
        methods: {
            uploadUserImage: function(item){
                // e.stopPropagation();
                // this.$data.items.$remove(item.$index);
            },
            addUser: function(newItemValue){

                if(this.$data.firstname && this.$data.lastname){
                    
                    this.$data.items.push({
                        firstname: this.$data.firstname,
                        lastname: this.$data.lastname
                    });
                    // clear inputs
                    this.$data.firstname = '';
                    this.$data.lastname = '';

                } else {
                    alert('insert firstname and lastname please');
                }

            },
            updateUser: function(item){
                // console.log($el.message);
                // console.log(item);
            }
        }
    });

});
