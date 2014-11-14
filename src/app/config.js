define([
], 

function (
    ) {
    var appServerPath = 'http://168.180.161.9/ArcGIS/rest/services/';
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '2.0.2',

        map: null,

        // currentLayer: esri/layer
        //      keeps track if the dynamic or cached layer is showing
        currentLayer: null,

        // used to point to base maps, i think
        mapServerPath: 'http://mapserv.utah.gov/ArcGIS/rest/services/',

        // path to app
        appServerPath: appServerPath,
        broadbandMapURL: appServerPath + 'Broadband/ProviderCoverage/MapServer',
        broadbandMapCachedURL: appServerPath + 'Broadband/ProviderCoverageCached/MapServer',
        // basemapsURL: appServerPath + 'Broadband/Basemaps/MapServer',
        fieldNames: {
            UTProvCode: 'UTProvCode',
            MAXADUP: 'MAXADUP',
            MAXADDOWN: 'MAXADDOWN',
            NAME: 'Colloquial',
            ID: 'Code',
            URL: 'URL',
            ID_NUM: 'ID_NUM',
            TRANSTECH: 'TRANSTECH',
            EndUserCat: 'EndUserCat'
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
            '70': 'Wireless',
            '71': 'Wireless',
            '80': 'Wireless'
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
                onMapExtentChange: 'broadband.App.onMapExtentChange'
            }
        },
        hashIdentifier: '/route/',

        // disableFeedback: Boolean
        //      Used to disable feedback being sent during testing
        disableFeedback: false
    };
});