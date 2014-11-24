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

            playlist: [],

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
            uploadProgressWrapperStateClass: 'hide',

            // swap
            nextActiveField: '',

            // delete
            deleteTimeout: '',
            deleteAction: false,
            deleteTrackTitle: '',

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
                            inputField.parents('#upload-wrapper').siblings('.line-wrapper').children('.line-title').text(inputField[0].files[0].name);

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

                var element = inputField.parent('#upload-wrapper').siblings('.line-wrapper').children('.progressbar');

                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    DataHandler.uploadUserTrack(inputField[0].files[0], element);
                });

            },

            cancelUploadFile: function(inputField){
                var that = this;
                var uploadFileButton = inputField.parent('#upload-wrapper').find('#upload-control-wrapper  #cancel-upload-file');


                uploadFileButton.unbind('click');
                uploadFileButton.on('click', function(){
                    that.$data.triggerUploadFileStateClass = '';
                    inputField.parents('#upload-wrapper').siblings('.line-wrapper').children('.line-title').text('');
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

            swapUserTrack: function(key, direction, el){
                var swapButton = el.$el;

                if ($(swapButton).hasClass('playlist-button-active') || direction === 'up'){
                    key = parseInt(key) - 1;    

                    if (direction === 'up'){
                        var secondKey = key - 1;
                    } else {
                        var secondKey = key + 1;
                    }

                    var track1 = this.$data.playlist[key].t_id;
                    var track2 = this.$data.playlist[secondKey].t_id;

                    this.$data.nextActiveField = secondKey + 1;

                    DataHandler.swapUserTrack([track1, track2]);
                }
            },

            deleteUserTrack: function(el, tId){
                var that = this;
                var deleteButton = el.$el;
                var progressbar = $(deleteButton).parents('.playlist-button-wrapper').siblings('.line-wrapper').children('.progressbar');
                var lineTitle = $(deleteButton).parents('.playlist-button-wrapper').siblings('.line-wrapper').children('.line-title');

                this.$data.deleteTrackTitle = $(lineTitle).text();

                var counter = 100;

                this.$data.deleteAction = true;

                this.$data.deleteTimeout = setInterval(function(){

                    $(lineTitle).text('Tap to cancel!');
                    progressbar.css('width', counter + '%');
                    if(counter === 0){
                        DataHandler.deleteUserTrack(tId);
                        clearInterval(that.$data.deleteTimeout);
                        that.$data.deleteAction = false;
                        return false;
                    }
                    counter = counter - 1;
                }, 50);

            },

            clearUploadField: function(inputField){
                inputField.parent('#upload-wrapper').prepend('<input type="file" id="upload-file-field" class="hide">');
                inputField.remove();
            },

            downvoteTrack: function(trackId){
                if(this.$data.downvoteActiveStateClass === 'active'){
                    DataHandler.downvoteTrack(trackId);
                }
            },

            setPlaylistLine: function(el){
                var that = this;
                var element = el.$el;

                if (that.$data.deleteAction){
                    clearInterval(this.$data.deleteTimeout);
                    this.$data.deleteAction = false;
                    $(element).children('.line-wrapper').children('.progressbar').css('width', '0%');
                    $(element).children('.line-wrapper').children('.line-title').text(this.$data.deleteTrackTitle);
                } else {
                    console.log(this.$data.playlist);
                    if ($(element).hasClass('activePlaylist')){
                        that.$data.playlistLineActive = false;
                        $(element).removeClass('activePlaylist');
                        $(element).children('.playlist-button-wrapper').children('.swapdown-button').removeClass('playlist-button-active');
                    } else {
                        that.$data.playlistLineActive = true;
                        $(element).parents('ul').children().removeClass('activePlaylist');
                        $(element).parents('ul').children().children('.playlist-button-wrapper').children('.swapdown-button').removeClass('playlist-button-active');
                        $(element).addClass('activePlaylist');
                        $(element).children('.playlist-button-wrapper').children('.swapdown-button').addClass('playlist-button-active');
                    }
                }
            }
        }
    });

});
