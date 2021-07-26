define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Feedback',
    'app/GeoSearch',
    'app/GroupLayer',
    'app/HelpPopup',
    'app/ListProviders',
    'app/MapDataFilter',
    'app/MapDisplayOptions',
    'app/PrintDialog',
    'app/Router',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/fx',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'layer-selector',

    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/CheckBox'
], function (
    BaseMap,

    config,
    Feedback,
    GeoSearch,
    GroupLayer,
    HelpPopup,
    ListProviders,
    MapDataFilter,
    MapDisplayOptions,
    PrintDialog,
    Router,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    dom,
    domConstruct,
    domStyle,
    on,
    template,
    topic,
    array,
    declare,
    dojoEvent,
    fx,
    lang,

    Extent,
    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    Query,
    QueryTask,

    LayerSelector
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'broadband-app',

        // openPopout: dojo/Animation
        //      opens the popout menu
        openPopup: null,

        // closePopout: dojo/Animation
        //      closes the popout menu
        closePopout: null,

        // popoutOpen: Boolean
        //      keeps track of whether the popout is open or closed
        popoutOpen: false,

        // size: String (small || large)
        //      Keeps track of whether the layout has been switched for
        //      smaller screens
        size: 'large',

        // listProviders: app/ListProviders
        listProviders: null,


        constructor: function () {
            console.log('app/App:constructor', arguments);

            config.app = this;
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/App:postCreate', arguments);

            // load only the associated provider data
            // TODO: hook up to url parameter
            //  filterByProviderIdNum();

            // load all providers
            this.getProvidersList();

            this.wireEvents();

            this.setUpMap();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for this widget
            console.log('app/App:wireEvents', arguments);
            var that = this;
            var mq;

            this.own(
                // set up text links
                this.connect(this.mapHelpText, 'onclick', function (evt) {
                    evt.preventDefault();
                    that.mapHelpDialog.show();
                }),
                this.connect(this.aboutMapText, 'onclick', function (evt) {
                    evt.preventDefault();
                    that.aboutMapDialog.show();
                }),
                this.connect(this.feedbackLink, 'onclick', function (evt) {
                    evt.preventDefault();
                    that.onFeedbackLinkClick();
                }),
                on(this.popoutLink, 'click', function (evt) {
                    evt.preventDefault();
                    that.onPopoutLinkClick();
                }),
                on(this.cbxDisclaimer, 'click', function () {
                    localStorage.skipDisclaimer = that.cbxDisclaimer.get('checked');
                }),
                on(this.disclaimerLink, 'click', function (evt) {
                    evt.preventDefault();
                    that.disclaimerDialog.show();
                }),
                on(this.headerContainer, 'click', function () {
                    if (that.popoutOpen) {
                        that.onPopoutLinkClick();
                    }
                })
            );

            // wire media query events
            if (window.matchMedia) {
                mq = window.matchMedia('(max-width: 1024px)');
                mq.addListener(function (query) {
                    that.onMediaQueryChange(query);
                });
                this.onMediaQueryChange(mq);
            }
        },
        onMediaQueryChange: function (mq) {
            // summary:
            //      fires when the media query changes
            // mq: MediaQuery
            console.log('app/App:onMediaQueryChange', arguments);

            if (mq.matches) {
                this.size = 'small';
                domConstruct.place(this.leftNav, this.popoutMenu);
                domConstruct.place(this.rightNav, this.popoutMenu);
            } else {
                this.size = 'large';
                domConstruct.place(this.leftNav, this.middleContainer);
                domConstruct.place(this.rightNav, this.middleContainer);
            }
        },
        onPopoutLinkClick: function () {
            // summary:
            //      Fires when the user clicks on the popout menu link
            console.log('app/App:onPopoutLinkClick', arguments);

            var animation;
            var that = this;

            function cancelAnimation(anim) {
                if (anim) {
                    if (anim.status() === 'playing') {
                        anim.stop(true);
                    }
                }
            }

            cancelAnimation(this.openPopout);
            cancelAnimation(this.closePopout);

            if (!this.popoutOpen) {
                if (!this.openPopout) {
                    this.openPopout = fx.animateProperty({
                        node: this.popoutMenu,
                        properties: {
                            left: 0
                        },
                        onEnd: function () {
                            that.popoutOpen = true;
                        }
                    });
                }
                animation = this.openPopout;
            } else {
                if (!this.closePopout) {
                    this.closePopout = fx.animateProperty({
                        node: this.popoutMenu,
                        properties: {
                            left: -300
                        },
                        onEnd: function () {
                            that.popoutOpen = false;
                        }
                    });
                }
                animation = this.closePopout;
            }

            animation.play();
        },
        getProvidersList: function () {
            console.log('app/App:getProvidersList', arguments);

            var that = this;

            // get providers list
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = [
                config.fieldNames.NAME,
                config.fieldNames.ID,
                config.fieldNames.URL
            ];
            var fld = config.fieldNames.Biz_Only;
            query.where = fld + ' IS NULL OR ' + fld + ' = \'\'';
            var qTask = new QueryTask(config.broadbandMapURL + '/' + config.layerIndices.providersTable);
            qTask.execute(query, function (results) {
                array.forEach(results.features, function (g) {
                    config.providers[g.attributes[config.fieldNames.ID]] = {
                        name: g.attributes[config.fieldNames.NAME],
                        url: g.attributes[config.fieldNames.URL]
                    };
                });

                topic.publish(config.topics.App.providersObtained, config.providers);

                that.router = new Router();
            }, function (err) {
                console.error('error getting providers list', err);
            });
        },
        setUpMap: function () {
            console.log('app/App:setUpMap', arguments);

            var that = this;
            var mapOptions = {
                showInfoWindowOnClick: false,
                useDefaultBaseMap: false,
                extent: new Extent({
                    xmax: -11948476.782453176,
                    xmin: -12912194.835072424,
                    ymax: 5189185.517508683,
                    ymin: 4408916.332773807,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            };
            config.map = new BaseMap(this.mapDiv, mapOptions);

            new LayerSelector({
                map: config.map,
                quadWord: config.quadWord,
                baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo'],
                overlays: ['Address Points', {
                    Factory: ArcGISDynamicMapServiceLayer,
                    url: config.landOwnershipLayerURL,
                    id: 'Land Ownership',
                    opacity: 0.5
                }]
            }).startup();

            // create layers

            var layerNames = ['mobile', 'fixed', 'wireline'];
            config.bbLayer = new GroupLayer(layerNames.map(function buildDynamicLayer(layerName) {
                var lyr = new ArcGISDynamicMapServiceLayer(config.broadbandMapURL, {
                    opacity: config.defaultOpacities[layerName],
                    visible: false,
                    id: layerName
                });
                var i = config.layerIndices[layerName];
                lyr.setVisibleLayers([i]);
                var defs = [];
                defs[i] = config.fieldNames.MAXADDOWN + ' >= '
                    + config.speedsDomain[config.defaultSpeeds.down]
                    + ' AND ' + config.fieldNames.MAXADUP + ' >= '
                    + config.speedsDomain[config.defaultSpeeds.up];
                lyr.setLayerDefinitions(defs);
                return lyr;
            }));
            config.bbLayerCached = new GroupLayer(layerNames.map(function buildCachedLayer(layerName) {
                return new ArcGISTiledMapServiceLayer(config.broadbandMapCachedURLs[layerName], {
                    opacity: config.defaultOpacities[layerName],
                    id: layerName + 'Cached'
                });
            }));
            config.currentLayer = config.bbLayerCached;

            config.popLayer = new ArcGISDynamicMapServiceLayer(config.broadbandMapURL, {
                opacity: 0.5,
                visible: false
            });
            config.popLayer.setVisibleLayers([config.layerIndices.populatedAreas]);
            config.map.addLayer(config.popLayer);
            config.map.addLoaderToLayer(config.popLayer);

            // create new map display options widget
            var params = {
                map: config.map,
                popLayer: config.popLayer
            };
            this.own(new MapDisplayOptions(params, 'map-display-options'));

            config.bbLayer.addToMap(config.map);
            config.bbLayerCached.addToMap(config.map);

            this.own(this.connect(config.map, 'onClick', function () {
                if (that.size === 'small') {
                    if (!that.popoutOpen) {
                        that.onPopoutLinkClick();
                    }
                }
            }));

            // set up new geosearch widget
            this.geoSearch = new GeoSearch({
                map: config.map,
                searchLayerIndex: config.layerIndices.zoomLocations
            }, 'geo-search');

            this.own(config.map.on('extent-change', lang.hitch(that, 'onExtentChange')));

            // create new map data filters widget
            this.own(config.mapDataFilter = new MapDataFilter({
                layer: config.bbLayer,
                defaultDownSpeed: config.defaultSpeeds.down,
                defaultUpSpeed: config.defaultSpeeds.up
            }, 'map-data-filter'));

            // create new provider results widget
            this.own(this.listProviders = new ListProviders({
                defQuery: config.fieldNames.MAXADDOWN + ' >= ' +
                    config.speedsDomain[config.defaultSpeeds.down] +
                    ' AND ' + config.fieldNames.MAXADUP + ' >= ' +
                    config.speedsDomain[config.defaultSpeeds.up]
            }, 'list-providers'));
            this.listProviders.startup();
        },
        onFeedbackLinkClick: function () {
            console.log('app/App:onFeedbackLinkClick', arguments);

            // create new feedback widget and display it's containing dialog box
            if (!config.feedbackWidget) {
                this.initFeedback();
            }
            config.feedbackWidget.show();
        },
        initFeedback: function () {
            console.log('app/App:initFeedback', arguments);

            // create new widget
            config.feedbackWidget = new Feedback({
                map: config.map,
                toIds: [3, 4],
                emailServiceConfiguration: window.AGRC.configuration,
                title: 'Report a Problem'
            }, this.feedbackWidgetDiv);
            config.feedbackWidget.startup();
        },
        onExtentChange: function (change) {
            // summary:
            //      Turns on appropriate layers if the cache level changed
            console.log('app/App:onExtentChange', arguments);

            // only check if there was a level change & filters have not been touched
            if (change.levelChange &&
                config.mapDataFilter.resetBtn.get('disabled')) {
                // turn on dynamic service when zoomed in further than the breakpoint level
                if (change.lod.level >= config.breakPointLevel) {
                    config.bbLayer.callLayerMethod('show');
                    config.bbLayerCached.callLayerMethod('hide');
                    config.currentLayer = config.bbLayer;
                } else {
                    config.bbLayer.callLayerMethod('hide');
                    config.bbLayerCached.callLayerMethod('show');
                    config.currentLayer = config.bbLayerCached;
                }
            }

            topic.publish(config.topics.App.onMapExtentChange, change.extent.getCenter(), config.map.getScale());
        },
        getCurrentCoverageLayer: function () {
            // summary:
            //      Gets the appropriate coverage layer (dynamic or cached) for the current lod
            // returns:
            //      esri.layer
            console.log('app/App:getCurrentCoverageLayer', arguments);

            return config.currentLayer;
        },
        // filterByProviderIdNum: function () {
        //     console.log('app/App:filterByProviderIdNum', arguments);
        //
        //     // check for provider id_num in URL
        //     var id = this.getURLParameter('id_num');
        //
        //     // disable provider selector
        //     var mapFilterWidget = registry.byId('map-data-filter');
        //     mapFilterWidget.disableProviderSelector();
        //
        //     // set up query task
        //     var query = new Query();
        //     query.returnGeometry = false;
        //     query.outFields = [config.fieldNames.ID, config.fieldNames.NAME];
        //     query.where = config.fieldNames.ID_NUM + ' = \'' + id + '\'';
        //
        //     var qTask = new QueryTask(config.broadbandMapURL + '/3');
        //     qTask.execute(query, function (featureSet) {
        //         // check to make sure that a provider was found
        //         if (featureSet.features.length === 1) {
        //             // add provider to map data filter widget
        //             var graphicAtts = featureSet.features[0].attributes;
        //             var provName = graphicAtts[config.fieldNames.NAME];
        //             var provID = graphicAtts[config.fieldNames.ID];
        //
        //             // set title
        //             dom.byId('red-text').innerHTML = provID + ' |';
        //
        //             // update datafilter
        //             mapFilterWidget._onListPickerOK([[provName,provID]]);
        //
        //             // remove cached layer
        //             config.map.removeLayer(config.bbLayerCached);
        //
        //             // show dynamic layer and prevent it from being hidden
        //             config.bbLayer.callLayerMethod('show');
        //             config.bbLayer.hide = function () {
        //                 this.show();
        //             };
        //
        //         } else {
        //             alert('There was no provider found with that id_num');
        //             mapFilterWidget._onListPickerOK([['no provider found','no provider found']]);
        //         }
        //
        //         // show provider map data filter
        //     }, function (error) {
        //         alert('There was an error with the provider id query');
        //         console.error(error.message);
        //     });
        // },
        getURLParameter: function (name) {
            console.log('app/App:getURLParameter', arguments);

            // got from http://rockmanx.wordpress.com/2008/10/03/get-url-parameters-using-javascript/
            // name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var regexS = '[\\?&]' + name + '=([^&#]*)';
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results === null) {
                return '';
            } else {
                return results[1];
            }
        },
        destroyRecursive: function () {
            // summary:
            //      for tests
            console.log('app/App:destroyRecursive', arguments);

            this.cbxDisclaimer.destroy();

            this.inherited(arguments);
        },
        onPrintLinkClick: function (evt) {
            // summary:
            //      description
            // evt: Click Event
            console.log('app/App:onPrintLinkClick', arguments);

            evt.preventDefault();

            if (!this.printDialog) {
                this.printDialog = new PrintDialog({
                    map: config.map,
                    title: 'Print Map to PDF'
                }, this.printWidgetDiv);
                this.printDialog.startup();
                this.own(this.printDialog);
            }
            this.printDialog.show();
        }
    });
});
