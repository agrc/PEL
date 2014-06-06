define([
    'dojo/text!./templates/_LoginRegisterCloudLogout.html',

    'dojo/_base/declare',

    'ijit/widgets/authentication/_LoginRegisterLogout',
    './_CloudPasswordMixin'
], function(
    template,

    declare,

    _LoginRegisterLogout,
    _CloudPasswordMixin
) {
    return declare([_LoginRegisterLogout, _CloudPasswordMixin], {
        // description:
        //      Overloaded Logout widget with cloud password restrictions for changing password

        templateString: template
    });
});