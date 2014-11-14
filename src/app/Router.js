define([
    'dijit/Destroyable',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/hash',
    'dojo/router',
    'dojo/topic',

    'esri/geometry/Extent'
], function (
    Destroyable,

    array,
    declare,
    lang,
    hash,
    router,
    topic,

    Extent
) {
    return declare('app/Router', [Destroyable], {
        // currentRoute: Object
        //      keeps track of the current route to make sure that we don't
        //      get caught in an infinite loop
        currentRoute: {},

        // pauseUpdateHash: Boolean
        //      used to prevent looping when onRouteHashChange triggers
        //      an update of the hash
        pauseUpdateHash: false,

        constructor: function () {
            // summary:
            //      kicks off this object
            //      called in app/main.js
            console.log('app/Router::constructor', arguments);

            this.wireEvents();

            router.startup();
        },
        wireEvents: function () {
            // summary:
            //      wires all of the events for this object
            console.log('app/Router::wireEvents', arguments);

            var that = this;

            this.own(
                topic.subscribe(AGRC.topics.Router.onDefQueryUpdate, function (params) {
                    that.onDefQueryUpdate(params);
                }),
                router.register(AGRC.hashIdentifier + ':routeHash', function (evt) {
                    that.onRouteHashChange(that.queryToObject(evt.params.routeHash));
                }),
                topic.subscribe(AGRC.topics.MapDataFilter.onResetFilter, function () {
                    that.onResetFilters();
                }),
                topic.subscribe(AGRC.topics.App.onMapExtentChange, function (extent) {
                    that.onMapExtentChange(extent);
                })
            );
        },
        onDefQueryUpdate: function (props) {
            // summary:
            //      fires when the def query gets updated from the map data filter
            // props: Object
            //      The object with all of the properties that make up the def query
            console.log(this.declaredClass + '::onDefQueryUpdate', arguments);

            // preserve extent
            var ex = this.currentRoute.extent;

            this.currentRoute = props;

            if (ex) {
                this.currentRoute.extent = ex;
            }

            if (!this.pauseUpdateHash) {
                this.updateHash();
            }
        },
        updateHash: function () {
            // summary:
            //      updates the url with the currentRoute
            console.log('app/Router::updateHash', arguments);

            var newHash = AGRC.hashIdentifier + this.objectToQuery(this.currentRoute);

            if (hash() !== newHash) {
                router.go(newHash);
            }
        },
        onRouteHashChange: function (newRoute) {
            // summary:
            //      fires when the /route/ hash changes
            // newRoute: Object
            console.log('app/Router::onRouteHashChange', arguments);

            var that = this;
            var extent;

            this.pauseUpdateHash = true;

            function hasParameterChanged(parameter) {
                var hasChanged;
                if (newRoute[parameter] === that.currentRoute[parameter]) {
                    hasChanged = false;
                } else if ((!newRoute[parameter] && that.currentRoute[parameter]) ||
                    (newRoute[parameter] && !that.currentRoute[parameter])) {
                    hasChanged = true;
                } else {
                    if (newRoute[parameter] instanceof Array || that.currentRoute[parameter] instanceof Array) {
                        // arrays need special treatment
                        hasChanged = newRoute[parameter].toString() !== that.currentRoute[parameter].toString();
                    } else if (parameter === 'extent') {
                        hasChanged = JSON.stringify(newRoute[parameter]) !==
                            JSON.stringify(that.currentRoute[parameter]);
                    } else {
                        hasChanged = newRoute[parameter] !== that.currentRoute[parameter];
                    }
                }

                if (hasChanged) {
                    that.currentRoute[parameter] = newRoute[parameter];
                }

                return hasChanged;
            }

            if (newRoute !== this.currentRoute) {
                if (hasParameterChanged('providers')) {
                    this.updateProviders(newRoute.providers);
                }
                if (hasParameterChanged('transTypes')) {
                    AGRC.mapDataFilter.selectTransTypes((newRoute.transTypes) ? newRoute.transTypes : null);
                }
                if (hasParameterChanged('minDownSpeed')) {
                    AGRC.mapDataFilter.setSlider('down', newRoute.minDownSpeed);
                }
                if (hasParameterChanged('minUpSpeed')) {
                    AGRC.mapDataFilter.setSlider('up', newRoute.minUpSpeed);
                }
                if (hasParameterChanged('extent')) {
                    extent = new Extent(lang.mixin({
                        spatialReference: {wkid: 26912}
                    }, newRoute.extent));
                    AGRC.map.setExtent(extent);
                }
                if (hasParameterChanged('endUserCats')) {
                    AGRC.mapDataFilter.setEndUserCategories(newRoute.endUserCats);
                }
            }

            this.pauseUpdateHash = false;
        },
        updateProviders: function (providers) {
            // summary:
            //      updates the definition query and ui with the new providers
            // providers: String[] | String (queryToObject can't handle single arrays)
            console.log('app/Router::updateProviders', arguments);

            if (!AGRC.listPicker) {
                AGRC.mapDataFilter.launchListPicker();
            }

            // convert to array if it's a single string value
            if (typeof providers === 'string') {
                providers = [providers];
            }

            AGRC.listPicker.selectProviders(providers);
        },
        onResetFilters: function () {
            // summary:
            //      fires when the user clicks the reset filters button
            console.log(this.declaredClass + '::onResetFilters', arguments);

            this.currentRoute.providers = [];
            this.currentRoute.transTypes = [];
            this.currentRoute.endUserCats = [];

            this.updateHash();
        },
        onMapExtentChange: function (extent) {
            // summary:
            //      fires when the map extent changes
            // extent: map extent
            console.log(this.declaredClass + '::onMapExtentChange', arguments);

            lang.mixin(this.currentRoute, {
                extent: {
                    xmin: Math.round(extent.xmin),
                    ymin: Math.round(extent.ymin),
                    xmax: Math.round(extent.xmax),
                    ymax: Math.round(extent.ymax)
                }
            });

            if (!this.pauseUpdateHash) {
                this.updateHash();
            }
        },
        objectToQuery: function (obj) {
            // summary:
            //      my custom replacement for dojo.objectToQuery
            // obj: {} (this.currentProperty)
            console.log(this.declaredClass + '::objectToQuery', arguments);

            var props = [];
            var value;
            var arrayValues;

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    value = obj[prop];
                    if (value instanceof Array) {
                        arrayValues = array.map(value, encodeURIComponent);
                        props.push(prop + '=' + arrayValues.join('|'));
                    } else if (prop === 'extent') {
                        props.push(prop + '=' + [value.xmin, value.ymin, value.xmax, value.ymax].join('|'));
                    } else if (prop.match(/.+Speed/) && value && value !== -1) {
                        props.push(prop + '=' + AGRC.speedValues[value - 1]);
                    } else {
                        props.push(prop + '=' + encodeURIComponent(obj[prop]));
                    }
                }
            }

            return props.join('&');
        },
        queryToObject: function (query) {
            // summary:
            //      my custom replacement for dojo.queryToObject
            // query: String
            console.log(this.declaredClass + '::queryToObject', arguments);

            var propHashes = query.split('&');
            var returnObj = {};
            var propTuple;
            var propValue;
            var extents;
            var propName;

            array.forEach(propHashes, function (prop) {
                propTuple = prop.split('=');
                propValue = decodeURIComponent(propTuple[1]);
                propName = propTuple[0];
                if (propName === 'extent') {
                    extents = propValue.split('|');
                    returnObj[propName] = {
                        xmin: parseFloat(extents[0], 10),
                        ymin: parseFloat(extents[1], 10),
                        xmax: parseFloat(extents[2], 10),
                        ymax: parseFloat(extents[3], 10)
                    };
                } else if (propName === 'transTypes' || propName === 'providers' || propName === 'endUserCats') {
                    if (propValue.split('|').length > 1) {
                        returnObj[propName] = propValue.split('|');
                    } else {
                        returnObj[propName] = [propValue];
                    }
                } else if (propName.match(/.+Speed/)) {
                    returnObj[propName] = array.indexOf(AGRC.speedValues, propValue) + 1;
                } else {
                    returnObj[propName] = propValue;
                }
            });

            return returnObj;
        }
    });
});