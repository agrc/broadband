require([
    'app/config',
    'app/MapDataFilter',

    'dijit/registry',
    'dijit/registry',

    'dojo/dom-construct',
    'dojo/hash',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/window'
],

function (
    config,
    MapDataFilter,

    registry,
    dijitRegistry,

    domConstruct,
    hash,
    query,
    topic,
    win
) {
    describe('app/MapDataFilter', function () {
        var testWidget;
        beforeEach(function () {
            jasmine.addMatchers({
                toBeChecked: function () {
                    return {
                        compare: function (actual) {
                            var result = {
                                pass: actual.get('checked') === true
                            };
                            var notText = result.pass ? ' not' : '';
                            result.message = function () {
                                return 'Expected ' + actual.dojoAttachPoint + notText + ' to have been checked.';
                            };
                            return result;
                        }
                    };
                }
            });
            testWidget = new MapDataFilter({
                layer: {on: function () {}}
            }, domConstruct.create('div', {}, win.body()));
        });
        afterEach(function () {
            testWidget.destroyRecursive(false);
            domConstruct.destroy(testWidget.domNode);
            testWidget = null;
            hash('');
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(MapDataFilter));
        });

        describe('wireControlEvents', function () {
            it('wires the sub checkboxes', function () {
                spyOn(testWidget, '_onSubCheckBoxChange');
                testWidget.wireControlEvents();

                testWidget.cbxCable.onClick();

                expect(testWidget._onSubCheckBoxChange).toHaveBeenCalledWith(testWidget.cbxWireBased);
            });
        });
        describe('_getTransTypes', function () {
            it('returns all values when all checked', function () {
                expect(testWidget._getTransTypes()).toEqual([40, 41, 10, 20, 30, 50, 70, 71, 80]);
            });
            it('returns some values when some are checked', function () {
                testWidget.cbxCable.set('value', false);
                testWidget.cbxMobileWireless.set('value', false);

                expect(testWidget._getTransTypes()).toEqual([10, 20, 30, 50, 70, 71]);
            });
            it('returns an empty array if none are checked', function () {
                [testWidget.cbxCable, testWidget.cbxDSL, testWidget.cbxFiber, testWidget.cbxFixedWireless, testWidget.cbxMobileWireless]
                    .forEach(function (widget) {
                        widget.set('value', false);
                    });

                expect(testWidget._getTransTypes()).toEqual([]);
            });
        });
        describe('resetFilters', function () {
            it('resets the sub checkboxes', function () {
                var widget;
                query('.trans-list input').forEach(function (node) {
                    widget = registry.getEnclosingWidget(node);
                    widget.set('value', false);
                });

                testWidget.resetFilters();

                query('.trans-list input').forEach(function (node) {
                    widget = registry.getEnclosingWidget(node);
                    expect(widget.get('value')).not.toEqual(false);
                });

                // make sure that this doesn't screw up the values
                expect(testWidget._getTransTypes()).toEqual([40, 41, 10, 20, 30, 50, 70, 71, 80]);
            });
        });
        describe('_onSubCheckBoxChange', function () {
            it('sets the parentCheckBox to mixed if some subs are checked', function () {
                testWidget.cbxCable.set('value', false);

                testWidget._onSubCheckBoxChange(testWidget.cbxWireBased);

                expect(testWidget.cbxWireBased.get('value')).toEqual('mixed');
            });
        });
        describe('_onTransCheckBoxChange', function () {
            beforeEach(function () {
                spyOn(testWidget, 'updateDefQuery');
            });
            it('sets all subs to checked if new value is checked', function () {
                testWidget.cbxCable.set('value', false);
                testWidget.cbxWireBased.set('value', 'on');

                testWidget.cbxWireBased.onClick();

                expect(testWidget.cbxCable.get('checked')).toEqual(true);
            });
            it('sets all subs to unchecked if new value is unchecked', function () {
                testWidget.cbxCable.set('checked', true);
                testWidget.cbxWireBased.set('value', false);

                testWidget.cbxWireBased.onClick();

                expect(testWidget.cbxCable.get('checked')).toEqual(false);
            });
            it('fires updateDefQuery', function () {
                testWidget.cbxWireBased.onClick();

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
        });
        describe('updateDefQuery', function () {
            var routerReturned;
            var defQueryReturned;
            beforeEach(function () {
                topic.subscribe(config.topics.Router.onDefQueryUpdate, function (param) {
                    routerReturned = param;
                });
                topic.subscribe(config.topics.MapDataFilter.onQueryUpdate, function (query) {
                    defQueryReturned = query;
                });
            });
            it('fires the onDefQueryUpdate topic', function () {
                var returned;
                var expected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value
                };
                topic.subscribe(config.topics.Router.onDefQueryUpdate, function (param) {
                    returned = param;
                });

                testWidget.updateDefQuery();

                expect(returned).toEqual(expected);
            });
            it('doesn\'t put empty IN statement in the def query', function () {
                var routerExpected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value,
                    transTypes: -1,
                    providers: -1
                };
                var defQueryExpected = 'MAXADDOWN >= ' + config.speedsDomain['9'] + ' ' +
                    'AND MAXADUP >= ' + config.speedsDomain['10'] + ' AND TransTech ' +
                    '= -1 AND UTProvCode = \'-1\'';
                [testWidget.cbxCable, testWidget.cbxDSL, testWidget.cbxFiber, testWidget.cbxFixedWireless, testWidget.cbxMobileWireless]
                    .forEach(function (widget) {
                        widget.set('value', false);
                    });
                testWidget.chbxShowOnly.set('checked', true);

                testWidget.updateDefQuery();

                expect(routerReturned).toEqual(routerExpected);
                expect(defQueryReturned).toEqual(defQueryExpected);
            });
        });
        describe('selectTransTypes', function () {
            var testTypes = ['70', '71', '80'];
            it('selects only the passed in checkboxes', function () {
                testWidget.selectTransTypes(testTypes);

                expect(testWidget.cbxCable).not.toBeChecked();
                expect(testWidget.cbxDSL).not.toBeChecked();
                expect(testWidget.cbxFiber).not.toBeChecked();
                expect(testWidget.cbxFixedWireless).toBeChecked();
                expect(testWidget.cbxMobileWireless).toBeChecked();

                var anotherTest = ['40','41','10','20','30','50','70','71'];
                testWidget.selectTransTypes(anotherTest);

                expect(testWidget.cbxCable).toBeChecked();
                expect(testWidget.cbxDSL).toBeChecked();
                expect(testWidget.cbxFiber).toBeChecked();
                expect(testWidget.cbxFixedWireless).toBeChecked();
                expect(testWidget.cbxMobileWireless).not.toBeChecked();
            });
            it('fires _onSubCheckBoxChange', function () {
                spyOn(testWidget, '_onSubCheckBoxChange');

                testWidget.selectTransTypes(testTypes);

                expect(testWidget._onSubCheckBoxChange.calls.count()).toBe(1);
                expect(testWidget._onSubCheckBoxChange.calls.argsFor(0)[1]).toEqual(false);
            });
            it('fires updateDefQuery', function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget.selectTransTypes(testTypes);

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
            it('selects all checkboxes if null is passed', function () {
                testWidget.cbxCable.set('checked', false);
                testWidget.cbxDSL.set('checked', false);
                testWidget.cbxFiber.set('checked', false);
                testWidget.cbxFixedWireless.set('checked', false);
                testWidget.cbxMobileWireless.set('checked', false);

                testWidget.selectTransTypes(null);

                expect(testWidget.cbxCable).toBeChecked();
                expect(testWidget.cbxDSL).toBeChecked();
                expect(testWidget.cbxFiber).toBeChecked();
                expect(testWidget.cbxFixedWireless).toBeChecked();
                expect(testWidget.cbxMobileWireless).toBeChecked();
            });
        });
        describe('setSlider', function () {
            it('set the appropriate slider value', function () {
                testWidget.setSlider('up', 5);

                expect(testWidget.uploadSlider.value).toEqual(5);

                testWidget.setSlider('down', 3);

                expect(testWidget.downloadSlider.value).toEqual(3);
            });
            it('fires updateDefQuery', function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget.setSlider('up', 5);

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
        });
        describe('bumpElements', function () {
            it('1 => 2', function () {
                testWidget.bumpElements(testWidget.draggable1, testWidget.dropTarget3);

                expect(testWidget.draggable2.dataset.slot).toBe('1');
                expect(testWidget.draggable1.dataset.slot).toBe('2');
                expect(testWidget.draggable3.dataset.slot).toBe('3');
            });
            it('1 => 3', function () {
                testWidget.bumpElements(testWidget.draggable1, testWidget.dropTarget4);

                expect(testWidget.draggable2.dataset.slot).toBe('1');
                expect(testWidget.draggable3.dataset.slot).toBe('2');
                expect(testWidget.draggable1.dataset.slot).toBe('3');
            });
            it('3 => 1', function () {
                testWidget.bumpElements(testWidget.draggable3, testWidget.dropTarget1);

                expect(testWidget.draggable3.dataset.slot).toBe('1');
                expect(testWidget.draggable1.dataset.slot).toBe('2');
                expect(testWidget.draggable2.dataset.slot).toBe('3');
            });
            it('2 => 1', function () {
                testWidget.bumpElements(testWidget.draggable2, testWidget.dropTarget1);

                expect(testWidget.draggable2.dataset.slot).toBe('1');
                expect(testWidget.draggable1.dataset.slot).toBe('2');
                expect(testWidget.draggable3.dataset.slot).toBe('3');
            });
        });
        describe('_onListPickerOK', function () {
            it('selects the show only checkbox', function () {
                testWidget.chbxShowOnly.set('checked', false);

                testWidget._onListPickerOK([['blah']]);

                expect(testWidget.chbxShowOnly.get('checked')).toBe(true);
            });
        });
    });
});
