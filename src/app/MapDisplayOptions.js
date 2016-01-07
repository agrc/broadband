define([
    'agrc/widgets/map/_BaseMapSelector',

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
    'dojo/_base/array',
    'dojo/_base/declare',

    'dijit/form/CheckBox',
    'dijit/form/HorizontalSlider',
    'dijit/form/Select',
    'dojo/_base/sniff',
    'xstyle/css!app/resources/MapDisplayOptions.css'
], function (
    _BaseMapSelector,

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
    array,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _BaseMapSelector], {
        // summary: Contains controls that adjust the map display along with the legend
        // example:

        widgetsInTemplate: true,
        templateString: template,

        // properties passed in via params
        map: null,
        bbLayer: null, // broadband overlay layer
        bbLayerCached: null, // cached broadband overlay layer
        // basemapsLayer: null, // base map layers map service layer
        typeLegendImagePath: 'http://168.180.161.9/broadband/app/resources/images/type_legend.png',
        speedLegendImagePath: 'http://168.180.161.9/broadband/app/resources/images/speed_legend.png',


        constructor: function () {
            console.log('app/MapDisplayOptions:constructor', arguments);
        },
        postCreate: function () {
            console.log('app/MapDisplayOptions:postCreate', arguments);

            this.inherited(arguments);

            // init slider values
            this.overlaySlider.set('value', this.bbLayer.opacity);
            this.basemapsSlider.set('value', this.currentTheme.layers[0].opacity);

            this._updateLegendOpacity();

            // CSS browser hacks
            if (has('ie')) {
                query('.basemap-label').style('top', '0px');
                query('.fieldset').style('height', '165px');
            }

            this.connect(this.currentTheme.layers[0], 'onLoad', this.addBasemapOptions);

            new HelpPopup({
                title: 'Map Display Help',
                autoPosition: true
            }, this.displayHelp);
        },
        addBasemapOptions: function () {
            console.log('app/MapDisplayOptions:addBasemapOptions', arguments);

            // loop through layers in map service and add to select as options
            //        dojo.forEach(this.basemapsLayer.layerInfos, function(layerInfo){
            //            var baseMapCache = layerInfo.name.split(' | ')[1];
            //            var name = layerInfo.name.split(' | ')[0];
            //
            //            // add to select
            //            this.comboBox.addOption({
            //                // add the base map (ie 'vector') from the end of the layer
            //              // name to the id for later retrieval
            //                value: layerInfo.id + '|' + baseMapCache,
            //                label: name
            //            });
            //        }, this);

            // default to Hybrid
            this.changeTheme('Hybrid');

            this.connect(this.comboBox, 'onChange', this._onBasemapsComboBoxChange);
        },
        _updateLegendOpacity: function () {
            console.log('app/MapDisplayOptions:_updateLegendOpacity', arguments);

            // set legend block opacities
            domStyle.set(this.sliderLegend, 'opacity', this.bbLayer.opacity);
            domStyle.set(this.basemapsLegend, 'opacity', this.currentTheme.layers[0].opacity);
        },
        _onOverlayCheckBoxClick: function () {
            console.log('app/MapDisplayOptions:_onOverlayCheckBoxClick', arguments);

            var isChecked = this.overlayCheckBox.get('value');

            // toggle layers
            var layer = config.app.getCurrentCoverageLayer();
            layer.setVisibility(isChecked);

            this.overlaySlider.set('disabled', false);

            domClass.toggle(this.sliderLegend, 'gray');
        },
        _onOverlaySliderChange: function (newValue) {
            console.log('app/MapDisplayOptions:_onOverlaySliderChange', arguments);

            // adjust layer opacity
            this.bbLayer.setOpacity(newValue);
            this.bbLayerCached.setOpacity(newValue);

            this._updateLegendOpacity();
        },
        _onBasemapsCheckboxClick: function () {
            console.log('app/MapDisplayOptions:_onBasemapsCheckboxClick', arguments);

            // toggle layer visibility and select disable
            if (this.basemapsLayer.visible) {
                this.basemapsLayer.hide();
                this.comboBox.set('disabled', true);
                //            this.basemapsSlider.set('disabled', true);

                // show default base map
                this.changeTheme('Hybrid');
            } else {
                this.basemapsLayer.show();
                this.comboBox.set('disabled', false);
                //            this.basemapsSlider.set('disabled', false);
            }

            this._onBasemapsComboBoxChange();
        },
        _onBasemapsComboBoxChange: function () {
            console.log('app/MapDisplayOptions:_onBasemapsComboBoxChange', arguments);

            // make sure that the checkbox is clicked
            if (!this.comboBox.get('disabled')) {
                // set visible layer in dynamic service
                //            this.basemapsLayer.setVisibleLayers([this.comboBox.value.split('|')[0]]);

                // change cached service if needed
                //            this.changeTheme(this.comboBox.value.split('|')[1]);
                this.changeTheme(this.comboBox.value);

                this._adjustLayerOpacity(this.basemapsSlider.get('value'));

                //            this._updateLegendOpacity();
            }
        },
        _onBasemapsSliderChange: function (newValue) {
            console.log('app/MapDisplayOptions:_onBasemapsSliderChange', arguments);

            this._adjustLayerOpacity(newValue);

            this._updateLegendOpacity();
        },
        _adjustLayerOpacity: function (value) {
            // adjust layer opacity
            array.forEach(this.currentTheme.layers, function (layer) {
                layer.setOpacity(value);
            }, this);
        }
    });
});
