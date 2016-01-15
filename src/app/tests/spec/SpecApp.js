require([
    'app/App',
    'app/config',

    'dojo/dom-construct',
    'dojo/on',
    'dojo/topic'
], function (
    App,
    config,

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
            config.app = null;
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
                topic.subscribe(config.topics.App.onMapExtentChange, spy);
                var scale = 'blah';
                config.map = {
                    getScale: jasmine.createSpy('getScale').and.returnValue(scale)
                };
                var center = 'blah2';

                testWidget.onExtentChange({
                    extent: {
                        getCenter: function () {
                            return center;
                        }
                    }
                });

                expect(spy).toHaveBeenCalledWith(center, scale);
            });
        });
    });
});
