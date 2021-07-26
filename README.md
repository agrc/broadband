# broadband [![firebase deploy](https://github.com/agrc/broadband/actions/workflows/nodejs.yml/badge.svg)](https://github.com/agrc/broadband/actions/workflows/nodejs.yml)

- Production: [https://broadband.ugrc.utah.gov/](https://broadband.ugrc.utah.gov/)
- Development: [https://broadband.dev.utah.gov](https://broadband.dev.utah.gov/)

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
