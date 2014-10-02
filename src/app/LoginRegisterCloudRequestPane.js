define([
    'dojo/text!app/templates/LoginRegisterCloudRequestPane.html',

    'dojo/_base/declare',

    'ijit/widgets/authentication/_LoginRegisterRequestPane',
    'app/_CloudPasswordMixin'
], function(
    template,

    declare,

    _LoginRegisterRequestPane,
    _CloudPasswordMixin
) {
    return declare([_LoginRegisterRequestPane, _CloudPasswordMixin], {
        // description:
        //      Overloaded Request page to jump through the cloud hosting hoops

        templateString: template
    });
});