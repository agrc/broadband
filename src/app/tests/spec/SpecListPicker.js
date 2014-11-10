require([
    'app/ListPicker',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/_base/array',
    'dojo/hash'

],

function (
    ListPicker,
    domConstruct,
    win,
    array,
    hash
    ) {
    describe('app/ListPicker', function () {
        var testWidget;
        var providers;
        beforeEach(function () {
            AGRC.mapDataFilter = {
                showResetDialog: true
            };
            this.addMatchers({
                toHaveProviders: function(providers) {
                    var that = this;
                    var notText = this.isNot ? " not" : "";
                    this.message = function () {
                        return 'Expected ' + that.actual.dojoAttachPoint + "[" + childrenValue + "]" + 
                            notText + " to have [" + providers + "]";
                    };
                    var childrenValue = array.map(that.actual.domNode.children, function (option) {
                        return option.value;
                    });
                    return array.every(providers, function (prov) {
                        return array.some(that.actual.domNode.children, function (option) {
                            return (option.value === prov);
                        });
                    });
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

        it("toHaveProviders should work correctly", function () {
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
            it("removes the providers from availableList", function () {
                expect(testWidget.availableList).not.toHaveProviders(testProviders);
            });
            it("adds the providers to the selectedList", function () {
                expect(testWidget.selectedList).toHaveProviders(testProviders);                
            });
            it("fires the _onOK method", function () {
                expect(testWidget._onOK).toHaveBeenCalled();
            });
            it("clears any previously selected providers", function () {
                var value = ['value1'];
                spyOn(testWidget, '_onUnselectAll').andCallThrough();

                testWidget.selectProviders(value);

                expect(testWidget._onUnselectAll).toHaveBeenCalled();
                expect(testWidget.selectedList).toHaveProviders(value);
                expect(testWidget.selectedList).not.toHaveProviders(testProviders);
            });
            it("doesn't reset showResetDialog to true if it's already false", function () {
                AGRC.mapDataFilter.showResetDialog = false;

                testWidget.selectProviders(['blah']);

                expect(AGRC.mapDataFilter.showResetDialog).toEqual(false);
            });
        });
    });
});