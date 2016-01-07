require([
    'app/config',
    'app/ListPicker',

    'dojo/dom-construct',
    'dojo/hash',
    'dojo/_base/array',
    'dojo/_base/window'
],

function (
    config,
    ListPicker,

    domConstruct,
    hash,
    array,
    win
) {
    describe('app/ListPicker', function () {
        var testWidget;
        var providers;
        beforeEach(function () {
            config.mapDataFilter = {
                showResetDialog: true
            };
            jasmine.addMatchers({
                toHaveProviders: function () {
                    return {
                        compare: function (actual, expected) {
                            var result = {
                                pass: array.every(expected, function (prov) {
                                    return array.some(actual.domNode.children, function (option) {
                                        return (option.value === prov);
                                    });
                                })
                            };
                            var notText = result.pass ? ' not' : '';
                            var childrenValue = array.map(actual.domNode.children, function (option) {
                                return option.value;
                            });
                            result.message = function () {
                                return 'Expected ' + actual.dojoAttachPoint + '[' + childrenValue + ']' +
                                    notText + ' to have [' + expected + ']';
                            };
                            return result;
                        }
                    };
                }
            });
            providers = [
                ['description1', 'value1'],
                ['description2', 'value2'],
                ['description3', 'value3']
            ];
            testWidget = new ListPicker({
                availableListArray: providers
            }, domConstruct.create('div', {}, win.body()));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
            hash('');
        });

        it('toHaveProviders should work correctly', function () {
            expect(testWidget.availableList).toHaveProviders(['value1', 'value2', 'value3']);
            expect(testWidget.availableList).not.toHaveProviders(['value4', 'value5']);
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(ListPicker));
        });
        describe('selectProviders', function () {
            var testProviders = ['value2', 'value3'];
            beforeEach(function () {
                spyOn(testWidget, '_onOK');
                testWidget.selectProviders(testProviders);
            });
            it('removes the providers from availableList', function () {
                expect(testWidget.availableList).not.toHaveProviders(testProviders);
            });
            it('adds the providers to the selectedList', function () {
                expect(testWidget.selectedList).toHaveProviders(testProviders);
            });
            it('fires the _onOK method', function () {
                expect(testWidget._onOK).toHaveBeenCalled();
            });
            it('clears any previously selected providers', function () {
                var value = ['value1'];
                spyOn(testWidget, '_onUnselectAll').and.callThrough();

                testWidget.selectProviders(value);

                expect(testWidget._onUnselectAll).toHaveBeenCalled();
                expect(testWidget.selectedList).toHaveProviders(value);
                expect(testWidget.selectedList).not.toHaveProviders(testProviders);
            });
            it('doesn\'t reset showResetDialog to true if it\'s already false', function () {
                config.mapDataFilter.showResetDialog = false;

                testWidget.selectProviders(['blah']);

                expect(config.mapDataFilter.showResetDialog).toEqual(false);
            });
        });
    });
});
