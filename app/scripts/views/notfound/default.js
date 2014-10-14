define([
    'vue',
    'error',
    'text!../../templates/notfound/404.html'
], function(Vue, ErrorHandler, DefaultTemplate) {
    'use strict';

    Vue.component('notfound', {
        template: DefaultTemplate,
    });

});
