define([
], function() {
    'use strict';

    var debug = {
        isActive: true,

        log: function(description){
            if(this.isActive){
                console.log('DebugHandler --> ' + description);
            }
        }
    };

    return debug;

});
