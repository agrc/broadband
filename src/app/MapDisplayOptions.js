define([
    'app/config',
    'app/HelpPopup',

    'dijit/form/DropDownButton',
    'dijit/registry',
    'dijit/TooltipDialog',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/has',
    'dojo/query',
    'dojo/text!app/templates/MapDisplayOptions.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',

    'dijit/form/CheckBox',
    'dijit/form/HorizontalSlider',
    'dijit/form/Select',
    'dojo/_base/sniff'
], function (
    config,
    HelpPopup,

    DropDownButton,
    registry,
    TooltipDialog,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    domStyle,
    has,
    query,
    template,
    topic,
    array,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary: Contains controls that adjust the map display along with the legend
        // example:

        widgetsInTemplate: true,
        templateString: template,

        // properties passed in via params
        map: null,
        popLayer: null, // populated areas layer

        postCreate: function () {
            console.log('app/MapDisplayOptions:postCreate', arguments);

            this.inherited(arguments);

            // init slider values
            this.popSlider.set('value', this.popLayer.opacity);

            this._updateLegendOpacity();

            // CSS browser hacks
            if (has('ie')) {
                query('.fieldset').style('height', '165px');
            }

            new HelpPopup({
                title: 'Other Layers Help',
                autoPosition: true
            }, this.displayHelp);
        },
        _updateLegendOpacity: function () {
            console.log('app/MapDisplayOptions:_updateLegendOpacity', arguments);

            domStyle.set(this.popLegend, 'opacity', this.popLayer.opacity);
        },
        _onPopCheckBoxClick: function () {
            console.log('app/MapDisplayOptions:_onPopCheckBoxClick', arguments);

            this.popLayer.setVisibility(this.popCheckBox.get('value'));
        },
        _onPopSliderChange: function (newValue) {
            console.log('app/MapDisplayOptions:_onPopSliderChange', arguments);

            // adjust layer opacity
            this.popLayer.setOpacity(newValue);

            this._updateLegendOpacity();
        }
    });
});
