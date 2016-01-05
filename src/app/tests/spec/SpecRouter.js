require([
    'app/Router',

    'dojo/_base/lang',
    'dojo/router',
    'dojo/topic'
],

function (
    Router,

    lang,
    dojoRouter,
    topic
) {
    describe('app/Router', function () {
        var testObject;
        var selectProvidersSpy;
        var launchListPickerSpy;
        var selectTransTypesSpy;
        var setSliderSpy;
        beforeEach(function () {
            selectProvidersSpy = jasmine.createSpy('selectProviders');
            launchListPickerSpy = jasmine.createSpy('launchListPicker')
                .and.callFake(function () {
                    AGRC.listPicker = {selectProviders: function () {}};
                });
            selectTransTypesSpy = jasmine.createSpy();
            setSliderSpy = jasmine.createSpy('setSlider');
            AGRC.listPicker = {
                selectProviders: selectProvidersSpy
            };
            AGRC.mapDataFilter = {
                launchListPicker: launchListPickerSpy,
                selectTransTypes: selectTransTypesSpy,
                setSlider: setSliderSpy
            };
            AGRC.map = jasmine.createSpyObj('map', ['setScale', 'centerAt']);
            AGRC.map.loaded = true;
            testObject = new Router();
        });
        afterEach(function () {
            testObject.destroy();
            testObject = null;
            dojoRouter.go('');
        });

        it('creates a valid object', function () {
            expect(testObject).toEqual(jasmine.any(Router));
        });
        describe('wireEvents', function () {
            it('wires the onDefQueryUpdate event', function () {
                spyOn(testObject, 'onDefQueryUpdate');
                var value = {
                    providers: []
                };

                topic.publish(AGRC.topics.Router.onDefQueryUpdate, value);

                expect(testObject.onDefQueryUpdate).toHaveBeenCalledWith(value);
            });
            it('wires the route hash event', function () {
                spyOn(testObject, 'onRouteHashChange');

                dojoRouter.go(AGRC.hashIdentifier + 'hello=bar&hello2=bar2');

                expect(testObject.onRouteHashChange).toHaveBeenCalledWith({
                    hello: 'bar',
                    hello2: 'bar2'
                });
            });
            it('wires the _onResetFilters event', function () {
                spyOn(testObject, 'onResetFilters');

                topic.publish(AGRC.topics.MapDataFilter.onResetFilter);

                expect(testObject.onResetFilters).toHaveBeenCalled();
            });
            it('wires onMapExtentChange', function () {
                spyOn(testObject, 'onMapExtentChange');
                var value = 'blah';

                topic.publish(AGRC.topics.App.onMapExtentChange, value);

                expect(testObject.onMapExtentChange).toHaveBeenCalledWith(value);
            });
        });
        describe('onDefQueryUpdate', function () {
            beforeEach(function () {
                spyOn(testObject, 'updateHash');
            });
            it('update currentRoute', function () {
                var value = {
                    providers: 'blah'
                };

                testObject.onDefQueryUpdate(value);

                expect(testObject.currentRoute.providers).toEqual(value.providers);
            });
            it('calls updateHash', function () {
                testObject.onDefQueryUpdate('blah');

                expect(testObject.updateHash).toHaveBeenCalled();
            });
            it('doesn\'t call updateHash if paused', function () {
                testObject.pauseUpdateHash = true;

                testObject.onDefQueryUpdate('blah');

                expect(testObject.updateHash).not.toHaveBeenCalled();
            });
            it('strips out parameters from currentRoute', function () {
                testObject.currentRoute = {
                    transTypes: [13,14],
                    minDownSpeed: 3,
                    minUpSpeed: 4
                };

                testObject.onDefQueryUpdate({
                    minDownSpeed: 5,
                    minUpSpeed: 6
                });

                expect(testObject.currentRoute.transTypes).toBeUndefined();
                expect(testObject.currentRoute.minDownSpeed).toBe(5);
                expect(testObject.currentRoute.minUpSpeed).toBe(6);
            });
            it('doesn\'t strip out extent property', function () {
                testObject.currentRoute.extent = 'blah';

                testObject.onDefQueryUpdate({providers: 'blah'});

                expect(testObject.currentRoute.extent).toEqual('blah');
            });
        });
        describe('onRouteHashChange', function () {
            var testHash = {
                providers: ['blah1'],
                transTypes: ['blah2'],
                minDownSpeed: 2,
                minUpSpeed: 4,
                extent: {
                    x: 199793.4774791507,
                    y: 4185516.1549837017,
                    scale: 120000
                }
            };
            it('updates currentRoute', function () {

                testObject.onRouteHashChange(testHash);

                expect(testObject.currentRoute.providers).toEqual(testHash.providers);
                expect(testObject.currentRoute.transTypes).toEqual(testHash.transTypes);
                expect(testObject.currentRoute.minDownSpeed).toEqual(testHash.minDownSpeed);
                expect(testObject.currentRoute.minUpSpeed).toEqual(testHash.minUpSpeed);
                expect(testObject.currentRoute.extent).toEqual(testHash.extent);
            });
            it('won\'t clobber currentRoute', function () {
                var cr = testObject.currentRoute;

                testObject.onRouteHashChange({
                    hello: 'blah'
                });

                expect(testObject.currentRoute).toEqual(cr);
            });
            it('calls updateProviders if appropriate', function () {
                var testHash2 = {
                    transTypes: [1, 2, 3]
                };
                spyOn(testObject, 'updateProviders');

                testObject.onRouteHashChange(testHash);
                testObject.onRouteHashChange(testHash);
                testObject.onRouteHashChange(testHash2);

                expect(testObject.updateProviders.calls.count()).toEqual(2);
            });
            it('calls MapDataFilter::selectTransTypes if appropriate', function () {
                var testHash2 = {
                    providers: ['blah1']
                };

                testObject.onRouteHashChange(testHash);
                testObject.onRouteHashChange(testHash);
                testObject.onRouteHashChange(testHash2);

                expect(selectTransTypesSpy.calls.count()).toBe(2);
                expect(selectTransTypesSpy.calls.argsFor(1)[0]).toEqual(null);
            });
            it('calls MapDataFilter::setSlider if appropriate', function () {
                var testHash2 = {
                    providers: ['blah1', 'blah2'],
                    transTypes: [1,2,3]
                };

                testObject.onRouteHashChange(testHash);

                expect(setSliderSpy.calls.argsFor(0)).toEqual(['down', 2]);

                testObject.onRouteHashChange(testHash);

                testObject.onRouteHashChange(testHash2);

                expect(setSliderSpy.calls.count()).toBe(4);
            });
            it('calls setExtent if appropriate', function () {
                testObject.onRouteHashChange(testHash);
                var testHash2 = {
                    providers: ['halle', 'asdf']
                };

                expect(AGRC.map.setScale).toHaveBeenCalledWith(testHash.extent.scale);
                expect(AGRC.map.centerAt).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        x: testHash.extent.x,
                        y: testHash.extent.y
                    })
                );

                testObject.onRouteHashChange(testHash2);
                testObject.onRouteHashChange(testHash2);

                expect(AGRC.map.centerAt.calls.count()).toBe(1);
            });
        });
        describe('updateProviders', function () {
            var provs = ['blah1', 'blah2'];
            it('calls selectProviders on the listPicker', function () {
                testObject.updateProviders(provs);

                expect(selectProvidersSpy).toHaveBeenCalledWith(provs);
            });
            it('inits the list picker if needed', function () {
                delete AGRC.listPicker;

                testObject.updateProviders(provs);

                expect(launchListPickerSpy).toHaveBeenCalled();

                testObject.updateProviders(provs);

                expect(launchListPickerSpy.calls.count()).toBe(1);
            });
            it('converts a single provider to an array', function () {
                testObject.updateProviders('blah');

                expect(selectProvidersSpy).toHaveBeenCalledWith(['blah']);
            });
        });
        describe('onResetFilters', function () {
            beforeEach(function () {
                spyOn(testObject, 'updateHash');
            });
            it('clear the filter properties of currentRoute', function () {
                testObject.currentRoute.providers = ['blah'];
                testObject.currentRoute.transTypes = ['blah'];

                testObject.onResetFilters();

                expect(testObject.currentRoute.providers).toEqual([]);
                expect(testObject.currentRoute.transTypes).toEqual([]);
            });
            it('calls updateHash', function () {
                testObject.onResetFilters();

                expect(testObject.updateHash).toHaveBeenCalled();
            });
        });
        describe('onMapExtentChange', function () {
            var center = {x: 1.5, y:2.3 };
            it('updates the currentRoute object', function () {
                var expected = {
                    x: 2,
                    y: 2,
                    scale: 3
                };
                var providers = ['blah2', 'blah3'];
                testObject.currentRoute.providers = providers;

                testObject.onMapExtentChange(center, 3);

                expect(JSON.stringify(testObject.currentRoute.extent)).toEqual(JSON.stringify(expected));
                expect(testObject.currentRoute.providers).toEqual(providers);
            });
            it('calls updateHash if appropriate', function () {
                testObject.pauseUpdateHash = true;
                spyOn(testObject, 'updateHash');

                testObject.onMapExtentChange(center, 3);

                expect(testObject.updateHash).not.toHaveBeenCalled();

                testObject.pauseUpdateHash = false;

                testObject.onMapExtentChange(center, 3);

                expect(testObject.updateHash).toHaveBeenCalled();
            });
        });
        describe('objectToQuery/queryToObject', function () {
            var obj;
            var query;
            afterEach(function () {
                expect(testObject.objectToQuery(obj)).toEqual(query);
                expect(testObject.queryToObject(query)).toEqual(obj);
            });
            it('separates all properties with a "&"', function () {
                obj = {
                    param1: 'blah',
                    param2: 'blah2'
                };
                query = 'param1=blah&param2=blah2';
            });
            it('encodes all property values', function () {
                obj = {
                    param1: 'bla&h',
                    param2: 'blah'
                };
                query = 'param1=bla%26h&param2=blah';
            });
            it('handles arrays', function () {
                obj = {
                    providers: ['AT&T', 'Hello']
                };
                query = 'providers=AT%26T|Hello';
            });
            it('handles the extent property object', function () {
                obj = {
                    extent: {
                        x: 4472002.148131457,
                        y: 2,
                        scale: 3
                    }
                };
                query = 'extent=4472002.148131457|2|3';
            });
            it('converts single values to arrays for transtypes', function () {
                obj = {
                    transTypes: ['1']
                };
                query = 'transTypes=1';
            });
            it('converts speed types to their domain values', function () {
                obj = {
                    minDownSpeed: 8,
                    minUpSpeed: 10
                };
                query = 'minDownSpeed=4&minUpSpeed=2';
            });
        });
    });
});
