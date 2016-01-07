define([
    'app/config',
    'app/FindAddress',
    'app/HelpPopup',
    'app/ProviderResult',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/has',
    'dojo/query',
    'dojo/text!app/templates/ListProviders.html',
    'dojo/topic',
    'dojo/_base/array',
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
    config,
    FindAddress,
    HelpPopup,
    ProviderResult,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    domStyle,
    has,
    query,
    template,
    topic,
    array,
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

        // deferreds to enable canceling pending requests
        RoadDeferred: null,
        CensusDeferred: null,
        WirelessDeferred: null,

        // query tasks for each layer
        qTaskRoadSegs: null,
        qTaskCensus: null,
        qTaskWireless: null,

        // marker symbol
        _markerSymbol: null,

        // message that is displayed when no providers are returned
        noneFoundMsgWithSat: 'No non-satellite providers found at this location.',
        noneFoundMsgWithoutSat: 'No providers found at this location',

        // geometry service
        geoServiceURL: 'http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer',
        geoService: null,

        // the last point that was used in a query. Used to rerun the query after data filters have been changed.
        lastPoint: null,

        postCreate: function () {
            console.log('app/ListProviders:postCreate', arguments);

            this._setUpQueryTasks();

            // create new symbol
            this._markerSymbol = new PictureMarkerSymbol(
                'http://168.180.161.9/broadband/app/resources/images/push_pin.png', 40, 40).setOffset(0, 17);

            // create new find address widget
            new FindAddress({
                map: config.map,
                title: 'Street Address',
                symbol: this._markerSymbol,
                apiKey: config.apiKey
            }, 'find-address');

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

        /**
         * wires events
         */
        _wireEvents: function () {
            console.log('app/ListProviders:_wireEvents', arguments);

            var that = this;

            this.own(
                // clear table on search for address fail
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFindError', function () {
        //          this.standby.show();
                    that.clearResultsOnClick();
                }),

                // search for providers on successful address find
                topic.subscribe('agrc.widgets.locate.FindAddress.OnFind', function (results) {
                    if (results.length) {
                        var returnCoords = results[0].location;
                        var point = new Point(returnCoords.x, returnCoords.y, config.map.spatialReference);

                        // search for providers
                        that.searchMapPoint(point, false);
                    }
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
                    topic.publish('broadband.ListProviders.onSatLinkClick');
                }),

                // listen for reset filters button
                topic.subscribe(config.topics.MapDataFilter.onResetFilter, function () {
                    domStyle.set(that.warning, 'display', 'none');
                }),

                // listen for event to update the sat link visibility in the results list
                topic.subscribe('broadband.MapDataFilter.UpdateSatLinkVisibility', function (show) {
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

            // set up query - same query used for all tasks
            this.query = new Query();
            this.query.returnGeometry = false;
            this.query.where = config.app.makeQueryDirty('1 = 1'); // get all values
            this.query.outFields = [
                config.fieldNames.UTProvCode,
                config.fieldNames.MAXADDOWN,
                config.fieldNames.MAXADUP,
                config.fieldNames.TRANSTECH];

            // create new query task for each layer
            // tried identify task, but performance was horribly slow (40 seconds to get a return from server)
            this.qTaskRoadSegs = new QueryTask(config.broadbandMapURL + '/0');
            this.qTaskCensus = new QueryTask(config.broadbandMapURL + '/1');
            this.qTaskWireless = new QueryTask(config.broadbandMapURL + '/2');

            // wire events
            this.connect(config.map, 'onClick', function (event) {
                this.searchMapPoint(event.mapPoint, true);
            });
            this.connect(this.qTaskRoadSegs, 'onError', this._onQTaskError);
            this.connect(this.qTaskCensus, 'onError', this._onQTaskError);
            this.connect(this.qTaskWireless, 'onError', this._onQTaskError);
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
            this.query.where = config.app.makeQueryDirty(this.defQuery);

            // fire off query tasks
            if (this.RoadDeferred) {
                this.RoadDeferred.cancel();
            }
            this.RoadDeferred = this.qTaskRoadSegs.execute(this.query, lang.hitch(this, function (results) {
                this._addResultsToList(results);

                // fire second query task - these are chained to prevent stepping on each other
                if (this.CensusDeferred) {
                    this.CensusDeferred.cancel();
                }
                this.CensusDeferred = this.qTaskCensus.execute(this.query, lang.hitch(this, function (results) {
                    this._addResultsToList(results);

                    // fire third query task
                    if (this.WirelessDeferred) {
                        this.WirelessDeferred.cancel();
                    }
                    this.WirelessDeferred = this.qTaskWireless.execute(this.query, lang.hitch(this, function (results) {
                        this._addResultsToList(results);

                        this._populateResultsList(this.list);
                        this.standby.hide();
                    }));
                }));
            }));
        },

        /**
         * callback for querytasks
         * adds results to master list
         * @param {Object} results
         */
        _addResultsToList: function (results) {
            console.log('app/ListProviders:_addResultsToList', arguments);

            // append new providers, if any, to list
            array.forEach(results.features, function (g) {
                try {
                    var atts = g.attributes;
                    var providerObj = config.providers[atts[config.fieldNames.UTProvCode]];

                    if (providerObj === undefined) {
                        console.warn('No matching provider found for ' +
                            atts[config.fieldNames.UTProvCode] + ' in the providers table');
                    } else {
                        var maxupCode = parseInt(atts[config.fieldNames.MAXADUP], 10);
                        var maxupDesc = config.speedsDomain[maxupCode];
                        if (maxupDesc === undefined) {
                            maxupDesc = 'unavailable';
                        }
                        var maxdownCode = parseInt(atts[config.fieldNames.MAXADDOWN], 10);
                        var maxdownDesc = config.speedsDomain[maxdownCode];
                        if (maxdownDesc === undefined) {
                            maxdownDesc = 'unavailable';
                        }
                        var transtypeCode = atts[config.fieldNames.TRANSTECH];
                        var perspectivItem = {
                            'id': atts[config.fieldNames.UTProvCode],
                            'name': providerObj.name,
                            'url': providerObj.url,
                            'maxup': maxupCode,
                            'maxupDesc': maxupDesc,
                            'maxdown': maxdownCode,
                            'maxdownDesc': maxdownDesc,
                            'transTypes': [config.typesDomain[transtypeCode]]
                        };

                        // check for duplicate in existing list
                        var alreadyThere = false;
                        array.forEach(this.list, function (existingItem) {
                            if (existingItem.id === perspectivItem.id) { // matching id
                                // check for higher speeds
                                if (existingItem.maxdown < perspectivItem.maxdown) {
                                    // there is an existing item with the a lower download speed.
                                    // update the existingItem's speeds
                                    existingItem.maxdown = perspectivItem.maxdown;
                                    existingItem.maxdownDesc = config.speedsDomain[perspectivItem.maxdown];
                                    existingItem.maxup = perspectivItem.maxup;
                                    existingItem.maxupDesc = config.speedsDomain[perspectivItem.maxup];
                                }

                                // add trans type if different from existing
                                if (array.indexOf(existingItem.transTypes, perspectivItem.transTypes[0]) === -1) {
                                    existingItem.transTypes.push(perspectivItem.transTypes[0]);
                                }

                                alreadyThere = true;
                            }
                        }, this);
                        if (!alreadyThere) {
                            this.list.push(perspectivItem);
                        }
                    }
                } catch (e) {
                    console.error('problem adding provider result', g);
                }
            }, this);
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
            var g = new Graphic(mapPoint, this._markerSymbol, {}, {});
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

            // check to see if any providers where found

            if (list.length > 0) {
                // sort data by download speed
                list.sort(function (a, b) {
                    if (a.maxdown < b.maxdown) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                // add to results table
                array.forEach(list, function (item, i) {
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
                }, this.satMsg, 'before');
            }

            // update utm coords
            this.utmX.innerHTML = Math.round(this.lastPoint.x);
            this.utmY.innerHTML = Math.round(this.lastPoint.y);

            // project point
            var wgs = new SpatialReference({wkid: 4326});
            this.geoService.project([this.lastPoint], wgs, lang.hitch(this, function (pnts) {
                var pnt = pnts[0];
                this.lat.innerHTML = Math.round(pnt.y * 100000) / 100000;
                this.lng.innerHTML = Math.round(pnt.x * 100000) / 100000;
            }));

            this.showResults();
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
