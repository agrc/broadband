define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/has',
    'dojo/text!app/templates/HelpPopup.html',

    'dijit/Dialog',
    'dojo/_base/sniff',
    'xstyle/css!app/resources/HelpPopup.css'
],

function (
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    declare,
    has,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        // consists of a small icon that displays help content when clicked
        // it uses the contents of the original div to populate the dialog
        // use top, bottom, right, left to position
        // it's container must be position: relative or absolute
        //
        // example:
        // <div data-dojo-type='broadband.HelpPopup'>
        //      <div style='display: none;'> <!-- helps with layout problems -->
        //          Test Content
        //          <hr>
        //          Line 2
        //      </div>
        // </div>

        widgetsInTemplate: true,
        templateString: template,

        // properties passed in via the constructor

        // the title of the dialog
        title: '',

        postMixInProperties: function () {
            console.log('app/HelpPopup:postMixInProperties', arguments);

            // get dialog content from inner html of div
            this.content = this.srcNodeRef.firstChild.nextSibling.innerHTML;
        },

        postCreate: function () {
            console.log('app/HelpPopup:postCreate', arguments);

            // set dialog content & title
            this.dialog.set('content', this.content);
            this.dialog.set('title', this.title);

            this._wireEvents();
        },

        _wireEvents: function () {
            console.log('app/HelpPopup:_wireEvents', arguments);

            this.connect(this.image, 'onclick', this._onImageClick);
        },

        _onImageClick: function () {
            console.log('app/HelpPopup:_onImageClick', arguments);

            this.dialog.show();
        },
        destroyRecursive: function () {
            // summary:
            //      need to manually destroy the dialog
            console.log('app/HelpPopup:destroyRecursive', arguments);

            this.dialog.destroyRecursive();

            this.inherited(arguments);
        }
    });
});
