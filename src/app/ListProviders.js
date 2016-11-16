define([
    'agrc/modules/Formatting',
    'agrc/modules/WebAPI',

    'app/config',
    'app/FindAddress',
    'app/HelpPopup',
    'app/ProviderResult',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/has',
    'dojo/query',
    'dojo/text!app/templates/ListProviders.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/window',

    'dojox/widget/Standby',

    'esri/geometry/Point',
    'esri/graphic',
    'esri/SpatialReference',
    'esri/symbols/PictureMarkerSymbol',
    'esri/tasks/GeometryService',
    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'dojo/_base/sniff',
    'xstyle/css!app/resources/ListProviders.css'
],

function (
    Formatting,
    WebAPI,

    config,
    FindAddress,
    HelpPopup,
    ProviderResult,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    domClass,
    domConstruct,
    domStyle,
    has,
    query,
    template,
    topic,
    declare,
    lang,
    win,

    Standby,

    Point,
    Graphic,
    SpatialReference,
    PictureMarkerSymbol,
    GeometryService,
    Query,
    QueryTask
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * Widget used to display providers at a clicked point on the map
         * @author Scott Davis
         * 11-10-10
         */
        widgetsInTemplate: true,
        templateString: template,

        // master list of providers found
        list: [],

        // query used in query tasks
        query: null,

        // deferred to enable canceling pending requests
        deferred: null,

        qTask: null,

        // marker symbol
        _markerSymbol: null,

        // message that is displayed when no providers are returned
        noneFoundMsgWithSat: 'No non-satellite providers found at this location.',
        noneFoundMsgWithoutSat: 'No providers found at this location',

        // geometry service
        geoServiceURL: 'https://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer',
        geoService: null,

        // the last point that was used in a query. Used to rerun the query after data filters have been changed.
        lastPoint: null,

        // webapi: WebAPI
        //      used to query for telecom provider
        webapi: null,

        postCreate: function () {
            console.log('app/ListProviders:postCreate', arguments);

            this._setUpQueryTasks();

            // create new symbol
            this._markerSymbol = new PictureMarkerSymbol(
                config.appBaseUrl + 'app/resources/images/push_pin.png', 40, 40).setOffset(0, 17);

            // create new find address widget
            this.findAddress = new FindAddress({
                map: config.map,
                graphicsLayer: config.map.graphics,
                title: 'Street Address',
                symbol: this._markerSymbol,
                apiKey: config.apiKey,
                wkid: 3857
            }, 'find-address');
            this.findAddress.startup();
            this.own(this.findAddress);

            this._wireEvents();

            // create new standby widget - creating it via markup had positioning problems
            this.standby = new Standby({
                target: 'standbyTarget',
                duration: 250,
                color: '#AAD0F2'
            });
            document.body.appendChild(this.standby.domNode);
            this.standby.startup();

            // address help widget
            new HelpPopup({title: 'Street Address Help', autoPosition: false}, this.addressHelp);

            // click help widget
            new HelpPopup({title: 'Map Click Help'}, this.clickHelp);

            // results help widget
            new HelpPopup({title: 'Provider Results Legend', autoPosition: false}, this.resultsHelp);

            // get geometry service
            this.geoService = new GeometryService(this.geoServiceURL);
        },

        _wireEvents: function () {
            console.log('app/ListProviders:_wireEvents', arguments);

            var that = this;

            this.own(
                // clear table on search for address fail
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFindError', function () {
                    that.clearResultsOnClick();
                }),

                // search for providers on successful address find
                this.findAddress.on('find', function (result) {
                    if (result.location) {
                        var returnCoords = result.location;
                        var point = new Point(returnCoords.x, returnCoords.y, new SpatialReference({wkid: 3857}));

                        // search for providers
                        that.searchMapPoint(point, false);
                    }
                }),
                aspect.before(this.findAddress, 'geocodeAddress', function () {
                    config.map.graphics.clear();
                }),

                // store query def from map data filters
                topic.subscribe(config.topics.MapDataFilter.onQueryUpdate, function (query) {
                    that.defQuery = query;

                    // rerun search if there is one
                    if (domStyle.get(that.placeholderImg, 'display') === 'none') {
                        that.searchMapPoint(that.lastPoint);
                    }

                    domStyle.set(that.warning, 'display', 'block');
                }),

                // widget controls
                this.connect(this.btnClear, 'onClick', this.clearResultsOnClick),
                this.connect(this.satMsg, 'onclick', function (evt) {
                    evt.preventDefault();
                    topic.publish(config.topics.ListProviders.onSatLinkClick);
                }),

                // listen for reset filters button
                topic.subscribe(config.topics.MapDataFilter.onResetFilter, function () {
                    domStyle.set(that.warning, 'display', 'none');
                }),

                // listen for event to update the sat link visibility in the results list
                topic.subscribe(config.topics.MapDataFilter.updateSatLinkVisibility, function (show) {
                    var displayValue = (show) ? 'block' : 'none';
                    domStyle.set(that.satMsg, 'display', displayValue);
                })
            );
        },

        /**
         * Sets up the different query tasks and wires necessary events
         */
        _setUpQueryTasks: function () {
            console.log('app/ListProviders:_setUpQueryTasks', arguments);

            this.webapi = new WebAPI({apiKey: config.apiKey});

            // set up query - same query used for all tasks
            this.query = new Query();
            this.query.returnGeometry = false;
            this.query.where = '1 = 1'; // get all values
            this.query.outFields = [
                config.fieldNames.UTProvCode,
                config.fieldNames.MAXADDOWN,
                config.fieldNames.MAXADUP,
                config.fieldNames.TRANSTECH,
                config.fieldNames.LastVerified
            ];

            this.qTask = new QueryTask(config.broadbandMapURL + '/' + config.layerIndices.coverageQueryLayer);

            // wire events
            var that = this;
            this.own(
                config.map.on('click', function (event) {
                    that.searchMapPoint(event.mapPoint, true);
                }),
                this.qTask.on('error', lang.hitch(this, '_onQTaskError'))
            );
        },

        /**
         * searches for providers at given map point
         * @param {Object} mapPoint - the point to be searched
         * @param {Boolean} displayGraphic - whether or not to add a graphic
         */
        searchMapPoint: function (mapPoint, displayGraphic) {
            console.log('app/ListProviders:searchMapPoint', arguments);

            this.standby.show();

            // store mapPoint for later retrieval
            this.lastPoint = mapPoint;

            if (displayGraphic) {
                this._addMarkerToMap(mapPoint);
            }

            // clear list
            this.list = [];

            // set clicked map point in query
            this.query.geometry = mapPoint;

            // set def query to match map data filters
            this.query.where = this.defQuery || '1 = 1';

            if (this.deferred) {
                this.deferred.cancel();
            }
            var that = this;
            this.deferred = this.qTask.execute(this.query, function (results) {
                that._processResults(results);

                that._populateResultsList(that.list);
                that.standby.hide();
            });

            var providerFld = config.fieldNames.telcom.PROVIDER;
            var weblinkFld = config.fieldNames.telcom.WEBLINK;
            var clearTelCom = function () {
                that.telcomMsg.innerHTML = '';
                domClass.add(that.telcomMsgContainer, 'hidden');
            };
            this.webapi.search(config.telcomFeatureClassName, [providerFld, weblinkFld], {
                geometry: 'point:[' + mapPoint.x + ',' + mapPoint.y + ']',
                spatialReference: config.map.spatialReference.wkid
            }).then(function processWebAPIResponse(response) {
                if (response.length > 0 && response[0].attributes[providerFld] !== 'OPEN') {
                    domClass.remove(that.telcomMsgContainer, 'hidden');
                    that.telcomMsg.innerHTML = Formatting.titlize(response[0].attributes[providerFld]);
                    that.telcomMsg.href = response[0].attributes[weblinkFld];
                } else {
                    clearTelCom();
                }
            }, clearTelCom);
        },

        /**
         * callback for querytasks
         * adds results to master list
         * @param {Object} results
         */
        _processResults: function (results) {
            console.log('app/ListProviders:_processResults', arguments);

            var getMbpsDescription = function (speed) {
                return Formatting.round(speed, 3) + ' Mbps';
            };

            // append new providers, if any, to list
            results.features.forEach(function (g) {
                try {
                    var atts = g.attributes;
                    var providerObj = config.providers[atts[config.fieldNames.UTProvCode]];

                    if (providerObj === undefined) {
                        console.warn('No matching provider found for ' +
                            atts[config.fieldNames.UTProvCode] + ' in the providers table');
                    } else {
                        var maxup = atts[config.fieldNames.MAXADUP];
                        var maxupDesc;
                        if (maxup === undefined) {
                            maxupDesc = 'unavailable';
                        } else {
                            maxupDesc = getMbpsDescription(maxup);
                        }

                        var maxdown = atts[config.fieldNames.MAXADDOWN];
                        var maxdownDesc;
                        if (maxdown === undefined) {
                            maxdownDesc = 'unavailable';
                        } else {
                            maxdownDesc = getMbpsDescription(maxdown);
                        }

                        var transtypeCode = atts[config.fieldNames.TRANSTECH];
                        var perspectiveItem = {
                            id: atts[config.fieldNames.UTProvCode],
                            name: providerObj.name,
                            url: providerObj.url,
                            maxup: maxup,
                            maxupDesc: maxupDesc,
                            maxdown: maxdown,
                            maxdownDesc: maxdownDesc,
                            transTypes: [config.typesDomain[transtypeCode]],
                            lastVerified: new Date(atts[config.fieldNames.LastVerified]).toLocaleDateString()
                        };

                        this.addPerspectiveItemToList(perspectiveItem);
                    }
                } catch (e) {
                    console.error('problem adding provider result', g);
                }
            }, this);
        },

        addPerspectiveItemToList: function (perspectiveItem) {
            // summary:
            //      checks to see if item should be added then adds it to master list
            // perspectiveItem: Object
            console.log('app.ListProviders:addPerspectiveItemToList', arguments);

            // check for duplicate in existing list
            var alreadyThere = false;
            this.list.some(function (existingItem) {
                if (existingItem.id === perspectiveItem.id) { // matching id
                    // check for higher speeds
                    if (existingItem.maxdown < perspectiveItem.maxdown) {
                        existingItem.maxdown = perspectiveItem.maxdown;
                        existingItem.maxdownDesc = perspectiveItem.maxdownDesc;
                    }
                    if (existingItem.maxup < perspectiveItem.maxup) {
                        existingItem.maxup = perspectiveItem.maxup;
                        existingItem.maxupDesc = perspectiveItem.maxupDesc;
                    }

                    // add trans type if different from existing
                    if (existingItem.transTypes.indexOf(perspectiveItem.transTypes[0]) === -1) {
                        existingItem.transTypes.push(perspectiveItem.transTypes[0]);
                    }

                    alreadyThere = true;
                    return true;
                }
            }, this);
            if (!alreadyThere) {
                this.list.push(perspectiveItem);
            }
        },

        /**
         * Error callback for query tasks
         *
         * @param {Object} error
         */
        _onQTaskError: function (error) {
            console.log('app/ListProviders:_onQTaskError', arguments);

            console.error(error.message);
        },

        /**
         * Add's a graphic object to the map
         *
         * @param {Object} mapPoint
         */
        _addMarkerToMap: function (mapPoint) {
            console.log('app/ListProviders:_addMarkerToMap', arguments);

            // clear previous graphics
            config.map.graphics.clear();

            // create new graphic
            var g = new Graphic(mapPoint, this._markerSymbol);

            config.map.graphics.add(g);
        },

        /**
         * Populates the un-numbered list with the providers
         *
         * @param {String[String[]]} list The array of providers in this format: [Name, Maxup, Maxdown]
         */
        _populateResultsList: function (list) {
            console.log('app/ListProviders:_populateResultsList', arguments);

            this.clearTable();

            // check to see if any providers were found
            if (list.length > 0) {
                list = this.sortProviders(list);

                // add to results table
                list.forEach(function (item, i) {
                    this._createResult(item, i);
                }, this);
            } else {
                // add none found message
                // use the appropriate message based upon whether the sat link is show or not
                var msg = (domStyle.get(this.satMsg, 'display') === 'block') ?
                    this.noneFoundMsgWithSat : this.noneFoundMsgWithoutSat;
                domConstruct.create('div', {
                    'class': 'none-found-msg',
                    'innerHTML': msg
                }, this.providerResultsContainer, 'before');
            }

            var that = this;

            // update utm coords
            var utm = new SpatialReference({wkid: 26912});
            this.geoService.project([this.lastPoint], utm, function (pnts) {
                var pnt = pnts[0];
                that.utmX.innerHTML = Math.round(pnt.x);
                that.utmY.innerHTML = Math.round(pnt.y);
            });

            // update wgs coords
            var wgs = new SpatialReference({wkid: 4326});
            this.geoService.project([this.lastPoint], wgs, function (pnts) {
                var pnt = pnts[0];
                that.lat.innerHTML = Math.round(pnt.y * 100000) / 100000;
                that.lng.innerHTML = Math.round(pnt.x * 100000) / 100000;
            });

            this.showResults();
        },

        sortProviders: function (list) {
            // summary:
            //      sorts by download then upload
            // list: Object[]
            console.log('app.ListProviders:sortProviders', arguments);

            var sort = function (c, d) {
                if (c < d) {
                    return 1;
                } else {
                    return -1;
                }
            };
            list.sort(function (a, b) {
                if (a.maxdown === b.maxdown) {
                    return sort(a.maxup, b.maxup);
                } else {
                    return sort(a.maxdown, b.maxdown);
                }
            });

            return list;
        },

        _createResult: function (item, i) {
            //* create new ProviderResult widget
            // create empty div and assign to body - required to make tooltip work
            var tmpDiv = win.body().appendChild(domConstruct.create('div'));

            // assign index value for even row class within widget
            item.index = i;

            var provResult = new ProviderResult(item, tmpDiv);
            domConstruct.place(provResult.domNode, this.providerResultsContainer);
        },

        /**
         * handles onClick event for btnClear
         * @param {Object} event
         */
        clearResultsOnClick: function () {
            console.log('app/ListProviders:clearResultsOnClick', arguments);

            // clear table
            this.clearTable();

            // clear map graphics
            config.map.graphics.clear();

            this.hideResults();
        },

        showResults: function () {
            console.log('app/ListProviders:showResults', arguments);

            // hide sample image and header
            domStyle.set(this.placeholderImg, 'display', 'none');

            domStyle.set(this.results, 'display', 'block');
        },

        hideResults: function () {
            console.log('app/ListProviders:hideResults', arguments);

            // show sample image and header
            domStyle.set(this.placeholderImg, 'display', 'block');

            domStyle.set(this.results, 'display', 'none');
        },

        /**
         * clears rows from table
         */
        clearTable: function () {
            console.log('app/ListProviders:clearTable', arguments);

            // destroy all Provider Results widgets
            registry.findWidgets(this.providerResultsContainer).forEach(function (widget) {
                widget.destroyRecursive(false);
            });

            // remove none found message
            query('.none-found-msg').forEach(domConstruct.destroy);

            // clear coords
            this.utmX.innerHTML = '';
            this.utmY.innerHTML = '';
            this.lat.innerHTML = '';
            this.lng.innerHTML = '';
        }
    });
});
