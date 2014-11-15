define([
    'vue',
    'error',
    'debug',
    'dataHandler',
    'translation',
    'componentCollection',
    'text!../../templates/home/default.html'
], function(Vue, ErrorHandler, DebugHandler, DataHandler, TranslationHandler, ComponentCollection, DefaultTemplate) {
    'use strict';

    Vue.component('home', {
        el: '#home',
        file: '',
        template: DefaultTemplate,

        ready: function() {
            ComponentCollection.addComponent('home', this.$data);
        },

        data: {
            langHome: '',
            route: 'no route',

            userTrackUrl: '',

            album: 'no album',
            artist: 'no artist',
            title: 'not title',
            length: 0,
            id: 0,
            
            // dj image
            imageOne: '',
            imageTwo: '',
            djImageStateClassOne: '',
            djImageStateClassTwo: '',
            djImageInfoStateClass: '',
            djImageInfo: 'Your DJ!',

            // downvote
            downvote: 0,
            downvoteActiveStateClass: 'active',
            downvoteDisabledStateClass: '',
            downvoteResponseMessageStateClass: '',
            downvoteResponseMessage: '',

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
                var uploadFileButton = inputField.parent('#upload-wrapper').find('#upload-control-wrapper  #upload-file');
                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    DataHandler.uploadUserTrack(inputField[0].files[0]);
                });

            },

            cancelUploadFile: function(inputField){
                var that = this;
                var uploadFileButton = inputField.parent('#upload-wrapper').find('#upload-control-wrapper  #cancel-upload-file');

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    that.$data.triggerUploadFileStateClass = '';
                    that.$data.uploadFileControlWrapperStateClass = 'hide';
                    that.clearUploadField(inputField);
                });
            },

            checkFile: function(inputField){
                var allowedFileTypes = ['audio/mpeg', 'audio/x-mpeg', 'audio/x-mpeg-3', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'video/ogg', 'audio/ogg', 'audio/opus', 'audio/vorbis', 'audio/vnd.wav', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/aiff', 'audio/x-aiff'];
                var fileType = inputField[0].files[0].type;
                
                // check if file type is allowed
                if($.inArray(fileType, allowedFileTypes) >= 0){
                    return true;
                } else {
                    return false;
                }

            },

            deleteUserTrack: function(){
                DataHandler.deleteUserTrack();
            },

            clearUploadField: function(inputField){
                // only clear input value --> doesn‘t work correctly
                // better to remove and add new one
                inputField.parent('#upload-wrapper').prepend('<input type="file" id="upload-file-field" class="hide">');
                inputField.remove();
            },

            downvoteTrack: function(trackId){
                if(this.$data.downvoteActiveStateClass === 'active'){
                    DataHandler.downvoteTrack(trackId);
                }
            }
        }
    });

});
