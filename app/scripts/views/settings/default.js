define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'tourGuide',
    'text!../../templates/settings/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, TourGuide, DefaultTemplate) {
    'use strict';

    Vue.component('settings', {
        el: '#settings',
        file: '',
        template: DefaultTemplate,

        ready: function() {
            ComponentCollection.addComponent('settings', this.$data);

            // check if tour guide should be shown or not
            TourGuide.checkTourGuideModeStatus();
        },

        data: {
            langSettings: '',
            route: 'no route',
            userImageUrl: '',
            internetAccess: '',
            downvoteLevel: '',

            // upload message
            uploadProgressImageMessage: '',

            // css classes
            triggerUploadFileStateClass: '',
            uploadFileControlWrapperStateClass: 'hide',
            fileControlStateClass: 'hide',
            uploadProgressWrapperStateClass: 'hide'
            
        },

        methods: {
            triggerFileBrowser: function(e){
                e.stopPropagation();
                
                // select file upload field
                var inputField = $(e.target).parents('#image-upload-wrapper').find('#upload-image-field');
                
                // open file browser
                inputField.trigger('click');
                
                // set event on change input field
                this.setOnChangeEventlistenerFileUpload(inputField);

            },

            setOnChangeEventlistenerFileUpload: function(inputField){
                var that = this;
                inputField.unbind('change');

                inputField.on('change', function(e){
                    if(inputField[0].files[0] !== undefined){
                        if(that.checkFile(inputField) === true){
                            // set state css 
                            that.$data.triggerUploadFileStateClass = 'hide';
                            that.$data.uploadFileControlWrapperStateClass = '';
                            // upload file
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
                var that = this;
                var uploadFileButton = inputField.parent('#image-upload-wrapper').find('#upload-image-control-wrapper #upload-image');
                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    DataHandler.uploadUserImage(inputField[0].files[0]);
                });

            },

            cancelUploadFile: function(inputField){
                var that = this;
                var uploadFileButton = inputField.parent('#image-upload-wrapper').find('#upload-image-control-wrapper #cancel-upload-image');

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    that.$data.triggerUploadFileStateClass = '';
                    that.$data.uploadFileControlWrapperStateClass = 'hide';
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

            deleteUserImage: function(){
                DataHandler.deleteUserImage();
            },

            clearUploadField: function(inputField){
                // only clear input value --> doesn‘t work correctly
                // better to remove and add new one
                inputField.parent('#image-upload-wrapper').prepend('<input type="file" id="upload-image-field" class="hide">');
                inputField.remove();
            },

            setInternetAccess: function(e){
                DataHandler.setInternetAccess();
            },

            setDownvoteLevel: function(level){
                DataHandler.setDownvoteLevel(level);
            }
        }
    });

});
