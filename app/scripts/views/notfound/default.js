define([
    'vue',
    'error',
    'componentCollection',
    'text!../../templates/notfound/404.html'
], function(Vue, ErrorHandler, ComponentCollection, DefaultTemplate) {
    'use strict';
    console.log('component notfound');
    Vue.component('notfound', {
        ready: function () {
            ComponentCollection.addComponent('notfound', this.$data);
        },
        template: DefaultTemplate
    });

});
