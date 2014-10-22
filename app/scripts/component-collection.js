define([
    'error',
    'debug'
], function(ErrorHandler, DebugHandler) {
    'use strict';

    var componentCollection = {
        allComponents: {},

        init: function(){
            if(DebugHandler.isActive){ console.log('componentCollection init'); }
        },

        addComponent: function(key, data){
            this.allComponents[key] = data;
            
            if(DebugHandler.isActive){ console.log('component collection: '); console.log(this.allComponents); }

            // trigger collectionChanged if new component is added
            // --> event listener router.js
            var changedEvent = document.createEvent('Event');
            changedEvent.initEvent('collectionChanged', true, false);
            document.dispatchEvent(changedEvent);

        },

        getComponent: function(key){
            if(this.allComponents.hasOwnProperty(key) === true){
                return this.allComponents[key];
            } else {
                ErrorHandler.log('no "' + key + '" component exists', new Error().stack);
            }
        }

    };

    return componentCollection;

});
