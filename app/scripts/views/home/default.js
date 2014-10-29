define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'text!../../templates/home/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('home', {
        template: DefaultTemplate,
        ready: function () {
            ComponentCollection.addComponent('home', this.$data);
        },
        data: {
            langHome: '',
            route: 'no route',
            album: 'no album',
            artist: 'no artist',
            title: 'not title',
            length: 0,
            id: 0,
            image: 'no image',
            downvote: 0
        },
        methods: {
            removeUser: function(item){
                this.$data.items.$remove(item.$index);
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
