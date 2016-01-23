define([
    'app/config',
    'app/HelpPopup',
    'app/ListPicker',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/has',
    'dojo/query',
    'dojo/text!app/templates/MapDataFilter.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',

    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dijit/form/HorizontalRule',
    'dijit/form/HorizontalRuleLabels',
    'dijit/form/RadioButton',
    'dijit/form/Slider',
    'dojo/_base/sniff',
    'dojox/form/TriStateCheckBox',
    'xstyle/css!app/resources/MapDataFilter.css'
], function (
    config,
    HelpPopup,
    ListPicker,

    registry,
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
    declare,
    dojoEvent,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      Adjust's the definition query for the service areas

        widgetsInTemplate: true,
        templateString: template,

        layer: null, // set in setup - broadband map service layer
        updateTimer: null, // used to hold a timer in the onchange event of range sliders
        providersList: [], // list of all providers
        selectedProvidersIDs: [], // list of selected providers
        restricted: false, // disable provider selector
        showResetDialog: true, // controls whether the dialog is displayed after closing the list picker

        // dialogs: Widget[]
        //      dialogs associated with this widget
        //      for use in destroyRecursive
        dialogs: null,

        // setLayerDefTimeout: setTimeoutID
        //      see updateDefQuery
        setLayerDefTimeout: null,


        postCreate: function () {
            console.log('app/MapDataFilter:postCreate', arguments);

            var that = this;

            this.wireControlEvents();

            // listen for mapLayerLoaded event
            this.subscribe(config.topics.App.providersObtained, '_setProvidersList');

            // IE hack
            if (has('ie') <= 8) {
                domStyle.set(this.downloadSlider.domNode, 'width', '240px');
            }

            // create new Help Popups - has to be done programmatically here or offsets are not correct
            this.dialogs = [];
            this.dialogs.push(new HelpPopup({title: 'Maximum Advertised Speeds Help'}, this.speedsHelp));
            this.dialogs.push(new HelpPopup({title: 'Technology Type Help'}, this.typeHelp));

            this.dialogs.push(new HelpPopup({title: 'Broadband Providers Help'}, this.providersHelp));
            this.dialogs.push(this.satelliteDialog);
            this.dialogs.push(this.resetDialog);

            // show sat dialog onclick in provider results
            this.own(
                topic.subscribe(config.topics.ListProviders.onSatLinkClick, function () {
                    that.satelliteDialog.show();
                }),
                topic.subscribe(config.topics.MapDisplayOptions.updateLegendOpacity, function (newOpacity) {
                    query('.legend', that.domNode).style('opacity', newOpacity);
                })
            );

            this.initDragAndDrop();
        },
        initDragAndDrop: function () {
            // summary:
            //      sets up the drag and drop to reorder layers functionality
            console.log('app.MapDataFilter:initDragAndDrop', arguments);

            var that = this;

            var layerInfosByIndex = {};
            this.layer.on('load', function () {
                var layerInfos = that.layer.createDynamicLayerInfosFromLayerInfos();
                layerInfos.forEach(function (info) {
                    layerInfosByIndex[info.id] = info;
                });
                that.layer.setDynamicLayerInfos(layerInfos);
            });

            var reorderLayerInfos = function () {
                console.log('reorderLayerInfos');
                var newInfos = [1, 2, 3].map(function (i) {
                    var layerIndex = query('[data-slot="' + i + '"]', that.domNode)[0].dataset.layerIndex;
                    return layerInfosByIndex[layerIndex];
                });
                that.layer.setDynamicLayerInfos(newInfos);
                that.changeToDynamicLayer();
            };
            var draggables = query('div[draggable="true"]', this.domNode);
            var dropTargets = query('.drop-target', this.domNode);

            var draggingElement;

            var targetsAvailableToSlots = {
                '1': [3, 4],
                '2': [1, 4],
                '3': [1, 2]
            };

            var activateDropTargets = function (draggedElement) {
                targetsAvailableToSlots[draggedElement.dataset.slot]
                    .forEach(function toggle(i) {
                        domClass.add(that['dropTarget' + i], 'active');
                    });
            };
            var onDragEnd = function () {
                console.log('onDragEnd');
                dropTargets.removeClass('active');
                dropTargets.removeClass('over');
                draggingElement = null;
            };

            this.own(
                draggables.on('dragstart', function onDragStart(evt) {
                    console.log('dragstart');
                    evt.dataTransfer.effectAllowed = 'move';

                    // this needs to be in a setTimeout because of this: http://stackoverflow.com/questions/14203734/dragend-dragenter-and-dragleave-firing-off-immediately-when-i-drag
                    setTimeout(lang.partial(activateDropTargets, this), 0);
                    draggingElement = this;
                }),
                draggables.on('dragend', onDragEnd),
                dropTargets.on('dragover', function onDragOver(evt) {
                    console.log('dragover');
                    evt.preventDefault();
                    evt.stopPropagation();

                    evt.dataTransfer.dropEffect = 'move';

                    return false;
                }),
                dropTargets.on('dragenter', function onDragEnter() {
                    console.log('dragenter');
                    domClass.add(this, 'over');
                }),
                dropTargets.on('dragleave', function onDragLeave() {
                    console.log('dragleave');
                    domClass.remove(this, 'over');
                }),
                dropTargets.on('drop', function onDrop(evt) {
                    console.log('drop');
                    evt.preventDefault();
                    evt.stopPropagation();

                    that.bumpElements(draggingElement, this);

                    onDragEnd();

                    reorderLayerInfos();
                })
            );
        },
        bumpElements: function (droppedElement, dropTarget) {
            // summary:
            //      moves droppedElement to newSlot and adjusted the other draggable elements accordingly
            // droppedElement: Node
            // dropTarget: Node
            console.log('app.MapDataFilter:bumpElements', arguments);

            // move dropped element to new slot
            domConstruct.place(droppedElement, dropTarget, dropTarget.dataset.dropPosition);
            var targetSlot = parseInt(dropTarget.dataset.targetSlot);
            var newSlotNum = (dropTarget.dataset.dropPosition === 'before') ? targetSlot - 1 : targetSlot;
            var oldSlotNum = droppedElement.dataset.slot;

            var that = this;
            var bump = function (fromSlotNum, toSlotNum) {
                var bumpElement = query('[draggable="true"][data-slot="' + fromSlotNum + '"]', that.domNode)[0];
                domConstruct.place(bumpElement, that['dropTarget' + toSlotNum], 'after');
                bumpElement.dataset.slot = toSlotNum;
            };
            var bumpIndex = function (index, spaces) {
                if (index > spaces) {
                    return index - spaces;
                } else {
                    return index - spaces + 3;
                }
            };
            var diff = newSlotNum - oldSlotNum;
            if (Math.abs(diff) === 2) {
                // moving more than two slots
                if (diff > 0) {
                    bump(bumpIndex(newSlotNum, 1), bumpIndex(newSlotNum, 2));
                } else {
                    bump(bumpIndex(newSlotNum, -1), bumpIndex(newSlotNum, -2));
                }
            }
            if (diff > 0) {
                bump(newSlotNum, bumpIndex(newSlotNum, 1));
            } else {
                bump(newSlotNum, bumpIndex(newSlotNum, -1));
            }

            droppedElement.dataset.slot = newSlotNum;
        },
        wireControlEvents: function () {
            console.log('app/MapDataFilter:wireControlEvents', arguments);

            var dij;
            var that = this;

            function disableMouseWheel(slider) {
                slider._mouseWheeled = function () {};
            }

            this.connect(this.downloadSlider, 'onChange', this._setTimer);
            disableMouseWheel(this.downloadSlider);
            this.connect(this.uploadSlider, 'onChange', this._setTimer);
            disableMouseWheel(this.uploadSlider);
            this.connect(this.cbxWireBased, 'onClick', function () {
                that._onTransCheckBoxChange(that.cbxWireBased);
            });
            this.connect(this.btnSelectProviders, 'onClick', this.launchListPicker);
            this.connect(this.chbxShowAll, 'onChange', this.updateDefQuery);
            this.connect(this.chbxShowOnly, 'onClick', this.updateDefQuery);
            this.connect(this.btnResetOK, 'onClick', this._onResetOK);
            this.connect(this.btnSatelliteOK, 'onClick', this._onSatelliteOK);
            this.connect(this.moreInfoLink, 'onclick', this._onSatelliteInfoClick);
            this.connect(this.resetBtn, 'onClick', this._onResetClick);

            function wireSubCheckBoxes(parentCheckBoxId) {
                query('.trans-list.sub input').forEach(function (node) {
                    dij = registry.getEnclosingWidget(node);
                    that.connect(dij, 'onClick', function () {
                        that._onSubCheckBoxChange(that[parentCheckBoxId]);
                    });
                });
            }

            wireSubCheckBoxes(this.cbxWireBased.id);

            this.connect(this.cbxFixedWireless, 'onClick', this.updateDefQuery);
            this.connect(this.cbxMobileWireless, 'onClick', this.updateDefQuery);
        },
        _setProvidersList: function (providersObject) {
            console.log('app/MapDataFilter:_setProvidersList', arguments);

            // create new array and populate from object
            for (var i in providersObject) {
                if (providersObject.hasOwnProperty(i)) {
                    var prov = providersObject[i];
                    this.providersList.push([prov.name, i]);
                }
            }

            // enable Select button
            if (this.restricted === false) {
                this.btnSelectProviders.set('disabled', false);
            }
        },
        _setTimer: function () {
            console.log('app/MapDataFilter:_setTimer', arguments);

            // use a timer to make sure that this function doesn't fire a lot when changing range sliders
            clearTimeout(this.updateTimer);
            this.updateTimer = setTimeout(lang.hitch(this, this.updateDefQuery), 500);
        },
        updateDefQuery: function () {
            console.log('app/MapDataFilter:updateDefQuery', arguments);

            var that = this;
            var defQueryProps = {};
            var transTypes;

            // clear any previous timers
            if (this.setLayerDefTimeout) {
                window.clearTimeout(this.setLayerDefTimeout);
                this.setLayerDefTimeout = null;
            }

            // Download slider
            // get start and end values for slice function on array
            var queryTxt = config.fieldNames.MAXADDOWN + ' >= ' + config.speedsDomain[this.downloadSlider.value];
            defQueryProps.minDownSpeed = this.downloadSlider.get('value');

            // Upload slider
            queryTxt += ' AND ' + config.fieldNames.MAXADUP + ' >= ' + config.speedsDomain[this.uploadSlider.value];
            defQueryProps.minUpSpeed = this.uploadSlider.get('value');

            // check to see if we should show the satellite providers link in results table
            var showSatLink = (this.downloadSlider.value >= 5 && this.uploadSlider.value >= 7);
            topic.publish(config.topics.MapDataFilter.updateSatLinkVisibility, showSatLink);

            transTypes = this._getTransTypes();
            if (transTypes.length > 0) {
                if (transTypes.length < 9) {
                    defQueryProps.transTypes = transTypes;
                    queryTxt += ' AND ' + config.fieldNames.TRANSTECH + ' IN (' + transTypes + ')';
                }
            } else {
                defQueryProps.transTypes = -1;
                queryTxt += ' AND ' + config.fieldNames.TRANSTECH + ' = -1';
            }

            // Providers
            if (this.chbxShowOnly.checked) {
                domStyle.set(this.providerList, 'color', 'black');
                if (this.selectedProvidersIDs.length > 0) {
                    queryTxt += ' AND ' + config.fieldNames.UTProvCode + ' IN (' + this.selectedProvidersIDs + ')';
                    defQueryProps.providers = array.map(this.selectedProvidersIDs, function (id) {
                        return id.slice(1, id.length - 1);
                    });
                } else {
                    queryTxt += ' AND ' + config.fieldNames.UTProvCode + ' = \'-1\'';
                    defQueryProps.providers = -1;
                }
            } else {
                domStyle.set(this.providerList, 'color', 'grey');
            }

            // update query definitions for first 3 layers
            var layerDefs = [queryTxt, queryTxt, queryTxt];
            console.info(layerDefs[1]);

            // trying to prevent tons of calls to the server
            this.setLayerDefTimeout = window.setTimeout(function () {
                that.layer.setLayerDefinitions(layerDefs);
                console.log('def set');

                that.changeToDynamicLayer();
            }, 1250);

            // enable reset button
            this.resetBtn.set('disabled', false);

            // publish new query
            topic.publish(config.topics.MapDataFilter.onQueryUpdate, queryTxt);
            topic.publish(config.topics.Router.onDefQueryUpdate, defQueryProps);
        },
        changeToDynamicLayer: function () {
            // summary:
            //      switches to the dynamic map service layer
            console.log('app.MapDataFilter:changeToDynamicLayer', arguments);

            // change to dynamic coverage layer
            config.bbLayer.show();
            config.bbLayerCached.hide();
            config.currentLayer = config.bbLayer;
        },
        _getTransTypes: function () {
            // summary:
            //      returns the values associates with the trans types checkboxes
            console.log('app/MapDataFilter:_getTransTypes', arguments);
            var ttValues = [];
            var newArray;

            [this.cbxCable, this.cbxDSL, this.cbxFiber, this.cbxFixedWireless, this.cbxMobileWireless]
                .forEach(function (widget) {
                    if (widget.get('checked')) {
                        newArray = widget.get('value');
                        ttValues = ttValues.concat(newArray);
                    }
                });

            return ttValues;
        },
        launchListPicker: function () {
            console.log('app/MapDataFilter:launchListPicker', arguments);

            var that = this;

            // create list picker if needed
            if (!config.listPicker) {
                // create new list picker
                config.listPicker = new ListPicker({
                    listName: 'Providers',
                    availableListArray: this.providersList
                });

                // wire event to listen for OK button
                topic.subscribe(config.topics.listpickerOnOK, function (selectedItems) {
                    that._onListPickerOK(selectedItems);
                });
            }

            config.listPicker.show();
        },
        _onListPickerOK: function (selectedItems) {
            console.log('app/MapDataFilter:_onListPickerOK', arguments);

            this.resetFilters(false);

            // display dialog
            if (this.showResetDialog) {
                this.resetDialog.show();
            }

            // clear existing lists
            this.providerList.innerHTML = '';
            this.selectedProvidersIDs = [];

            // process new providers list
            if (selectedItems.length === 0) {
                // switch back to showing all providers
                this.chbxShowAll.set('checked', true);

                // add no providers
                var li = domConstruct.create('li');
                li.innerHTML = 'No Providers Selected';
                this.providerList.appendChild(li);
            } else {
                array.forEach(selectedItems, function (item) {
                    // add to id list
                    this.selectedProvidersIDs.push('\'' + item[1] + '\'');

                    // add to list
                    var li = domConstruct.create('li');
                    li.innerHTML = item[0].replace('&', '&amp;'); // replace & for IE;
                    this.providerList.appendChild(li);
                }, this);

                this.chbxShowOnly.set('checked', true);
            }

            this.updateDefQuery();

            // enable reset button
            this.resetBtn.set('disabled', false);

            // change to dynamic coverage layer
            config.bbLayer.show();
            config.bbLayerCached.hide();
        },
        disableProviderSelector: function () {
            console.log('app/MapDataFilter:disableProviderSelector', arguments);

            // this method was built for the provider preview to disable the ability to see other
            // provider's data

            // disable warning dialog
            this.showResetDialog = false;

            // check show only radio button
            this.chbxShowOnly.set('checked', true);

            // disable controls
            this.chbxShowAll.set('disabled', true);
            this.chbxShowOnly.set('disabled', true);
            this.btnSelectProviders.set('disabled', true);

            // set switch to prevent _setProvidersList from re-enabling the Select Providers button
            this.restricted = true;
        },
        _onResetOK: function () {
            console.log('app/MapDataFilter:_onResetOK', arguments);

            // store checkbox value
            this.showResetDialog = !this.chbxShowAgain.get('checked');

            this.resetDialog.hide();
        },
        resetFilters: function (resetProviders) {
            console.log('app/MapDataFilter:resetFilters', arguments);

            // reset controls
            this.downloadSlider.set('value', '9');
            this.uploadSlider.set('value', '10');
            this.cbxWireBased.set('value', 'on');
            query('.trans-list input').forEach(function (node) {
                registry.getEnclosingWidget(node).set('checked', true);
            });
            if (resetProviders && this.restricted === false) {
                this.chbxShowAll.set('checked', true);
            }
        },
        _onSatelliteInfoClick: function (event) {
            console.log('app/MapDataFilter:_onSatelliteInfoClick', arguments);

            this.satelliteDialog.show();
            dojoEvent.stop(event);
        },
        _onSatelliteOK: function () {
            console.log('app/MapDataFilter:_onSatelliteOK', arguments);

            this.satelliteDialog.hide();
        },
        _onResetClick: function () {
            console.log('app/MapDataFilter:_onResetClick', arguments);

            this.resetFilters(true);

            topic.publish(config.topics.MapDataFilter.onResetFilter);

            // disable button
            this.resetBtn.set('disabled', true);

            // only switch back to cached layer if zoomed out beyond break point
            if (config.map.getLevel() < config.breakPointLevel) {
                // switch to cached layer
                config.bbLayer.hide();
                config.bbLayerCached.show();
                config.currentLayer = config.bbLayerCached;
            }
        },
        destroyRecursive: function () {
            // summary:
            //      need to remove the associated dialogs manually for tests to work
            console.log('app/MapDataFilter:destroyRecursive', arguments);

            array.forEach(this.dialogs, function (d) {
                d.destroyRecursive(false);
            });

            this.inherited(arguments);
        },
        _onSubCheckBoxChange: function (parentCheckBox, updateDefQuery) {
            // summary:
            //      updates the parent checkbox
            // parentCheckBox: TriStateCheckBox
            // updateDefQuery: ?Boolean (defaults to true)
            console.log('app/MapDataFilter:_onSubCheckBoxChange', arguments);
            var dij;
            var falseValues = [];
            var value;
            var boxes;

            if (updateDefQuery === undefined) {
                updateDefQuery = true;
            }

            // query for related sub checkboxes
            boxes = query('.trans-list.sub input').forEach(function (node) {
                dij = registry.getEnclosingWidget(node);
                value = dij.get('value');
                if (value === false) {
                    falseValues.push(value);
                }
            });

            if (falseValues.length === boxes.length) {
                // no checkboxes selected
                parentCheckBox.set('value', false);
            } else if (falseValues.length > 0) {
                // some checkboxes selected
                parentCheckBox.set('value', 'mixed');
            } else {
                // all checkboxes are selected
                parentCheckBox.set('value', 'on');
            }

            if (updateDefQuery) {
                this.updateDefQuery();
            }
        },
        _onTransCheckBoxChange: function (chbox) {
            // summary:
            //      updates the sub checkboxes for the trans checkbox
            // chbox: TriStateCheckBox
            console.log('app/MapDataFilter:_onTransCheckBoxChange', arguments);
            var value = chbox.get('value');

            function setSubs(checked) {
                query('.trans-list.sub input').forEach(function (node) {
                    registry.getEnclosingWidget(node).set('checked', checked);
                });
            }

            if (value === 'mixed') {
                chbox.set('value', 'on');
                setSubs(true);
            } else if (value === 'on') {
                setSubs(true);
            } else {
                setSubs(false);
            }

            this.updateDefQuery();
        },
        selectTransTypes: function (transTypes) {
            // summary:
            //      called by app/Router
            // transTypes: Number[]
            console.log('app/MapDataFilter:selectTransTypes', arguments);

            var values;
            [this.cbxCable, this.cbxDSL, this.cbxFiber, this.cbxFixedWireless, this.cbxMobileWireless]
                .forEach(function (chbox) {
                    // need to do this to make sure that we get
                    // the correct return value for value
                    chbox.set('checked', true);
                    values = chbox.get('value');
                    if (transTypes !== null) {
                        if (array.some(values, function (val) {
                            return array.indexOf(transTypes, val) !== -1;
                        })) {
                            chbox.set('checked', true);
                        } else {
                            chbox.set('checked', false);
                        }
                    }
                });

            this._onSubCheckBoxChange(this.cbxWireBased, false);

            this.updateDefQuery();
        },
        setSlider: function (sliderType, value) {
            // summary:
            //      called by app/Router to manually set the slider values
            // sliderType: String (up || down)
            // value: Number
            console.log('app/MapDataFilter:setSlider', arguments);

            var slider = (sliderType === 'down') ? this.downloadSlider : this.uploadSlider;

            slider.set('value', value);

            this.updateDefQuery();
        }
    });
});
