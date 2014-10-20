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
            console.log(this.allComponents);
            if(this.allComponents.hasOwnProperty(key) === false){
                this.allComponents[key] = data;
            }
        },

        getComponent: function(key){
            if(this.allComponents.hasOwnProperty(key) === true){
                return this.allComponents[key];
            } else {
                // ErrorHandler.log('no "' + key + '" component exists', new Error().stack);
            }
        },

        removeComponent: function(){

        }

    };

    return componentCollection;

});
