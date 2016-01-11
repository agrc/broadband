require([
    'app/PrintDialog',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/PrintDialog', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a PrintDialog', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getCustomTextElements', function () {
            it('returns empty array if no hash', function () {
                expect(widget.getCustomTextElements('')).toEqual([]);
            });
            it('returns the correct values', function () {
                var fullHash = '/route/minDownSpeed=9&minUpSpeed=8&transTypes=40|41|50|70|71|80&' +
                    'providers=Baja|Beeline&extent=446372|4503183|288895';
                expect(widget.getCustomTextElements(fullHash)).toEqual([
                    {techs: 'Cable\nFiber\nFixed Wireless\nMobile Wireless'},
                    {speeds: '0.768+ Mbps Download\n1.5+ Mbps Upload'},
                    {providers: 'Baja\nBeeline'}
                ]);
            });
        });
    });
});
