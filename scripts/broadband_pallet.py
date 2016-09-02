import arcpy
from forklift.models import Pallet
from forklift.exceptions import ValidationException
from forklift.core import check_schema
from os.path import join


cachedServiceBase = {'Dev': r'arcgis on localhost_6080 (admin)\Broadband\{}Cached.MapServer',
                     'Production': r'arcgis on mapserv (admin)\Broadband\{}Cached.MapServer'}


class BroadbandPallet(Pallet):
    def build(self, configuration):
        self.configuration = configuration

        self.arcgis_services = [('Broadband/ExportWebMap', 'GPServer'),
                                ('Broadband/FixedCached', 'MapServer'),
                                ('Broadband/MobileCached', 'MapServer'),
                                ('Broadband/ProviderCoverage', 'MapServer'),
                                ('Broadband/WirelineCached', 'MapServer')]

        self.staging = r'C:\Scheduled\staging'
        self.broadband = join(self.staging, 'broadband.gdb')
        self.location = join(self.staging, 'location.gdb')
        self.demographic = join(self.staging, 'demographic.gdb')
        self.ubbmap = join(self.garage, 'UBBMAP.sde')
        self.sgid = join(self.garage, 'SGID10.sde')
        self.bb_service = 'UBBMAP.UBBADMIN.BB_Service'

        self.copy_data = [self.broadband]

        self.add_crate((self.bb_service, self.ubbmap, self.broadband, 'BB_Service'))
        self.add_crate(('UBBMAP.UBBADMIN.BB_Providers_Table', self.ubbmap, self.broadband, 'BB_Providers_Table'))
        self.add_crate(('ZoomLocations', self.sgid, self.location))
        self.add_crate(('PopBlockAreas2010_Approx', self.sgid, self.demographic))

    def validate_crate(self, crate):
        fltr = 'TRANSTECH <> 60'
        bb_service = 'UBBMAP.UBBADMIN.BB_Service'
        providerTableName = 'UBBMAP.UBBADMIN.BB_Providers_Table'
        providerTableFieldName = 'Code'
        coverageProviders = []  # list to hold all providers in coverage data
        tableProviders = []  # list of all providers in providers table
        coverageFieldName = 'UTProvCode'
        nonNullFields = ['"' + coverageFieldName + '" IS NULL OR "' + coverageFieldName + '" = \'\'',
                         '"MAXADUP" IS NULL OR "MAXADUP" = 0',
                         '"MAXADDOWN" IS NULL OR "MAXADDOWN" = 0',
                         '"TRANSTECH" IS NULL OR "TRANSTECH" = 0']
        errors = []

        if crate.source_name != 'BB_Service':
            return NotImplemented

        #: this will raise if it doesn't pass...
        check_schema(crate)

        arcpy.env.workspace = crate.source_workspace
        arcpy.env.geographicTransformations = 'NAD_1983_To_WGS_1984_5'

        self.log.info("checking non-null fields")

        # create layer for selecting
        self.log.info('creating layer')
        layerName = bb_service + 'Layer'
        arcpy.MakeFeatureLayer_management(bb_service, layerName, fltr)

        # loop through fields
        for query in nonNullFields:
            self.log.info('query: ' + query)
            arcpy.SelectLayerByAttribute_management(layerName, 'NEW_SELECTION', query)
            cnt = arcpy.GetCount_management(layerName)

            if int(str(cnt)) > 0:
                errors.append('ERROR: null or empty values found in ' + bb_service + ':' + query)

        # get search cursor
        self.log.info('building list of providers in coverage feature class')
        cur = arcpy.SearchCursor(bb_service, fltr, '', coverageFieldName)
        row = cur.next()
        while row:
            code = row.getValue(coverageFieldName)

            # add to list of providers
            if not [code, bb_service] in coverageProviders:
                coverageProviders.append([code, bb_service])

            row = cur.next()
        del cur

        self.log.info('Finished with ' + bb_service)

        # get cursor for provider table
        self.log.info('building list of providers in providers table')
        prows = arcpy.SearchCursor(providerTableName, "Exclude IS NULL OR Exclude = ''")
        row = prows.next()
        while row:
            tableProviders.append(row.getValue(providerTableFieldName))

            row = prows.next()
        del prows, row

        # loop through coverage providers and make sure that they are in the provider table list
        self.log.info('looking for providers that show up in coverage data but not providers table')
        missingProviders = []
        for row in coverageProviders:
            if not row[0] in tableProviders:
                missingProviders.append(row[0])

        # check for data errors
        if len(errors) > 0:
            self.log.info('ERRORS IN DATA:')
            for e in errors:
                self.log.info(e)
        else:
            self.log.info('NO ERRORS IN DATA')

        # check for mis matching providers
        if len(missingProviders) > 0:
            self.log.info('MISSING PROVIDERS THAT ARE IN THE COVERAGE DATA BUT NOT IN THE PROVIDERS TABLE:')
            errors.append('missing providers in the coverage data: {}'.format(missingProviders))
            for mp in missingProviders:
                self.log.info(str(mp))
        else:
            self.log.info('NO PROVIDERS FOUND IN THE COVERAGE DATA THAT ARE NOT IN THE PROVIDERS TABLE.')

        if len(missingProviders) > 0 or len(errors) > 0:
            validation_message = 'Errors were found during validation: {}'.format(errors)
            self.log.info(validation_message)
            raise ValidationException(validation_message)

        return True

    def process(self):
        cachedServices = ['Wireline', 'Fixed', 'Mobile']
        scales = [
            591657527.591555,
            295828763.795777,
            147914381.897889,
            73957190.948944,
            36978595.474472,
            18489297.737236,
            9244648.868618,
            4622324.434309,
            2311162.217155,
            1155581.108577,
            577790.554289,
            288895.277144,
            144447.638572,
            72223.819286
        ]

        self.log.info('recaching')
        for cs in cachedServices:
            self.log.info(cs)
            cache_path = join(self.garage, cachedServiceBase[self.configuration].format(cs))
            arcpy.ManageMapServerCacheTiles_server(cache_path, scales, 'RECREATE_ALL_TILES', 1)

        index_names = ['MAXADDOWN', 'MAXADUP', 'TransTech', 'UTProvCode']
        bb_service = join(self.broadband, self.bb_service.split('.')[-1])
        indexes = [x.name for x in arcpy.ListIndexes(bb_service)]
        for field in index_names:
            if field not in indexes:
                self.log.info('building index for: ' + field)
                arcpy.AddIndex_management(bb_service, field, field)
