define([
], function() {
    'use strict';

    var debug = {
        isActive: true,

        log: function(description, stackInfo){
            if(this.isActive){
                console.log('DebugHandler --> ' + description);
                console.log(stackInfo.replace('Error', '').split(' at ')[1].split(' (')[1]);
                console.log('---------------------------------------------------------------------------');
            }
        }
    };

    return debug;

});
