define([
    'dojo/text!./templates/LoginRegisterCloudRequestPane.html',

    'dojo/_base/declare',

    'dojo/dom-attr',

    'ijit/widgets/authentication/_LoginRegisterRequestPane',
    './_CloudPasswordMixin'
], function(
    template,

    declare,

    domAttr,

    _LoginRegisterRequestPane,
    _CloudPasswordMixin
) {
    return declare([_LoginRegisterRequestPane, _CloudPasswordMixin], {
        // description:
        //      Overloaded Request page to jump through the cloud hosting hoops

        templateString: template
    });
});