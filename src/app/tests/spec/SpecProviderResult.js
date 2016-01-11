require([
    'app/ProviderResult',

    'dojo/dom-construct'
], function (
    ProviderResult,

    domConstruct
) {
    describe('app/ProviderResult', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new ProviderResult({}, domConstruct.create('div', {}, document.body));
            testWidget.startup();
        });
        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(ProviderResult));
        });
        describe('postCreate', function () {
            it('normalizes speed values', function () {
                var testWidget2 = new ProviderResult({
                    maxup: 0.8,
                    maxdown: 25
                });
                testWidget2.startup();

                expect(testWidget2.maxup).toBe(1);
                expect(testWidget2.maxdown).toBe(6);
            });
        });
    });
});
