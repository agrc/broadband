define([
    'dijit/Dialog',

    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    Dialog,

    declare,
    lang
) {
    return declare(null, {
        // description:
        //      Provides dialog methods to the widget.


        // dialog: Dialog
        dialog: null,

        // Properties to be sent into constructor

        // title: String
        //      The title of the dialog
        title: null,

        postMixInProperties: function () {
            // summary:
            //      create the dialog
            console.log('app/_DialogMixin:postMixInProperties', arguments);

            this.dialog = new Dialog({
                'class': this.baseClass + '-dialog',
                title: this.title
            });

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/_DialogMixin:postCreate', arguments);

            // set up dialog
            this.dialog.closeButtonNode.onClick = lang.hitch(this, 'hide');
            this.placeAt(this.dialog.containerNode); // set('content', this.domNode) doesn't work

            this.inherited(arguments);
        },
        show: function () {
            console.log('app/_DialogMixin:show', arguments);

            this.dialog.show();
        },
        hide: function () {
            console.log('app/_DialogMixin:hide', arguments);

            this.dialog.hide();
        }
    });
});
