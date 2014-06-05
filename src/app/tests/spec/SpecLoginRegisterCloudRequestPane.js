require([
    'app/LoginRegisterCloudRequestPane',

    'dojo/_base/window',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    win,

    domConstruct
) {
    describe('app/LoginRegisterCloudRequestPane', function() {
        var widget;
        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a LoginRegisterCloudRequestPane', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('Password Restrictions', function() {
            it('should be 8 characters in length', function() {
                expect(widget.validate('aB1234$&').result).toEqual(true);
                expect(widget.validate('aB1&').result).toEqual(false);
            });
            it('should have one uppercase letter', function() {
                expect(widget.validate('aB1234$&').result).toEqual(true);
                expect(widget.validate('ab1234$&').result).toEqual(false);
            });
            it('should have one lowercase letter', function() {
                expect(widget.validate('aB1234$&').result).toEqual(true);
                expect(widget.validate('AB1234$&').result).toEqual(false);
            });
            it('should have one special character', function() {
                expect(widget.validate('aB1234$&').result).toEqual(true);
                expect(widget.validate('aB123456').result).toEqual(false);
            });
            it('should have one number', function() {
                expect(widget.validate('aB1234$&').result).toEqual(true);
                expect(widget.validate('aB!@#$%^').result).toEqual(false);
            });
        });
    });
});