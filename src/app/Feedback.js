define([
    'app/_DialogMixin',
    'app/config',

    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/text!app/templates/Feedback.html',

    'ijit/widgets/notify/ChangeRequest',

    'dijit/form/Button'
],

function (
    _DialogMixin,
    config,

    _WidgetsInTemplateMixin,

    declare,
    template,

    ChangeRequest
) {

    return declare([ChangeRequest, _WidgetsInTemplateMixin, _DialogMixin], {
        // summary
        // overrides ChangeRequest with a few things like a dialog and non-bootstrap layout

        templateString: template,
        widgetsInTemplate: true,

        onDrawStart: function () {
            // summary:
            //      overriden to hide the dialog
            console.log('app/Feedback:onDrawStart', arguments);

            this.hide();

            config.isDrawing = true;

            this.inherited(arguments);
        },
        onDrawEnd: function () {
            // summary:
            //      description
            console.log('app/Feedback:onDrawEnd', arguments);

            this.show();

            config.isDrawing = false;

            this.inherited(arguments);
        },
        completed: function () {
            this.hide();
        }
    });
});
