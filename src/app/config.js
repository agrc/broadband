/* jshint camelcase: false */
define([
    'dojo/has',
    'dojo/request/xhr'
],

function (
    has,
    xhr
) {
    var baseDomain = (has('agrc-build') === 'prod') ? 'http://mapserv.utah.gov' : '';
    var appServerPath = baseDomain + '/ArcGIS/rest/services/';
    var appBaseUrl = (has('agrc-build') === 'prod') ? baseDomain + '/broadband/' : '';
    var config = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.5.0',

        appBaseUrl: appBaseUrl,

        map: null,

        // currentLayer: esri/layer
        //      keeps track if the dynamic or cached layer is showing
        currentLayer: null,

        // path to app
        appServerPath: appServerPath,
        broadbandMapURL: appServerPath + 'Broadband/ProviderCoverage/MapServer',
        broadbandMapCachedURL: appServerPath + 'Broadband/ProviderCoverageCached/MapServer',
        redlineUrl: '/chalkdust',
        exportWebMapUrl: appServerPath + 'Broadband/ExportWebMap/GPServer/Export Web Map',

        fieldNames: {
            UTProvCode: 'UTProvCode',
            MAXADUP: 'MAXADUP',
            MAXADDOWN: 'MAXADDOWN',
            NAME: 'Colloquial',
            ID: 'Code',
            URL: 'URL',
            ID_NUM: 'ID_NUM',
            TRANSTECH: 'TRANSTECH',
            Biz_Only: 'Biz_Only'
        },
        providers: {},
        speedsDomain: {
            '2': '256 - 768 Kbps',
            '3': '768 Kbps - 1.5 Mbps',
            '4': '1.5 - 3 Mbps',
            '5': '3 - 6 Mbps',
            '6': '6 - 10 Mbps',
            '7': '10 - 25 Mbps',
            '8': '25 - 50 Mbps',
            '9': '50 - 100 Mbps',
            '10': '100 - 1000 Mbps',
            '11': 'greater than 1000 Mbps'
        },
        // TODO: refactor MapDataFilter.js to use speedsDomain and get rid of this property
        speedValues: ['11','10','9','8','7','6','5','4','3','2'],
        typesDomain: {
            '10': 'DSL',
            '20': 'DSL',
            '30': 'Other Wireline',
            '40': 'Cable',
            '41': 'Cable',
            '50': 'Fiber',
            '60': 'Satellite',
            '70': 'Fixed Wireless',
            '71': 'Fixed Wireless',
            '80': 'Mobile Wireless'
        },
        layersDrawing: 0, // keeps track of layers that have draw - see addLoadingToLayer
        breakPointLevel: 9, // the level at which the dynamic coverage service turns on and the cached service turns off
        topics: {
            Router: {
                onDefQueryUpdate: 'broadband.Router.onDefQueryUpdate'
            },
            listpickerOnOK: 'broadband.listpickerOnOK',
            MapDataFilter: {
                onResetFilter: 'broadband.MapDataFilter.onResetFilter',
                onQueryUpdate: 'broadband.MapDataFilter.onQueryUpdate'
            },
            App: {
                onMapExtentChange: 'broadband.App.onMapExtentChange',
                providersObtained: 'broadband.App.providersObtained'
            }
        },
        hashIdentifier: '/route/',

        // disableFeedback: Boolean
        //      Used to disable feedback being sent during testing
        disableFeedback: false
    };

    xhr(require.baseUrl + 'secrets.json', {
        handleAs: 'json',
        sync: true
    }).then(function (secrets) {
        var build = has('agrc-build') || 'dev';
        config.apiKey = secrets.apiKeys[build];
        config.quadWord = secrets.quadWords[build];
    }, function () {
        throw 'Error getting secrets!';
    });

    return config;
});
