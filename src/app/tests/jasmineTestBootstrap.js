/* global JasmineFaviconReporter, jasmineRequire */
var dojoConfig = { // eslint-disable-line no-unused-vars
    isJasmineTest: true,
    baseUrl: '/src/',
    packages: ['dojo', {
        name: 'matchers',
        location: 'matchers/src'
    },{
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    }],
    has: {
        'dojo-undef-api': true
    }
};

// for jasmine-favicon-reporter
jasmine.getEnv().addReporter(new JasmineFaviconReporter());
jasmine.getEnv().addReporter(new jasmineRequire.JSReporter2());
