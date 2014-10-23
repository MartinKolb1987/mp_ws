define([
    'vue',
    'componentCollection',
    'text!../../templates/help/default.html'
], function(Vue, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('help', {
        ready: function () {
            ComponentCollection.addComponent('help', this.$data);
        },
        template: DefaultTemplate
    });

});
