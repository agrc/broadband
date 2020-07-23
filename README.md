# broadband [![Build Status](https://travis-ci.org/agrc/starch.svg?branch=master)](https://travis-ci.org/agrc/broadband)

Production: [https://mapserv.utah.gov/broadband/](https://mapserv.utah.gov/broadband/)

Contact: Tim Haslam

## Deployment

1. Publish `Broadband/ProviderCoverage` map service.
1. Publish `Broadband/*Cached` cached map services.
    * PNG32
    * Cache highest 5 levels and set to cache on demand.
1. Publish `Broadband/ExportWebMap` gp service ([docs](https://server.arcgis.com/en/server/latest/get-started/windows/tutorial-publishing-additional-services-for-printing.htm))
    * Default format: PDF
    * Templates folder: `maps\PrintTemplates`
    * Default template: `Main.mxd`
    * Synchronous
1. `grunt build-prod && grunt deploy-prod`
