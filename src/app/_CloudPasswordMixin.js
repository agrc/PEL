define([
    'dojo/_base/declare',

    'dojo/dom-attr'
], function(
    declare,

    domAttr
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare(null, {
        updateUi: function(params) {
            // summary:
            //      validates a passowrd
            // params
            console.log('app.LoginRegisterCloudRequestPane::updateUi', arguments);

            var password = params.target.value;
            var valid = this.validate(password);

            this.set('notify', valid);

            return valid.result;
        },

        _setNotifyAttr: function(value) {
            domAttr.set(this.notifyLength, 'checked', value.length);
            domAttr.set(this.notifyUppercase, 'checked', value.uppercase);
            domAttr.set(this.notifyLowercase, 'checked', value.lowercase);
            domAttr.set(this.notifyNumber, 'checked', value.number);
            domAttr.set(this.notifySpecial, 'checked', value.special);
        },

        validate: function(password) {
            // summary:
            //      validates a password with specific rules
            // password
            console.log('app.LoginRegesterCloudRequestPane::validate', arguments);

            var hasNumber = /(?=.*\d)/,
                hasLower = /(?=.*[a-z])/,
                hasUpper = /(?=.*[A-Z])/,
                hasSpecial = /(?=.*[()~!$%^&_\-+=`|{}\[\]:;'<>,.?\/@*#])/;

            var length = password.length >= 8,
                lowercase = hasLower.test(password),
                uppercase = hasUpper.test(password),
                number = hasNumber.test(password),
                special = hasSpecial.test(password),
                valid = length && lowercase && uppercase && number && special;


            if (valid) {
                valid = this.inherited(arguments);
            }

            console.log(valid);

            return {
                result: valid,
                length: length,
                lowercase: lowercase,
                uppercase: uppercase,
                number: number,
                special: special
            };
        }
    });
});