define([
    'dojo/_base/declare'
], function (
    declare
) {
    return declare(null, {
        // summary:
        //      implement some of the layer methods on groups of layers to make
        //      splitting of trans types into separate layers easier

        layers: null,
        map: null,

        constructor: function (layers) {
            // summary:
            //      constructor
            // layers: Layer[]
            console.log('app.GroupLayer:constructor', arguments);

            this.layers = layers;
        },
        addToMap: function (map) {
            // summary:
            //      adds the layers in this group to the passed in map
            // map: agrc/widgets/map/BaseMap
            console.log('app.GroupLayer:addToMap', arguments);

            this.layers.forEach(function (lyr) {
                map.addLayer(lyr);
                map.addLoaderToLayer(lyr);
            });

            this.map = map;
        },
        callLayerMethod: function (methodName, arg) {
            // summary:
            //      calls the method on each of the layers
            // methodName: String
            //      the name of the method on the layers that you want to call
            // arg: ??
            //      the argument that you want passed to the method
            console.log('app.GroupLayer:callLayerMethod', arguments);

            this.layers.forEach(function (lyr) {
                lyr[methodName](arg);
            });
        },
        reorderLayers: function (newOrder) {
            // summary:
            //      reorders the layer within the map
            // newOrder: Strings[]
            //      the layer names in the desired order
            console.log('app.GroupLayer:reorderLayers', arguments);

            var originalLayerIds = this.map.layerIds;

            var i = 2;
            var that = this;
            newOrder.forEach(function (name) {
                if (originalLayerIds.indexOf(name) !== i) {
                    that.map.reorderLayer(that.getLayerByName(name), i);
                }
                i++;
            });
        },
        getLayerByName: function (name) {
            // summary:
            //      returns the layer with the matching name
            // name: String
            console.log('app.GroupLayer:getLayerByName', arguments);

            var returnLayer;
            this.layers.some(function (lyr) {
                if (lyr.id === name) {
                    returnLayer = lyr;
                    return true;
                }
            });
            return returnLayer;
        },
        setLayerOpacity: function (layerName, opacity) {
            // summary:
            //      sets the opacity for a specific layer
            // layerName: String
            // opacity: Number
            console.log('app.GroupLayer:setLayerOpacity', arguments);

            this.getLayerByName(layerName).setOpacity(opacity);
        }
    });
});
