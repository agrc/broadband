define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/HelpPopup.html',
    'dojo/has',

    'dijit/Dialog',
    'dojo/_base/sniff'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    has
    ) {
    return declare('app.HelpPopup', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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
        
        // properites passed in via the constructor

        // the title of the dialog
        title: '',
        
        postMixInProperties: function(){
            console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
            
            // get dialog content from inner html of div
            if (has('ie')){
                this.content = this.srcNodeRef.firstChild.innerHTML;
            } else {
                this.content = this.srcNodeRef.firstChild.nextSibling.innerHTML;
            }
        },
        
        postCreate: function(){
            console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
            
            // set dialog content & title
            this.dialog.set('content', this.content);
            this.dialog.set('title', this.title);
            
            this._wireEvents();
        },
        
        _wireEvents: function(){
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.connect(this.image, 'onclick', this._onImageClick);
        },
        
        _onImageClick: function(){
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.dialog.show();
        },
        destroyRecursive: function () {
            // summary:
            //      need to manually destroy the dialog
            console.log(this.declaredClass + "::destroyRecursive", arguments);
        
            this.dialog.destroyRecursive();

            this.inherited(arguments);
        }
    });
});