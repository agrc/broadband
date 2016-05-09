[![Build Status](https://travis-ci.org/agrc/starch.svg?branch=master)](https://travis-ci.org/agrc/broadband)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-broadband.svg)](https://saucelabs.com/u/agrc-broadband)

### Deployment
1. Publish `Broadband/ProviderCoverage` map service.
1. Publish `Broadband/*Cached` cached map services.
    * PNG32
    * Cache highest 5 levels and set to cache on demand.
1. Publish `Broadband/ExportWebMap` gp service ([docs](https://server.arcgis.com/en/server/latest/get-started/windows/tutorial-publishing-additional-services-for-printing.htm))
    * Default format: PDF
    * Templates folder: `maps\PrintTemplates`
    * Default template: `Main.mxd`
    * Synchronous
1. For production `dist/index.html` needs to be sent to Steven Stalter (sstalter@utah.gov) to be posted at [broadband.utah.gov/map](https://broadband.utah.gov/map). The rest of the app is hosted on [mapserv.utah.gov/broadband](https://mapserv.utah.gov/broadband).
