define([
    'agrc/modules/HelperFunctions',

    'dijit/Dialog',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/io/script',
    'dojo/json',
    'dojo/text!app/templates/Feedback.html',

    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/map',

    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/RadioButton',
    'dijit/form/Textarea',
    'dijit/form/ValidationTextBox',
    'dijit/layout/ContentPane',
    'dijit/layout/StackContainer',
    'dojox/validate/regexp'
],

function (
    helpers,

    Dialog,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    lang,
    script,
    dojoJson,
    template,

    ArcGISTiledMapServiceLayer,
    Map
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary
        //  displays a dialog box that users can submit feedback with
        //  based on widget with the same name in agrc.widgets.notify
            
        widgetsInTemplate: true,
        templateString: template,
        
        dialog: null,
        url: 'http://mapserv.utah.gov/WSUT/Notify.svc/XFeedback',
        successText: 'Thanks, we really do appreciate and encourage your feedback!',
        errorText: 'Sorry something went wrong and we did not receive your feedback. ' +
            'You can send an email directly to mpeters@utah.gov.',
        
        // properties that are passed in via constructor
        map: {},
        serviceName: 'None Provided',
        
        postMixInProperties: function(){
            console.log('app/Feedback:postMixInProperties', arguments);
            
            // create new dialog - this is a better method than trying to inherit from dijit.Dialog
            this.dialog = new Dialog({'class': 'feedback-dialog'});
        },  

        postCreate: function(){
            console.log('app/Feedback:postCreate', arguments);
            
            // set up dialog
            this.dialog.closeButtonNode.onClick = lang.hitch(this, 'hide');
            this.dialog.set('title', 'Report a Problem');
            this.placeAt(this.dialog.containerNode); // set('content', this.domNode) doesn't work
        },
            
        _clearMessage: function(){
            console.log('app/Feedback:_clearMessage', arguments);

            this.message.innerHTML = '';
        },
        
        show: function(){
            console.log('app/Feedback:show', arguments);
            
            // reset form
            this.form.reset();
            this.textarea.value = '';
            this.submitBtn.set('disabled', false);
            
            // show form
            // this.stackContainer.selectChild(this.formPane);
                
            this.dialog.show();
        },
        
        hide: function(){
            console.log('app/Feedback:hide', arguments);

            this.dialog.hide();         
        },  
        
        determineMapLocation: function(){
            console.log('app/Feedback:determineMapLocation', arguments);

            var extent;
            var scale;
            var layer;
            var layerIds;
            var centerX;
            var centerY;

            if (this.map instanceof Map) {
                extent = this.map.extent;
                scale = -1;
                layer = {};
                layerIds = this.map.layerIds;
                // _id = -1;
                centerX = extent.xmax - (extent.xmax - extent.xmin) / 2;
                centerY = extent.ymax - (extent.ymax - extent.ymin) / 2;
                
                if (array.some(layerIds, function(id){
                    layer = this.map.getLayer(id);
                    var x = layer instanceof ArcGISTiledMapServiceLayer;
                    return x;
                }, this)) {
                    scale = layer.tileInfo.lods[this.map.getLevel()].scale;
                }
                else {
                    var dpi = 96;
                    var imageWidth = this.map.width;
                    // var imageHeight = this.map.height;
                    var dpm = dpi / 2.54 * 100;
                    var width = (imageWidth / 2) / dpm;
                    
                    scale = (extent.xmax - centerX) / width;
                }
            }
            
            return '\nMap Scale: ' + scale + '\n\nMap centered at: \nx: ' + centerX + '\ny: ' + centerY;
        },
        
        submit: function () {
            console.log('app/Feedback:submit', arguments);

            var that = this;

            if (this.validate()) {
                this.submitBtn.set('disabled', true);
                this._clearMessage();
                
                var email = this.emailTxt.value;
                var feedback = this.textarea.value + '\n\n';
                var category = helpers.getSelectedRadioValue('feedback_rbGroup');
                
                var json = {
                    'emailAddress': email,
                    'comment': feedback,
                    'serviceName': this.serviceName + '|' + category,
                    'location': this.determineMapLocation()
                };
                var request = {
                    'feedback': dojoJson.stringify(json)
                };

                if (AGRC.disableFeedback) {
                    // this is used in testing
                    that.displayMessage(that.successText);
                } else {
                    script.get({
                        url: this.url,
                        callbackParamName: 'callback',
                        content: request,
                        load: function () {
                            that.displayMessage(that.successText);
                        },
                        error: function (err) {
                            that.showMessage(that.errorText);
                            that.submitBtn.set('disabled', false);
                            
                            if (err.status === 404) {
                                console.error('404 service not found');
                            }
                            else if (err.status === 500) {
                                console.error('500');
                            }
                        }
                    });
                    
                    // code below is for the new dojo/request/script module but it's broken at 1.8.3
                    // http://bugs.dojotoolkit.org/ticket/16408
                    // switch to this code after 1.8.4 going back to old dojo/io/script for now :(

                    // var jsonpArgs = {
                    //     jsonp: 'callback',
                    //     query: request,
                    //     timeout: 5000
                    // };
                    
                    // script.get(this.url, jsonpArgs).then(
                    //     function () {
                    //         that.displayMessage(this.successText);
                    //     }, function (err) {
                    //         that.showMessage(that.errorText);
                    //         that.submitBtn.set('disabled', false);
                            
                    //         if (err.status == 404) {
                    //             console.error('404 service not found');
                    //         }
                    //         else if (err.status == 500) {
                    //             console.error('500');
                    //         }
                    //     }
                    // );
                }
            }
        },
        
        validate: function(){
            console.log('app/Feedback:validate', arguments);

            return this.emailTxt.validate();
        },
        
        displayMessage: function(msg){
            console.log('app/Feedback:displayMessage', arguments);

            // set message
            this.message.innerHTML = msg;
            
            // show confirmation message
            this.stackContainer.selectChild(this.messagePane);
        }
    });
});