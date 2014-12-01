require([
    'app/_DialogMixin'

], function(
    ClassUnderTest
) {

    var testObject;

    afterEach(function() {
        if (testObject) {
            if (testObject.destroy) {
                testObject.destroy();
            }

            testObject = null;
        }
    });

    describe('app/_DialogMixin', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                testObject = new ClassUnderTest(null);
            });

            it('should create a _DialogMixin', function() {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
        });
    });
});