/*jshint unused:false */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'uglify',
    layerOptimize: 'uglify',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/App',
                'esri/dijit/Attribution',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    packages: [{
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    },{
        name: 'mustache',
        location: 'mustache',
        main: 'mustache'
    }],
    map: {
        'ladda': {
            'spin': 'ladda/dist/spin'
        }
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri']
    },
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api':0,
        'dojo-log-api':0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates':0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader':0,
        
        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory':0,

        // We aren’t loading tests in production
        'dojo-test-sniff':0
    }
};