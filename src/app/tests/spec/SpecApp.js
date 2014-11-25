require([
    'app/App',

    'dojo/dom-construct',
    'dojo/on',
    'dojo/topic'
], function (
    App,

    domConstruct,
    on,
    topic
) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, window.body));
        });
        afterEach(function () {
            testWidget.destroy();
            domConstruct.destroy(testWidget.domNode);
            testWidget = null;
            window.AGRC.app = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
        describe('wireEvents', function () {
            it('wires the popoutLink event', function () {
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
            it('fires the extentChange topic', function () {
                var spy = jasmine.createSpy('onExtentChangeSpy');
                topic.subscribe(AGRC.topics.App.onMapExtentChange, spy);
                var scale = 'blah';
                AGRC.map = {
                    getScale: jasmine.createSpy('getScale').and.returnValue(scale)
                };
                var center = 'blah2';

                testWidget.onExtentChange({
                    extent: {
                        getCenter: function () { return center; }
                    }
                });

                expect(spy).toHaveBeenCalledWith(center, scale);
            });
        });
        describe('makeQueryDirty', function () {
            it('appends the string with the javascript time', function () {
                var result = testWidget.makeQueryDirty('test');

                expect(result.length).toEqual(38);
            });
            it('doesn\'t append if the string is empty', function () {
                expect(testWidget.makeQueryDirty('').length).toBe(0);
            });
        });
    });
});