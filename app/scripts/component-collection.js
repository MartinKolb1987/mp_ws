define([
    'error',
    'debug'
], function(ErrorHandler, DebugHandler) {
    'use strict';

    var componentCollection = {
        allComponents: {},
        changedEvent: {},

        init: function(){
            if(DebugHandler.isActive){ console.log('componentCollection init'); }
        },

        addComponent: function(key, data){
            this.allComponents[key] = data;
            
            if(DebugHandler.isActive){ console.log('component collection: '); console.log(this.allComponents); }

            this.changedEvent = document.createEvent('Event');
            this.changedEvent.initEvent('collectionChanged', true, true);
            document.dispatchEvent(this.changedEvent);

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
