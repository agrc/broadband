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
    var arcgisServerDomain = '';
    var appServerPath = '/arcgis/rest/services';
    var quadWord = '';
    var apiKey = '';
    if (has('agrc-build') === 'prod') {
        arcgisServerDomain = 'https://mapserv.utah.gov';
        appServerPath = arcgisServerDomain + '/arcgis/rest/services/';
        esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
        quadWord = 'crystal-connect-remote-episode';
        apiKey = 'AGRC-DE590BC6690858';
    } else if (has('agrc-build') === 'stage') {
        arcgisServerDomain = 'http://test.mapserv.utah.gov';
        appServerPath = arcgisServerDomain + '/arcgis/rest/services/';
        esriConfig.defaults.io.corsEnabledServers.push('test.mapserv.utah.gov');
        quadWord = 'wedding-tactic-enrico-yes';
        apiKey = 'AGRC-FE1B257E901672';
    } else if (!window.dojoConfig || !window.dojoConfig.isJasmineTest) {
        // dev
        // for some reason if this variable is set it breaks jasmine tests
        appServerPath = 'http://localhost/arcgis/rest/services/';

        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            apiKey = secrets.apiKey;
            quadWord = secrets.quadWord;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    esriConfig.defaults.io.corsEnabledServers.push('print.agrc.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.11.3',

        map: null,

        // quadWord: String
        //      The access code for discover base maps.
        quadWord: quadWord,

        // apiKey: String
        //      The access code for the UGRC api.
        apiKey: apiKey,

        // configuration: String
        //      The app build configuration.
        configuration: configuration,

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

    return window.AGRC;
});
