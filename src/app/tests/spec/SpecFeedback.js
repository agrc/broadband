require([
    'app/Feedback',
    'dojo/dom-construct',
    'dojo/_base/window'

],

function (
    Feedback,
    domConstruct,
    win
    ) {
    describe('app/Feedback', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Feedback({}, domConstruct.create('div', {}, win.body()));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Feedback));
        });
        describe('submit', function () {
            it("doesn't do anything if form doesn't validate", function () {
                spyOn(testWidget, 'validate').andReturn(false);
                spyOn(testWidget, '_clearMessage');

                testWidget.submit();

                expect(testWidget.validate).toHaveBeenCalled();
                expect(testWidget._clearMessage).not.toHaveBeenCalled();
            });
        });
    });
});