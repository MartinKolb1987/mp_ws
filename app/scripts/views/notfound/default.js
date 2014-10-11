define([
    'vue',
    'text!../../templates/notfound/404.html'
], function(Vue, DefaultTemplate) {
    'use strict';

    Vue.component('notfound', {
        template: DefaultTemplate,
    });

});
