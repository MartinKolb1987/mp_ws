define([
    'vue',
    'text!../../templates/home/default.html'
], function(Vue, DefaultTemplate) {
    'use strict';

    Vue.component('home', {
        template: DefaultTemplate,
        data: {
            title: 'Test-Nutzer:',
            items: [
                {
                    firstname: 'Hans',
                    lastname: 'Wurst'
                },
                {
                    firstname: 'Peter',
                    lastname: 'Pan'
                },
                {
                    firstname: 'Max',
                    lastname: 'Mustermann'
                },
                {
                    firstname: 'Petra',
                    lastname: 'Müller'
                },
                {
                    firstname: 'Josef',
                    lastname: 'Mayer'
                },
                {
                    firstname: 'Hans',
                    lastname: 'Dampf'
                }
            ]
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
