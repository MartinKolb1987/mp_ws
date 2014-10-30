define([
    'vue',
    'componentCollection',
    'text!../../templates/notfound/404.html'
], function(Vue, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('notfound', {
        el: '#notfound',
        ready: function () {
            ComponentCollection.addComponent('notfound', this.$data);
        },
        template: DefaultTemplate
    });

});
