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
            uploadProgressWrapperStateClass: 'hide',
            uploadImageFilename: 'hide',

            // delete
            deleteTimeout: '',
            deleteAction: false,
            deleteImage: ''
            
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
                            that.$data.fileControlStateClass = 'hide';
                            that.$data.uploadFileControlWrapperStateClass = '';
                            that.$data.uploadImageFilename = '';
                            inputField.parents('#image-upload-wrapper').siblings('.image-text').children('.image-name').text(inputField[0].files[0].name);

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

                var element = inputField.parents('#image-upload-wrapper').siblings('.image-text').children('.progressbar')

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    inputField.parents('#image-upload-wrapper').siblings('.image-text').children('.image-name').text('');
                    DataHandler.uploadUserImage(inputField[0].files[0], element);
                });
            },

            cancelUploadFile: function(inputField){
                var that = this;
                var uploadFileButton = inputField.parent('#image-upload-wrapper').find('#upload-image-control-wrapper #cancel-upload-image');

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    that.$data.triggerUploadFileStateClass = '';
                    that.$data.fileControlStateClass = '';
                    that.$data.uploadFileControlWrapperStateClass = 'hide';
                    that.$data.uploadImageFilename = 'hide';
                    inputField.parents('#image-upload-wrapper').siblings('.image-text').children('.image-name').text('');
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

            deleteUserImage: function(el){
                if (this.$data.deleteAction === false){

                    this.$data.uploadImageFilename = '';

                    var that = this;
                    var view = $(el.$el);
                    var imageText = view.children('#settings').children('.image-text');
                    var progressbar = imageText.children('.progressbar');
                    var imageName = imageText.children('.image-name');

                    var counter = 100;

                    this.$data.deleteAction = true;

                    this.$data.deleteTimeout = setInterval(function(){
                        imageName.text('Tap to cancel!');
                        progressbar.css('width', counter + '%');
                        if(counter === 0){
                            DataHandler.deleteUserImage();
                            clearInterval(that.$data.deleteTimeout);
                            that.$data.deleteAction = false;
                            imageName.text('');
                            that.$data.uploadImageFilename = 'hide';
                            return false;
                        }
                        counter = counter - 1;
                    }, 50);
                }
            },

            cancelDelete: function(el){
                var that = this;
                var element = $(el.$el);

                if (that.$data.deleteAction){
                    clearInterval(this.$data.deleteTimeout);
                    this.$data.deleteAction = false;
                    var imageText = element.children('#settings').children('.image-text');
                    imageText.children('.progressbar').css('width', '0%');
                    imageText.children('.image-name').text('');
                    this.$data.uploadImageFilename = 'hide';
                }
            },

            clearUploadField: function(inputField){
                // only clear input value --> doesn‘t work correctly
                // better to remove and add new one
                inputField.parent('#image-upload-wrapper').prepend('<input type="file" id="upload-image-field" class="hide">');
                inputField.remove();
            },

            setInternetAccess: function(){
                DataHandler.setInternetAccess();
            },

            setDownvoteLevel: function(level){
                DataHandler.setDownvoteLevel(level);
            }
        }
    });

});
