require([
    'app/App',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/topic',
    'dojo/on'

],

function (
    App,
    domConstruct,
    win,
    topic,
    on
    ) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, win.body()));
        });
        afterEach(function () {
            testWidget.destroyRecursive(false);
            dojo.destroy(testWidget.domNode);
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
        describe('wireEvents', function () {
            it("wires the popoutLink event", function () {
                spyOn(testWidget, 'onPopoutLinkClick');
                testWidget.wireEvents();

                on.emit(testWidget.popoutLink, 'click', {
                    bubbles: false,
                    cancelable: true
                });

                expect(testWidget.onPopoutLinkClick).toHaveBeenCalled();
            });
        });
        describe('onExtentChange', function () {
            it("fires the extentChange topic", function () {
                var spy = jasmine.createSpy('onExtentChangeSpy');
                topic.subscribe(AGRC.topics.App.onMapExtentChange, spy);
                var value = 'blah';

                testWidget.onExtentChange(value);

                expect(spy).toHaveBeenCalledWith(value);
            });
        });
        xdescribe('onPopoutLinkClick', function () {
            var StubbedWidget;
            var testWidget2;
            var animatePropertySpy = jasmine.createSpy('animateProperty');
            beforeEach(function () {
                StubbedWidget = stubModule('app/App', {
                    'dojo/_base/fx': {
                        animateProperty: animatePropertySpy
                    }
                });
                testWidget2 = new StubbedWidget({}, domConstruct.create('div', {}, win.body()));
            });
            it("create the animations", function () {
                testWidget2.onPopoutLinkClick();

                expect(animatePropertySpy.calls.length).toEqual(2);
            });
        });
        describe('makeQueryDirty', function () {
            it("appends the string with the javascript time", function () {
                var result = testWidget.makeQueryDirty('test');

                expect(result.length).toEqual(38);
            });
            it("doesn't append if the string is empty", function () {
                expect(testWidget.makeQueryDirty('').length).toBe(0);
            });
        });
    });
});