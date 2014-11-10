define([
	'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/MapDisplayOptions.html',
    'dojo/has',
    'dojo/query',
    'app/HelpPopup',
    'dojo/dom-style',
    'dojo/dom-construct',
	'dijit/TooltipDialog',
	'dijit/form/DropDownButton',
	'dojo/dom-class',
	'dojo/_base/array',
	'dijit/registry',

	'agrc/widgets/map/_BaseMapSelector',
	'dijit/form/CheckBox',
	'dijit/form/HorizontalSlider',
	'dijit/form/Select',
	'dijit/form/RadioButton',
	'dojo/_base/sniff'
], 

function (
	declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    has,
    query,
    HelpPopup,
    domStyle,
    domConstruct,
    TooltipDialog,
    DropDownButton,
    domClass,
    array,
    registry
	) {
	return declare('broadband.MapDisplayOptions',
	[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, agrc.widgets.map._BaseMapSelector], {
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
			console.log(this.declaredClass + '::' + arguments.callee.nom);
		},
		postCreate: function() {
			console.log(this.declaredClass + '::' + arguments.callee.nom);

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
			}, 'displayHelp');
			
			this.buildCAILegend();
		},
		buildCAILegend: function(){
			console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
			
			this.caiLegendImage = domConstruct.create('img', {
				src: this.typeLegendImagePath,
				alt: 'CAI Legend'	
			});
			
			var ttd = new TooltipDialog({
				content: this.caiLegendImage
			});
			
			new DropDownButton({
				label: 'Legend',
				dropDown: ttd,
				disabled: true
			}, 'drop-down');
			
			// this stuff is for getting a screen shot for the legend images. Couldn't get this to work otherwise.
			// this.CAIlegend = new esri.dijit.Legend({
					// map: this.map,
					// layerInfos: [{
						// layer: this.basemapsLayer,
						// title: 'Legend'
					// }],
					// respectCurrentMapScale: false
				// }, 'cai-legend');
				// this.CAIlegend.startup();
		},
		addBasemapOptions: function() {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			// loop through layers in map service and add to select as options
			//		dojo.forEach(this.basemapsLayer.layerInfos, function(layerInfo){
			//			var baseMapCache = layerInfo.name.split(' | ')[1];
			//			var name = layerInfo.name.split(' | ')[0];
			//
			//			// add to select
			//			this.comboBox.addOption({
			//				// add the base map (ie 'vector') from the end of the layer name to the id for later retrieval
			//				value: layerInfo.id + '|' + baseMapCache,
			//				label: name
			//			});
			//		}, this);

			// default to Hybrid
			this.changeTheme('Hybrid');

			this.connect(this.comboBox, 'onChange', this._onBasemapsComboBoxChange);
		},
		_updateLegendOpacity: function() {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			// set legend block opacities
			domStyle.set(this.sliderLegend, 'opacity', this.bbLayer.opacity);
			domStyle.set(this.basemapsLegend, 'opacity', this.currentTheme.layers[0].opacity);
		},
		_onOverlayCheckBoxClick: function() {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			var isChecked = this.overlayCheckBox.get('value');

			// toggle layers
			var layer = AGRC.app.getCurrentCoverageLayer();
			layer.setVisibility(isChecked);
			
			this.overlaySlider.set('disabled', false);

			domClass.toggle(this.sliderLegend, 'gray');
		},
		_onOverlaySliderChange: function(newValue) {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			// adjust layer opacity
			this.bbLayer.setOpacity(newValue);
			this.bbLayerCached.setOpacity(newValue);

			this._updateLegendOpacity();
		},
		_onBasemapsCheckboxClick: function() {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			// toggle layer visibility and select disable
			if (this.basemapsLayer.visible) {
				this.basemapsLayer.hide();
				this.comboBox.set('disabled', true);
				//			this.basemapsSlider.set('disabled', true);

				// show default base map
				this.changeTheme('Hybrid');
			} else {
				this.basemapsLayer.show();
				this.comboBox.set('disabled', false);
				//			this.basemapsSlider.set('disabled', false);
			}

			this._onBasemapsComboBoxChange();
		},
		_onBasemapsComboBoxChange: function() {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			// make sure that the checkbox is clicked
			if (!this.comboBox.get('disabled')) {
				// set visible layer in dynamic service
				//			this.basemapsLayer.setVisibleLayers([this.comboBox.value.split('|')[0]]);

				// change cached service if needed
				//			this.changeTheme(this.comboBox.value.split('|')[1]);
				this.changeTheme(this.comboBox.value);

				this._adjustLayerOpacity(this.basemapsSlider.get('value'));

				//			this._updateLegendOpacity();
			}
		},
		_onBasemapsSliderChange: function(newValue) {
			console.log(this.declaredClass + "::" + arguments.callee.nom);

			this._adjustLayerOpacity(newValue);

			this._updateLegendOpacity();
		},
		_adjustLayerOpacity: function(value) {
			// adjust layer opacity
			array.forEach(this.currentTheme.layers, function (layer) {
				layer.setOpacity(value);
			}, this);
		},
		_onCAICheckBoxChange: function () {
			// summary:
			//		Handles the onChange event for the cai checkbox.
			//		Toggles the layer visibility and widget disabled.
			console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
			
			var value = this.caiCheckbox.get('value');
			
			this.basemapsLayer.setVisibility(value);
			
			var widgets = query('[widgetId]', this.radioButtonContainer).map(registry.byNode);
			array.forEach(widgets, function(w){
				w.set('disabled', !value);
			});
		},
		_onCAIRadioChange: function(event){
			// summary:
			//		Handles when the CAI radio buttons change.
			//		Switches the displayed layer within the map document.
			console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);
			
			var layers = [];
			if(event.currentTarget.id === 'type-radio'){
				layers.push(0);
				this.caiLegendImage.src = this.typeLegendImagePath;
			}else{
				layers.push(1);
				this.caiLegendImage.src = this.speedLegendImagePath;
			}
			this.basemapsLayer.setVisibleLayers(layers);
		}
	});
});