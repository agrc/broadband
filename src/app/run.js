(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // ** begin dev code
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, "");
        projectUrl = (projectUrl === "") ? '/src' : projectUrl;
        // ** end dev code

        // // ** begin prod code
        // projectUrl = 'http://mapserv.utah.gov/broadband/';
        // // ** end prod code
    } else {
        // running in node build system
        projectUrl = '../';
    }
    require({
        packages: [
            {
                name: 'app',
                location: projectUrl + '/app'
            },{
                name: 'agrc',
                location: projectUrl + '/agrc'
            },{
                name: 'ijit',
                location: projectUrl + '/ijit'
            },{
                name: 'polyfills',
                location: projectUrl + '/polyfills'
            }
        ]
    }, ['app']);
})();