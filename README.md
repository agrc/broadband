# broadband [![Push Events](https://github.com/agrc/broadband/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/broadband/actions/workflows/push.yml)

- Production: [https://broadband.ugrc.utah.gov/](https://broadband.ugrc.utah.gov/)
- Development: [https://broadband.dev.utah.gov](https://broadband.dev.utah.gov/)

Contact: Tim Haslam

## Deployment

1. Publish `Broadband/ProviderCoverage` map service.
1. Publish `Broadband/*Cached` cached map services.
    * PNG32
    * Cache highest levels down to `72223.819286` and set to cache on demand.
1. Publish `Broadband/ExportWebMap` gp service ([docs](https://enterprise.arcgis.com/en/server/10.9.1/publish-services/windows/tutorial-publish-additional-layouts-for-printing-with-arcgis-pro.htm))
    * Default format: PDF
    * Templates folder: `maps\PrintTemplates`
    * Default template: `PrintTemplate.pagx`
    * Synchronous
