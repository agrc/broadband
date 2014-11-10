define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/App.html',
    'app/MapDataFilter',
    'app/ListProviders',
    'app/HelpPopup',
    'app/MapDisplayOptions',
    'app/GeoSearch',
    'app/Feedback',
    'dojo/dom-style',
    'dojo/dom',
    'dojo/dom-construct',
    'dijit/registry',
    'dojo/topic',
    'dojo/_base/event',
    'dojo/_base/array',
    'dojo/on',
    'dojo/_base/fx',
    'app/Router',
    'dojo/_base/lang',

    'agrc/widgets/map/BaseMap'
],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    MapDataFilter,
    ListProviders,
    HelpPopup,
    MapDisplayOptions,
    GeoSearch,
    Feedback,
    domStyle,
    dom,
    domConstruct,
    registry,
    topic,
    dojoEvent,
    array,
    on,
    fx,
    Router,
    lang
    ) {
    return declare('app.App', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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
            console.log(this.declaredClass + "::constructor", arguments);

            AGRC.app = this;
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + "::postCreate", arguments);

            // load only the associated provider data
            // TODO: hook up to url parameter
            //  filterByProviderIdNum();
            
            // load all providers
            this.getProvidersList();

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for this widget
            console.log(this.declaredClass + "::wireEvents", arguments);
            var that = this;
            var mq;

            // set up text links
            this.connect(this.mapHelpText, 'onclick', function (evt) {
                evt.preventDefault();
                that.mapHelpDialog.show();
            });
            this.connect(this.aboutMapText, 'onclick', function (evt) {
                evt.preventDefault();
                that.aboutMapDialog.show();
            });
            this.connect(this.feedbackLink, 'onclick', function (evt) {
                evt.preventDefault();
                that.onFeedbackLinkClick();
            });
            on(this.popoutLink, 'click', function (evt) {
                evt.preventDefault();
                that.onPopoutLinkClick();
            });
            on(this.cbxDisclaimer, 'click', function () {
                localStorage.skipDisclaimer = that.cbxDisclaimer.get('checked');
            });
            on(this.disclaimerLink, 'click', function (evt) {
                evt.preventDefault();
                that.disclaimerDialog.show();
            });

            // wire media query events
            if (window.matchMedia) {
                mq = window.matchMedia("(max-width: 1024px)");
                mq.addListener(function (query) {
                    that.onMediaQueryChange(query);
                });
            }
            this.onMediaQueryChange(mq);
            on(this.headerContainer, 'click', function () {
                if (that.popoutOpen) {
                    that.onPopoutLinkClick();
                }
            });
        },
        onMediaQueryChange: function (mq) {
            // summary:
            //      fires when the media query changes
            // mq: MediaQuery
            console.log(this.declaredClass + "::onMediaQueryChange", arguments);
        
            if (mq.matches) {
                this.size = 'small';
                domConstruct.place('left-nav', this.popoutMenu);
                domConstruct.place('right-nav', this.popoutMenu);
                domConstruct.place(this.navBar, this.popoutMenu);
            } else {
                this.size = 'large';
                domConstruct.place('left-nav', this.middleContainer);
                domConstruct.place('right-nav', this.middleContainer);
                domConstruct.place(this.navBar, this.headerContainer);
            }
        },
        onPopoutLinkClick: function () {
            // summary:
            //      Fires when the user clicks on the popout menu link
            console.log(this.declaredClass + "::onPopoutLinkClick", arguments);

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
        hideLoader: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::hideLoader", arguments);

            // show content - prevent flash of unstyled content
            fx.fadeOut({
                node: 'preloader',
                duration: 400,
                onEnd: lang.hitch(this, function(o){
                    domConstruct.destroy(o);

                    if (!localStorage.skipDisclaimer) {
                        localStorage.skipDisclaimer = false;
                    }

                    // display disclaimer
                    if (!JSON.parse(localStorage.skipDisclaimer)) {
                        this.disclaimerDialog.show();
                    }
                    this.cbxDisclaimer.set('checked', JSON.parse(localStorage.skipDisclaimer));
                    this.connect(this.disclaimerBtn, 'onClick', function(){
                        this.disclaimerDialog.hide();
                    });
                }),
                onBegin: function () {
                    
                }
            }).play();
        },
        getProvidersList: function () {
            console.log(this.declaredClass + "::getProvidersList", arguments);

            var that = this;

            // get providers list
            var query = new esri.tasks.Query();
            query.returnGeometry = false;
            query.outFields = [AGRC.fieldNames.NAME, AGRC.fieldNames.ID, AGRC.fieldNames.URL];
            query.where = this.makeQueryDirty("1 = 1");
            var qTask = new esri.tasks.QueryTask(AGRC.broadbandMapURL + "/3");
            qTask.execute(query, function(results){
                array.forEach(results.features, function (g) {
                    AGRC.providers[g.attributes[AGRC.fieldNames.ID]] = {
                        name: g.attributes[AGRC.fieldNames.NAME],
                        url: g.attributes[AGRC.fieldNames.URL]
                    };
                });
                
                topic.publish("AGRC.ProvidersObtained", AGRC.providers);

                that.router = new Router();
            }, function (err) {
                console.error('error getting providers list', err);
            });
        },
        setUpMap: function () {
            console.log(this.declaredClass + "::setUpMap", arguments);

            var that = this;
            var mapOptions = {
                'showInfoWindowOnClick': false,
                'useDefaultBaseMap': false,
                includeFullExtentButton: true,
                sliderStyle: "large"
            };
            AGRC.map = new agrc.widgets.map.BaseMap(this.mapDiv, mapOptions);
            
            // create layers
            AGRC.bbLayer = new esri.layers.ArcGISDynamicMapServiceLayer(AGRC.broadbandMapURL, {
                opacity: 0.5,
                visible: false,
                id: 'coverage'
            });
            AGRC.bbLayerCached = new esri.layers.ArcGISTiledMapServiceLayer(AGRC.broadbandMapCachedURL, {
                opacity: 0.5,
                id: 'coverageCached'
            });
            AGRC.currentLayer = AGRC.bbLayerCached;
            // AGRC.bbBasemaps = new esri.layers.ArcGISDynamicMapServiceLayer(AGRC.basemapsURL, {
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
            new MapDisplayOptions(params, 'map-display-options');
            
            AGRC.map.addLayer(AGRC.bbLayer);
            AGRC.map.addLoaderToLayer(AGRC.bbLayer);
            AGRC.map.addLayer(AGRC.bbLayerCached);
            AGRC.map.addLoaderToLayer(AGRC.bbLayerCached);
            // AGRC.map.addLayer(AGRC.bbBasemaps);
            // AGRC.map.addLoaderToLayer(AGRC.bbBasemaps);

            this.connect(AGRC.map, "onClick", function(){
                if (this.size === 'small') {
                    if (!this.popoutOpen) {
                        this.onPopoutLinkClick();
                    }
                }
            });
            
            // set up new geosearch widget
            this.geoSearch = new GeoSearch({map: AGRC.map}, 'geo-search');
            
            this.connect(AGRC.map, 'onLoad', function () {
                that.connect(AGRC.map, 'onExtentChange', 'onExtentChange');
            });

            // create new map data filters widget
            AGRC.mapDataFilter = new MapDataFilter({
                layer: AGRC.bbLayer
            }, 'map-data-filter');

            // create new provider results widget
            this.listProviders = new ListProviders({}, 'list-providers');
            this.listProviders.startup();
        },
        onFeedbackLinkClick: function () {
            console.log(this.declaredClass + "::onFeedbackLinkClick", arguments);

            // create new feedback widget and display it's containing dialog box
            if (!AGRC.feedbackWidget){
                this.initFeedback();
            }   
            AGRC.feedbackWidget.show();
        },
        initFeedback: function () {
            console.log(this.declaredClass + "::initFeedback", arguments);

            // create new widget
            AGRC.feedbackWidget = new Feedback({
                map: AGRC.map,
                serviceName: 'Broadband Map'
            }, this.feedbackWidgetDiv);
            AGRC.feedbackWidget.startup();
        },
        onExtentChange: function (extent, delta, levelChange, lod) {
            // summary:
            //      Turns on appropriate layers if the cache level changed
            console.log(this.declaredClass + "::onExtentChange", arguments);

            // only check if there was a level change & filters have not been touched
            if (levelChange && 
                AGRC.mapDataFilter.resetBtn.get('disabled') && 
                registry.byId('overlay-checkbox').get('value')) {
                // turn on dynamic service when zoomed in further than the breakpoint level
                if (lod.level >= AGRC.breakPointLevel) {
                    AGRC.bbLayer.show();
                    AGRC.bbLayerCached.hide();
                    AGRC.currentLayer = AGRC.bbLayer;
                } else {
                    AGRC.bbLayer.hide();
                    AGRC.bbLayerCached.show();
                    AGRC.currentLayer = AGRC.bbLayerCached;
                }
            }

            topic.publish(AGRC.topics.App.onMapExtentChange, extent);
        },
        getCurrentCoverageLayer: function () {
            // summary:
            //      Gets the appropriate coverage layer (dynamic or cached) for the current lod
            // returns:
            //      esri.layer
            console.log(this.declaredClass + "::getCurrentCoverageLayer", arguments);
            
            return AGRC.currentLayer;
        },
        filterByProviderIdNum: function () {
            console.log(this.declaredClass + "::filterByProviderIdNum", arguments);

            // check for provider id_num in URL
            var id_num = this.getURLParameter('id_num');
            
            // disable provider selector
            var mapFilterWidget = registry.byId("map-data-filter");
            mapFilterWidget.disableProviderSelector();
            
            // set up query task
            var query = new esri.tasks.Query();
            query.returnGeometry = false;
            query.outFields = [AGRC.fieldNames.ID, AGRC.fieldNames.NAME];
            query.where = this.makeQueryDirty(AGRC.fieldNames.ID_NUM + " = '" + id_num + "'");
            
            var qTask = new esri.tasks.QueryTask(AGRC.broadbandMapURL + "/3");
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
            console.log(this.declaredClass + "::getURLParameter", arguments);

            // got from http://rockmanx.wordpress.com/2008/10/03/get-url-parameters-using-javascript/
            // name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results === null) {
                return "";
            }
            else {
                return results[1];
            }
        },
        makeQueryDirty: function (query) {
            // summary:
            //      appends a parameter to the text of the query to help with this problem
            //      http://forums.arcgis.com/threads/73456-new-problem-REST-query-10.1-every-other-request-fails-(400-unable-to-complete-oper)
            //      Can be removed after Server 10.1 SP2
            // query: String
            console.log(this.declaredClass + "::makeQueryDirty", arguments);
            
            if (query !== '') {
                var dirty = new Date().getTime();

                return query + " AND " + dirty + ' = ' + dirty;
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
        }
    });
});