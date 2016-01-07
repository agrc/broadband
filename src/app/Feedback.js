define([
    'app/_DialogMixin',

    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/text!app/templates/Feedback.html',

    'ijit/widgets/notify/ChangeRequest',

    'dijit/form/Button',
    'xstyle/css!app/resources/Feedback.css'
],

function (
    _DialogMixin,

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

            this.inherited(arguments);
        },
        onDrawEnd: function () {
            // summary:
            //      description
            console.log('app/Feedback:onDrawEnd', arguments);

            this.show();

            this.inherited(arguments);
        }
    });
});
