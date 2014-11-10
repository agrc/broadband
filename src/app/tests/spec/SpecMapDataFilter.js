require([
    'app/MapDataFilter',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/query',
    'dojo/topic',
    'dojo/hash'

],

function (
    MapDataFilter,
    domConstruct,
    win,
    query,
    topic,
    hash
    ) {
    describe('app/MapDataFilter', function () {
        var testWidget;
        beforeEach(function () {
            this.addMatchers({
                toBeChecked: function () {
                    var that = this;
                    var notText = this.isNot ? " not": "";
                    this.message = function () {
                        return 'Expected ' + that.actual.dojoAttachPoint + notText + ' to have been checked.';
                    };
                    return this.actual.get('checked') === true;
                }
            });
            testWidget = new MapDataFilter({}, domConstruct.create('div', {}, win.body()));
        });
        afterEach(function () {
            testWidget.destroyRecursive(false);
            dojo.destroy(testWidget.domNode);
            testWidget = null;
            hash('');
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(MapDataFilter));
        });

        describe('wireControlEvents', function () {
            it("wires the sub checkboxes", function () {
                spyOn(testWidget, '_onSubCheckBoxChange');
                testWidget.wireControlEvents();

                testWidget.cbxCable.onClick();

                expect(testWidget._onSubCheckBoxChange).toHaveBeenCalledWith(testWidget.cbxWireBased);

                testWidget.cbxFixedWireless.onClick();

                expect(testWidget._onSubCheckBoxChange).toHaveBeenCalledWith(testWidget.cbxWireless);

                testWidget.cbxMobileWireless.onClick();

                expect(testWidget._onSubCheckBoxChange).toHaveBeenCalledWith(testWidget.cbxWireless);
            });
            it("wires the trans checkboxes", function () {
                spyOn(testWidget, '_onTransCheckBoxChange');
                testWidget.wireControlEvents();

                testWidget.cbxWireless.onClick();

                expect(testWidget._onTransCheckBoxChange).toHaveBeenCalled();
            });
            it('wires the end user category checkboxes', function () {
                spyOn(testWidget, 'updateDefQuery');
                testWidget.wireControlEvents();

                testWidget.cbxResidential.onClick();
                testWidget.cbxBusiness.onClick();

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
        });
        describe('_getTransTypes', function () {
            it("returns all values when all checked", function () {
                expect(testWidget._getTransTypes()).toEqual([40, 41, 10, 20, 30, 50, 70, 71, 80]);
            });
            it("returns some values when some are checked", function () {
                testWidget.cbxCable.set('value', false);
                testWidget.cbxMobileWireless.set('value', false);

                expect(testWidget._getTransTypes()).toEqual([10, 20, 30, 50, 70, 71]);
            });
            it("returns an empty array if none are checked", function () {
                query('.sub-trans-list input:checked', 'tech-type-div').forEach(function (node){
                    dijit.getEnclosingWidget(node).set('value', false);
                });

                expect(testWidget._getTransTypes()).toEqual([]);
            });
        });
        describe('resetFilters', function () {
            it("resets the sub checkboxes", function () {
                var widget;
                query('.sub-trans-list input').forEach(function (node) {
                    widget = dijit.getEnclosingWidget(node);
                    widget.set('value', false);
                });

                testWidget.resetFilters();

                query('.sub-trans-list input').forEach(function (node) {
                    widget = dijit.getEnclosingWidget(node);
                    expect(widget.get('value')).not.toEqual(false);
                });

                // make sure that this doesn't screw up the values
                expect(testWidget._getTransTypes()).toEqual([40, 41, 10, 20, 30, 50, 70, 71, 80]);
            });
        });
        describe('_onSubCheckBoxChange', function () {
            it("sets the parentCheckBox to checked if all subs are checked", function () {
                testWidget.cbxWireless.set('value', false);

                testWidget._onSubCheckBoxChange(testWidget.cbxWireless);

                expect(testWidget.cbxWireless.get('value')).toEqual('on');
            });
            it("sets the parentCheckBox to mixed if some subs are checked", function () {
                testWidget.cbxCable.set('value', false);

                testWidget._onSubCheckBoxChange(testWidget.cbxWireBased);

                expect(testWidget.cbxWireBased.get('value')).toEqual('mixed');
            });
            it("sets the parentCheckBox to false if no subs are checked", function () {
                testWidget.cbxFixedWireless.set('value', false);
                testWidget.cbxMobileWireless.set('value', false);

                testWidget._onSubCheckBoxChange(testWidget.cbxWireless);

                expect(testWidget.cbxWireless.get('value')).toEqual(false);
            });
            it("fires updateDefQuery if updateDefQuery is true", function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget._onSubCheckBoxChange(testWidget.cbxWireless);
                testWidget._onSubCheckBoxChange(testWidget.cbxWireless, false);

                expect(testWidget.updateDefQuery.callCount).toBe(1);
            });
        });
        describe('_onTransCheckBoxChange', function () {
            it("forces the checkbox to 'on' if the new value is 'mixed'", function () {
                testWidget.cbxWireless.set('value', 'mixed');

                testWidget.cbxWireless.onClick();

                expect(testWidget.cbxWireless.get('value')).toEqual('on');
            });
            it("sets all subs to checked if new value is checked", function () {
                testWidget.cbxCable.set('value', false);
                testWidget.cbxWireBased.set('value', 'on');

                testWidget.cbxWireBased.onClick();

                expect(testWidget.cbxCable.get('checked')).toEqual(true);
            });
            it("sets all subs to unchecked if new value is unchecked", function () {
                testWidget.cbxCable.set('checked', true);
                testWidget.cbxWireBased.set('value', false);

                testWidget.cbxWireBased.onClick();

                expect(testWidget.cbxCable.get('checked')).toEqual(false);
            });
            it("fires updateDefQuery", function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget.cbxWireBased.onClick();

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
        });
        describe('updateDefQuery', function () {
            var routerReturned;
            var defQueryReturned;
            beforeEach(function () {
                topic.subscribe(AGRC.topics.Router.onDefQueryUpdate, function (param) {
                    routerReturned = param;
                });
                topic.subscribe(AGRC.topics.MapDataFilter.onQueryUpdate, function(query) {
                    defQueryReturned = query;
                });
            });
            it("fires the onDefQueryUpdate topic", function () {
                var returned;
                var expected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value,
                    endUserCats: ['con']
                };
                topic.subscribe(AGRC.topics.Router.onDefQueryUpdate, function (param) {
                    returned = param;
                });

                testWidget.updateDefQuery();

                expect(returned).toEqual(expected);
            });
            it("doesn't put empty IN statement in the def query", function () {
                var routerExpected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value,
                    transTypes: -1,
                    providers: -1,
                    endUserCats: ['con']
                };
                var defQueryExpected = "MAXADDOWN IN ('11','10','9','8','7','6','5','4','3') " +
                    "AND MAXADUP IN ('11','10','9','8','7','6','5','4','3','2') AND TRANSTECH = -1 " +
                    "AND UTProvCode = '-1' AND EndUserCat <> '2'";
                query('.sub-trans-list input:checked', 'tech-type-div').forEach(function (node){
                    dijit.getEnclosingWidget(node).set('value', false);
                });
                testWidget.chbxShowOnly.set('checked', true);

                testWidget.updateDefQuery();

                expect(routerReturned).toEqual(routerExpected);
                expect(defQueryReturned).toEqual(defQueryExpected);
            });
            it('returns the correct def query for end user category', function () {
                var routerExpected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value,
                    endUserCats: ['bus', 'con']
                };
                var defQueryExpected = "MAXADDOWN IN ('11','10','9','8','7','6','5','4','3') " +
                    "AND MAXADUP IN ('11','10','9','8','7','6','5','4','3','2')";

                testWidget.cbxBusiness.set('checked', true);

                testWidget.updateDefQuery();

                expect(routerReturned).toEqual(routerExpected);
                expect(defQueryReturned).toEqual(defQueryExpected);

                routerExpected = {
                    minDownSpeed: testWidget.downloadSlider.value,
                    minUpSpeed: testWidget.uploadSlider.value,
                    endUserCats: -1
                };
                defQueryExpected = "MAXADDOWN IN ('11','10','9','8','7','6','5','4','3') " +
                    "AND MAXADUP IN ('11','10','9','8','7','6','5','4','3','2') AND " +
                    "EndUserCat = '-1'";

                testWidget.cbxBusiness.set('checked', false);
                testWidget.cbxResidential.set('checked', false);

                testWidget.updateDefQuery();

                expect(routerReturned).toEqual(routerExpected);
                expect(defQueryReturned).toEqual(defQueryExpected);
            });
        });
        describe('selectTransTypes', function () {
            var testTypes = ['70', '71', '80'];
            it("selects only the passed in checkboxes", function () {
                testWidget.selectTransTypes(testTypes);

                expect(testWidget.cbxCable).not.toBeChecked();
                expect(testWidget.cbxDSL).not.toBeChecked();
                expect(testWidget.cbxFiber).not.toBeChecked();
                expect(testWidget.cbxFixedWireless).toBeChecked();
                expect(testWidget.cbxMobileWireless).toBeChecked();

                var anotherTest = ["40","41","10","20","30","50","70","71"];
                testWidget.selectTransTypes(anotherTest);

                expect(testWidget.cbxCable).toBeChecked();
                expect(testWidget.cbxDSL).toBeChecked();
                expect(testWidget.cbxFiber).toBeChecked();
                expect(testWidget.cbxFixedWireless).toBeChecked();
                expect(testWidget.cbxMobileWireless).not.toBeChecked();
            });
            it("fires _onSubCheckBoxChange", function () {
                spyOn(testWidget, '_onSubCheckBoxChange');

                testWidget.selectTransTypes(testTypes);

                expect(testWidget._onSubCheckBoxChange.calls[0].args[1]).toEqual(false);
                expect(testWidget._onSubCheckBoxChange.callCount).toBe(2);
            });
            it("fires updateDefQuery", function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget.selectTransTypes(testTypes);

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
            it("selects all checkboxes if null is passed", function () {
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
            it("set the appropriate slider value", function () {
                testWidget.setSlider('up', 5);

                expect(testWidget.uploadSlider.value).toEqual(5);

                testWidget.setSlider('down', 3);

                expect(testWidget.downloadSlider.value).toEqual(3);
            });
            it("fires updateDefQuery", function () {
                spyOn(testWidget, 'updateDefQuery');

                testWidget.setSlider('up', 5);

                expect(testWidget.updateDefQuery).toHaveBeenCalled();
            });
        });
        describe('setEndUserCategories', function () {
            it('con', function () {
                testWidget.setEndUserCategories(['con']);

                expect(testWidget.cbxResidential.get('checked')).toBe(true);
                expect(testWidget.cbxBusiness.get('checked')).toBe(false);
            });
            it('bus', function () {
                testWidget.setEndUserCategories(['bus']);

                expect(testWidget.cbxResidential.get('checked')).toBe(false);
                expect(testWidget.cbxBusiness.get('checked')).toBe(true);
            });
            it('both', function () {
                testWidget.setEndUserCategories(['bus', 'con']);

                expect(testWidget.cbxResidential.get('checked')).toBe(true);
                expect(testWidget.cbxBusiness.get('checked')).toBe(true);
            });
        });
    });
});