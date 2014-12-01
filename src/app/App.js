define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Feedback',
    'app/GeoSearch',
    'app/HelpPopup',
    'app/ListProviders',
    'app/MapDataFilter',
    'app/MapDisplayOptions',
    'app/PrintDialog',
    'app/Router',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/fx',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/topic',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/CheckBox'
],

function (
    BaseMap,

    config,
    Feedback,
    GeoSearch,
    HelpPopup,
    ListProviders,
    MapDataFilter,
    MapDisplayOptions,
    PrintDialog,
    Router,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,
    registry,

    array,
    declare,
    dojoEvent,
    fx,
    lang,
    dom,
    domConstruct,
    domStyle,
    on,
    template,
    topic,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    Query,
    QueryTask
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

            AGRC.app = this;
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
            }
            this.onMediaQueryChange(mq);
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
                domConstruct.place(this.navBar, this.popoutMenu);
            } else {
                this.size = 'large';
                domConstruct.place(this.leftNav, this.middleContainer);
                domConstruct.place(this.rightNav, this.middleContainer);
                domConstruct.place(this.navBar, this.headerContainer);
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
            query.outFields = [AGRC.fieldNames.NAME, AGRC.fieldNames.ID, AGRC.fieldNames.URL];
            query.where = this.makeQueryDirty('1 = 1');
            var qTask = new QueryTask(AGRC.broadbandMapURL + '/4');
            qTask.execute(query, function(results){
                array.forEach(results.features, function (g) {
                    AGRC.providers[g.attributes[AGRC.fieldNames.ID]] = {
                        name: g.attributes[AGRC.fieldNames.NAME],
                        url: g.attributes[AGRC.fieldNames.URL]
                    };
                });

                topic.publish('AGRC.ProvidersObtained', AGRC.providers);

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
                includeFullExtentButton: true,
                sliderStyle: 'large'
            };
            AGRC.map = new BaseMap(this.mapDiv, mapOptions);

            // create layers
            AGRC.bbLayer = new ArcGISDynamicMapServiceLayer(AGRC.broadbandMapURL, {
                opacity: 0.5,
                visible: false,
                id: 'coverage'
            });
            AGRC.bbLayerCached = new ArcGISTiledMapServiceLayer(AGRC.broadbandMapCachedURL, {
                opacity: 0.5,
                id: 'coverageCached'
            });
            AGRC.currentLayer = AGRC.bbLayerCached;
            // AGRC.bbBasemaps = new ArcGISDynamicMapServiceLayer(AGRC.basemapsURL, {
            //     id: 'basemaps',
            //     visible: false
            // });

            // create new map display options widget
            var params = {
                map: AGRC.map,
                bbLayer: AGRC.bbLayer,
                bbLayerCached: AGRC.bbLayerCached
                // basemapsLayer: AGRC.bbBasemaps
            };
            this.own(new MapDisplayOptions(params, 'map-display-options'));

            AGRC.map.addLayer(AGRC.bbLayer);
            AGRC.map.addLoaderToLayer(AGRC.bbLayer);
            AGRC.map.addLayer(AGRC.bbLayerCached);
            AGRC.map.addLoaderToLayer(AGRC.bbLayerCached);
            // AGRC.map.addLayer(AGRC.bbBasemaps);
            // AGRC.map.addLoaderToLayer(AGRC.bbBasemaps);

            this.own(this.connect(AGRC.map, 'onClick', function(){
                if (that.size === 'small') {
                    if (!that.popoutOpen) {
                        that.onPopoutLinkClick();
                    }
                }
            }));

            // set up new geosearch widget
            this.geoSearch = new GeoSearch({map: AGRC.map}, 'geo-search');

            this.own(AGRC.map.on('load', function () {
                that.own(AGRC.map.on('extent-change', lang.hitch(that, 'onExtentChange')));
            }));

            // create new map data filters widget
            this.own(AGRC.mapDataFilter = new MapDataFilter({
                layer: AGRC.bbLayer
            }, 'map-data-filter'));

            // create new provider results widget
            this.own(this.listProviders = new ListProviders({}, 'list-providers'));
            this.listProviders.startup();
        },
        onFeedbackLinkClick: function () {
            console.log('app/App:onFeedbackLinkClick', arguments);

            // create new feedback widget and display it's containing dialog box
            if (!AGRC.feedbackWidget){
                this.initFeedback();
            }
            AGRC.feedbackWidget.show();
        },
        initFeedback: function () {
            console.log('app/App:initFeedback', arguments);

            // create new widget
            AGRC.feedbackWidget = new Feedback({
                map: AGRC.map,
                redliner: config.redlineUrl,
                toIds: [4, 7],
                title: 'Report a Problem'
            }, this.feedbackWidgetDiv);
            AGRC.feedbackWidget.startup();
        },
        onExtentChange: function (change) {
            // summary:
            //      Turns on appropriate layers if the cache level changed
            console.log('app/App:onExtentChange', arguments);

            // only check if there was a level change & filters have not been touched
            if (change.levelChange &&
                AGRC.mapDataFilter.resetBtn.get('disabled') &&
                registry.byId('overlay-checkbox').get('value')) {
                // turn on dynamic service when zoomed in further than the breakpoint level
                if (change.lod.level >= AGRC.breakPointLevel) {
                    AGRC.bbLayer.show();
                    AGRC.bbLayerCached.hide();
                    AGRC.currentLayer = AGRC.bbLayer;
                } else {
                    AGRC.bbLayer.hide();
                    AGRC.bbLayerCached.show();
                    AGRC.currentLayer = AGRC.bbLayerCached;
                }
            }

            topic.publish(AGRC.topics.App.onMapExtentChange, change.extent.getCenter(), AGRC.map.getScale());
        },
        getCurrentCoverageLayer: function () {
            // summary:
            //      Gets the appropriate coverage layer (dynamic or cached) for the current lod
            // returns:
            //      esri.layer
            console.log('app/App:getCurrentCoverageLayer', arguments);

            return AGRC.currentLayer;
        },
        filterByProviderIdNum: function () {
            console.log('app/App:filterByProviderIdNum', arguments);

            // check for provider id_num in URL
            var id = this.getURLParameter('id_num');

            // disable provider selector
            var mapFilterWidget = registry.byId('map-data-filter');
            mapFilterWidget.disableProviderSelector();

            // set up query task
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = [AGRC.fieldNames.ID, AGRC.fieldNames.NAME];
            query.where = this.makeQueryDirty(AGRC.fieldNames.ID_NUM + ' = \'' + id + '\'');

            var qTask = new QueryTask(AGRC.broadbandMapURL + '/3');
            qTask.execute(query, function(featureSet){
                // check to make sure that a provider was found
                if (featureSet.features.length === 1)
                {
                    // add provider to map data filter widget
                    var graphicAtts = featureSet.features[0].attributes;
                    var provName = graphicAtts[AGRC.fieldNames.NAME];
                    var provID = graphicAtts[AGRC.fieldNames.ID];

                    // set title
                    dom.byId('red-text').innerHTML = provID + ' |';

                    // update datafilter
                    mapFilterWidget._onListPickerOK([[provName,provID]]);

                    // remove cached layer
                    AGRC.map.removeLayer(AGRC.bbLayerCached);

                    // show dynamic layer and prevent it from being hidden
                    AGRC.bbLayer.show();
                    AGRC.bbLayer.hide = function(){
                        this.show();
                    };

                } else {
                    alert('There was no provider found with that id_num');
                    mapFilterWidget._onListPickerOK([['no provider found','no provider found']]);
                }

                // show provider map data filter
            }, function(error){
                alert('There was an error with the provider id query');
                console.error(error.message);
            });
        },
        getURLParameter: function (name) {
            console.log('app/App:getURLParameter', arguments);

            // got from http://rockmanx.wordpress.com/2008/10/03/get-url-parameters-using-javascript/
            // name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var regexS = '[\\?&]' + name + '=([^&#]*)';
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results === null) {
                return '';
            }
            else {
                return results[1];
            }
        },
        makeQueryDirty: function (query) {
            // summary:
            //      appends a parameter to the text of the query to help with this problem
            //      http://forums.arcgis.com/threads/73456-new-problem-REST-query-10.1-
            //      every-other-request-fails-(400-unable-to-complete-oper)
            //      Can be removed after Server 10.1 SP2
            // query: String
            console.log('app/App:makeQueryDirty', arguments);

            if (query !== '') {
                var dirty = new Date().getTime();

                return query + ' AND ' + dirty + ' = ' + dirty;
            } else {
                return query;
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
                    map: AGRC.map,
                    title: 'Print Map to PDF'
                }, this.printWidgetDiv);
                this.printDialog.startup();
                this.own(this.printDialog);
            }
            this.printDialog.show();
        }
    });
});