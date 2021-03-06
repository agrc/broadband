define([
    'esri/config',

    'dojo/has',
    'dojo/request/xhr'
],

function (
    esriConfig,

    has,
    xhr
) {
    var baseDomain = '';
    var appBaseUrl = '';
    var appServerPath = '';
    if (has('agrc-build') === 'prod') {
        baseDomain = 'https://mapserv.utah.gov';
        appBaseUrl = baseDomain + '/broadband/';
        appServerPath = baseDomain + '/ArcGIS/rest/services/';
        esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    } else if (has('agrc-build') === 'stage') {
        baseDomain = 'http://test.mapserv.utah.gov';
        appServerPath = baseDomain + '/ArcGIS/rest/services/';
        esriConfig.defaults.io.corsEnabledServers.push('test.mapserv.utah.gov');
    } else if (!window.dojoConfig || !window.dojoConfig.isJasmineTest) {
        // dev
        // for some reason if this variable is set it breaks jasmine tests
        appServerPath = 'http://localhost/ArcGIS/rest/services/';
    }
    esriConfig.defaults.io.corsEnabledServers.push('print.agrc.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');
    var config = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.11.3',

        appBaseUrl: appBaseUrl,

        map: null,

        // currentLayer: esri/layer
        //      keeps track if the dynamic or cached layer is showing
        currentLayer: null,

        broadbandMapURL: appServerPath + 'Broadband/ProviderCoverage/MapServer',
        broadbandMapCachedURLs: {
            mobile: appServerPath + 'Broadband/MobileCached/MapServer',
            fixed: appServerPath + 'Broadband/FixedCached/MapServer',
            wireline: appServerPath + 'Broadband/WirelineCached/MapServer'
        },
        landOwnershipLayerURL: 'https://gis.trustlands.utah.gov/server' +
                               '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/MapServer',
        redlineUrl: '/chalkdust',
        exportWebMapUrl: 'https://print.agrc.utah.gov/15/arcgis/rest/services/GPServer/export',
        defaultOpacities: {
            wireline: 0.66,
            fixed: 0.33,
            mobile: 0.33
        },
        defaultSpeeds: {
            down: 7,
            up: 9
        },
        layerIndices: {
            wireline: 0,
            fixed: 1,
            mobile: 2,
            zoomLocations: 3,
            coverageQueryLayer: 4,
            populatedAreas: 5,
            providersTable: 6
        },

        fieldNames: {
            UTProvCode: 'UTProvCode',
            MAXADUP: 'MAXADUP',
            MAXADDOWN: 'MAXADDOWN',
            NAME: 'Colloquial',
            ID: 'Code',
            URL: 'URL',
            ID_NUM: 'ID_NUM',
            TRANSTECH: 'TransTech',
            LastVerified: 'LastVerified',
            telcom: {
                PROVIDER: 'PROVIDER',
                WEBLINK: 'WEBLINK'
            },
            Biz_Only: 'Biz_Only'
        },
        providers: {},
        speedsDomain: {
            '10': 0.2,
            '9': 0.768,
            '8': 1.5,
            '7': 3,
            '6': 6,
            '5': 10,
            '4': 25,
            '3': 50,
            '2': 100,
            '1': 1000
        },
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
        breakPointLevel: 9, // the level at which the dynamic coverage service turns on and the cached service turns off
        topics: {
            Router: {
                onDefQueryUpdate: 'broadband.Router.onDefQueryUpdate'
            },
            listpickerOnOK: 'broadband.listpickerOnOK',
            MapDataFilter: {
                onResetFilter: 'broadband.MapDataFilter.onResetFilter',
                onQueryUpdate: 'broadband.MapDataFilter.onQueryUpdate',
                updateSatLinkVisibility: 'broadband.MapDataFilter.updateSatLinkVisibility'
            },
            App: {
                onMapExtentChange: 'broadband.App.onMapExtentChange',
                providersObtained: 'broadband.App.providersObtained'
            },
            ListProviders: {
                onSatLinkClick: 'broadband.ListProviders.onSatLinkClick'
            }
        },
        hashIdentifier: '/route/',

        // disableFeedback: Boolean
        //      Used to disable feedback being sent during testing
        disableFeedback: false,

        telcomFeatureClassName: 'SGID10.UTILITIES.RuralTelcomBoundaries'
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
