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
                name: 'spin',
                location: 'spinjs',
                main: 'spin'
            }
        ]
    };
        
    require(config, [
        'dojo/parser',
        
        'dojo/domReady!',
        'polyfills/responsive'
    ], function (parser) {
        parser.parse();

        AGRC.app.startup();
        AGRC.app.setUpMap();
        AGRC.app.hideLoader();
    });
})();