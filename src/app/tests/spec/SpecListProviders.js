require([
    'app/config',
    'app/ListProviders',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/_base/lang',

    'stubmodule'
], function (
    config,
    ListProviders,

    Deferred,
    domConstruct,
    lang,

    stubModule
) {
    describe('app/ListProviders', function () {
        var testWidget;
        var configClone = lang.clone(config);
        configClone.map = {
            graphics: {},
            on: function () {
                return new Deferred();
            }
        };
        beforeEach(function (done) {
            stubModule('app/ListProviders', {
                'app/config': configClone
            }).then(function (StubbedModule) {
                ListProviders = StubbedModule;
                testWidget = new ListProviders({}, domConstruct.create('div', {}, document.body));
                done();
            }, function (er) {
                console.error(er);
            });
        });
        afterEach(function () {
            if (testWidget) {
                testWidget.destroyRecursive();
            }
        });

        it('sanity', function () {
            expect(testWidget).toEqual(jasmine.any(ListProviders));
        });

        describe('sortProviders', function () {
            it('sorts by download then upload speed', function () {
                var providers = [{
                    id: 1,
                    maxdown: 1,
                    maxup: 2
                }, {
                    id: 2,
                    maxdown: 2,
                    maxup: 1
                }, {
                    id: 3,
                    maxdown: 1,
                    maxup: 3
                }];

                var sorted = testWidget.sortProviders(providers);
                var sortedIds = sorted.map(function (p) {
                    return p.id;
                });
                expect(sortedIds).toEqual([2, 3, 1]);
            });
        });
        describe('addPerspectiveItemToList', function () {
            it('adds new item to list', function () {
                var item = {
                    id: 1
                };

                testWidget.addPerspectiveItemToList(item);

                expect(testWidget.list.length).toBe(1);
                expect(testWidget.list[0].id).toBe(1);
            });
            it('does not add duplicate items', function () {
                var item = {
                    id: 1,
                    transTypes: []
                };

                testWidget.list = [{
                    id: 1,
                    transTypes: []
                }, {
                    id: 2,
                    transTypes: []
                }];
                testWidget.addPerspectiveItemToList(item);

                expect(testWidget.list.length).toBe(2);
            });
            it('updates existing duplicate items with higher speeds and descriptions - down', function () {
                var item = {
                    id: 2,
                    transTypes: [],
                    maxdown: 2,
                    maxdownDesc: '2 desc'
                };

                testWidget.list = [{
                    id: 1,
                    transTypes: []
                }, {
                    id: 2,
                    transTypes: [],
                    maxdown: 1,
                    maxdownDesc: '1 desc'
                }];
                testWidget.addPerspectiveItemToList(item);

                expect(testWidget.list.length).toBe(2);
                var newTwo = testWidget.list[1];
                expect(newTwo.maxdown).toBe(2);
                expect(newTwo.maxdownDesc).toBe('2 desc');
            });
            it('updates existing duplicate items with higher speeds and descriptions - up', function () {
                var item = {
                    id: 2,
                    transTypes: [],
                    maxup: 2,
                    maxupDesc: '2 desc'
                };

                testWidget.list = [{
                    id: 1,
                    transTypes: []
                }, {
                    id: 2,
                    transTypes: [],
                    maxup: 1,
                    maxupDesc: '1 desc'
                }];
                testWidget.addPerspectiveItemToList(item);

                expect(testWidget.list.length).toBe(2);
                var newTwo = testWidget.list[1];
                expect(newTwo.maxup).toBe(2);
                expect(newTwo.maxupDesc).toBe('2 desc');
            });
        });
    });
});
