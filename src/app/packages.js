(function () {
    require({
        packages: [
            'agrc',
            'app',
            'dijit',
            'dgrid',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'polyfills',
            'put-selector',
            'xstyle',
            {
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            }, {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            }, {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            }, {
                name: 'mustache',
                location: 'mustache',
                main: 'mustache'
            }, {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }, {
                name: 'stubmodule',
                location: 'stubmodule/src',
                main: 'stub-module'
            }
        ]
    });
}());
