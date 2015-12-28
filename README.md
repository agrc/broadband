[![Build Status](https://travis-ci.org/agrc/broadband.svg)](https://travis-ci.org/agrc/broadband)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-broadband.svg)](https://saucelabs.com/u/agrc-broadband)
Residential Broadband Map
=========================

Web application showcasing the state of Utah's broadband data.

### Deployment
1. Publish `Broadband/ProviderCoverage` map service.
1. Publish `Broadband/ProviderCoverageCached` cached map service.
    * PNG32
    * Cache highest 5 levels and set to cache on demand.
1. Publish `Broadband/ExportWebMap` gp service ([docs](http://server.arcgis.com/en/server/latest/get-started/windows/tutorial-publishing-additional-services-for-printing.htm))
    * Default format: PDF
    * Templates folder: `maps\PrintTemplates`
    * Default template: `Main.mxd`
