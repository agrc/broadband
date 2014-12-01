define([
    'dijit/Dialog',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/text!app/templates/Feedback.html',

    'ijit/widgets/notify/ChangeRequest',

    'dijit/form/Button'
],

function (
    Dialog,
    _WidgetsInTemplateMixin,

    declare,
    lang,
    template,

    ChangeRequest
) {

    return declare([ChangeRequest, _WidgetsInTemplateMixin], {
        // summary
        // overrides ChangeRequest with a few things like a dialog and non-bootstrap layout
            
        templateString: template,
        widgetsInTemplate: true,
        
        dialog: null,
        
        postMixInProperties: function(){
            console.log('app/Feedback:postMixInProperties', arguments);
            
            // create new dialog - this is a better method than trying to inherit from dijit.Dialog
            this.dialog = new Dialog({'class': 'feedback-dialog', title: 'Report a Problem'});

            this.inherited(arguments);
        },  
        postCreate: function(){
            console.log('app/Feedback:postCreate', arguments);
            
            // set up dialog
            this.dialog.closeButtonNode.onClick = lang.hitch(this, 'hide');
            this.placeAt(this.dialog.containerNode); // set('content', this.domNode) doesn't work

            this.inherited(arguments);
        },
        onDrawStart: function () {
            // summary:
            //      overriden to hide the dialog
            console.log('app/Feedback:onDrawStart', arguments);
        
            this.hide();

            this.inherited(arguments);
        },
        onDrawEnd: function () {
            // summary:
            //      description
            console.log('app/Feedback:onDrawEnd', arguments);
        
            this.show();

            this.inherited(arguments);
        },
        show: function(){
            console.log('app/Feedback:show', arguments);
            
            this.dialog.show();
        },
        hide: function(){
            console.log('app/Feedback:hide', arguments);

            this.dialog.hide();         
        }
    });
});