(function () {
    require({
        packages: [
            'agrc',
            'app',
            'dijit',
            'dgrid',
            'dgrid0.3',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'layer-selector',
            'polyfills',
            'put-selector',
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
                name: 'proj4',
                location: './proj4/dist',
                main: 'proj4'
            }, {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }, {
                name: 'stubmodule',
                location: 'stubmodule/src',
                main: 'stub-module'
            }
        ],
        map: {
            esri: {
                dgrid: 'dgrid0.3'
            }
        }
    });
}());
