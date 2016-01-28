require([
    'app/GroupLayer'
], function (
    GroupLayer
) {
    describe('app/GroupLayer', function () {
        var layers;
        var groupLayer;
        var method = 'doSomething';
        beforeEach(function () {
            layers = [{
                doSomething: jasmine.createSpy('doSomething'),
                setVisibility: jasmine.createSpy('setVisibility'),
                id: 'a'
            }, {
                doSomething: jasmine.createSpy('doSomething'),
                setVisibility: jasmine.createSpy('setVisibility'),
                id: 'b'
            }, {
                doSomething: jasmine.createSpy('doSomething'),
                setVisibility: jasmine.createSpy('setVisibility'),
                id: 'c'
            }];
            groupLayer = new GroupLayer(layers);
        });
        describe('addToMap', function () {
            it('calls addLayer and addLoaderToLayer for each lyr', function () {
                var map = {
                    addLayer: jasmine.createSpy('addLayer'),
                    addLoaderToLayer: jasmine.createSpy('addLoaderToLayer')
                };

                groupLayer.addToMap(map);

                expect(map.addLayer).toHaveBeenCalledWith(layers[1]);
                expect(map.addLoaderToLayer).toHaveBeenCalledWith(layers[1]);
            });
        });
        describe('callLayerMethod', function () {
            it('calls the method on all of the layers', function () {
                groupLayer.callLayerMethod(method);

                expect(layers[0].doSomething).toHaveBeenCalled();
                expect(layers[1].doSomething).toHaveBeenCalled();
            });
            it('can accept single arguments', function () {
                var value = 'blah';
                groupLayer.callLayerMethod(method, value);

                expect(layers[0].doSomething).toHaveBeenCalledWith(value);
                expect(layers[1].doSomething).toHaveBeenCalledWith(value);
            });
        });
        describe('reorderLayers', function () {
            it('calls reorderLayer on affected layers', function () {
                var spy = jasmine.createSpy('reorderLayer');
                groupLayer.map = {
                    reorderLayer: spy,
                    layerIds: ['basemap', 'poplayer', 'a', 'b', 'c']
                };
                groupLayer.reorderLayers(['c', 'b', 'a']);

                expect(spy.calls.count()).toBe(2);
                expect(spy.calls.argsFor(0)).toEqual([layers[2], 2]);
                expect(spy.calls.argsFor(1)).toEqual([layers[0], 4]);
            });
        });
    });
});
