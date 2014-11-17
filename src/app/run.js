(function () {
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src': './',
        packages: [
            'agrc',
            'app',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'polyfills',
            {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            },{
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            },
            'dgrid',
            'put-selector',
            'xstyle',
            {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            }
        ],
        map: {
            '*': {
                'agrc/widgets/locate/templates/FindAddress.html':
                    'app/templates/FindAddress.html'
            }
        }
    };
        
    require(config, [
        'dojo/parser',
        
        'dojo/domReady!',
        'polyfills/responsive'
    ], function (parser) {
        parser.parse();
    });
})();