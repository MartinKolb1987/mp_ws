define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'text!../../templates/settings/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('settings', {
        el: '#settings',
        file: '',
        template: DefaultTemplate,

        ready: function() {
            ComponentCollection.addComponent('settings', this.$data);
        },

        data: {
            langSettings: '',
            route: 'no route',
            userImageUrl: 'no image'
        },

        methods: {
            triggerFileBrowser: function(e){
                e.stopPropagation();
                
                // select file upload field
                var inputField = $(e.target).prev('#upload-file-field');
                
                // open file browser
                inputField.trigger('click');
                
                // set event on change input field --> 
                this.setOnChangeEventlistenerFileUpload(inputField);

            },

            setOnChangeEventlistenerFileUpload: function(inputField){
                var that = this;
                inputField.unbind('change');

                inputField.on('change', function(e){
                    if(inputField[0].files[0] !== undefined){
                        if(that.checkFile(inputField) === true){
                            inputField.parent('#upload-wrapper').find('#trigger-upload-file').addClass('hide');
                            inputField.parent('#upload-wrapper').find('#upload-control-wrapper').removeClass('hide');
                            that.uploadFile(inputField);
                            that.cancelUploadFile(inputField);
                        } else {
                            alert('wrong file type, try it again');
                            that.clearUploadField(inputField);
                        }
                    }
                });

            },
            
            uploadFile: function(inputField){
                var uploadFileButton = inputField.parent('#upload-wrapper').find('#upload-control-wrapper  #upload-file');
                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    DataHandler.uploadUserImage(inputField[0].files[0]);
                });

            },

            cancelUploadFile: function(inputField){
                var that = this;
                var uploadFileButton = inputField.parent('#upload-wrapper').find('#upload-control-wrapper  #cancel-upload-file');

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    inputField.parent('#upload-wrapper').find('#trigger-upload-file').removeClass('hide');
                    inputField.parent('#upload-wrapper').find('#upload-control-wrapper').addClass('hide');
                    that.clearUploadField(inputField);
                });
            },

            checkFile: function(inputField){
                var allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
                var fileType = inputField[0].files[0].type;
                
                // check if file type is allowed
                if($.inArray(fileType, allowedFileTypes) >= 0){
                    return true;
                } else {
                    return false;
                }

            },

            clearUploadField: function(inputField){
                // only clear input value --> doesn‘t work correctly
                // better to remove and add new one
                inputField.parent('#upload-wrapper').prepend('<input type="file" id="upload-file-field" class="hide">');
                inputField.remove();
            }
        }
    });

});
