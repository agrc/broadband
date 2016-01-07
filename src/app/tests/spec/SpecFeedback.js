require([
    'app/Feedback',

    'dojo/dom-construct'
],

function (
    Feedback,

    domConstruct
) {
    describe('app/Feedback', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Feedback({}, domConstruct.create('div', {}));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Feedback));
        });
    });
});
