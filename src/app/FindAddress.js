define([
    'agrc/widgets/locate/FindAddress',

    'dojo/_base/declare',
    'dojo/text!app/templates/FindAddress.html'
], function (
    FindAddress,

    declare,
    template
) {
    return declare([FindAddress], {
        templateString: template
    });
});
