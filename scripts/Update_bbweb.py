import arcpy
from settings import *
from forklift.models import Pallet
from forklift.core import check_schema
from os.path import dirname, join


class BroadbandPallet(Pallet):
    def __init__(self):
        super(BroadbandPallet, self).__init__()

        destination_workspace = r'C:\ForkliftData\Broadband.gdb'
        source_workspace = join(dirname(__file__), 'UBBMAP.sde')

        self.add_crates(['BB_Service', 'BB_Providers_Table'],
                        {'source_workspace': source_workspace, 'destination_workspace': destination_workspace})

        self.copy_data = [destination_workspace]

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

        if not check_schema(crate.source, crate.destination):
            return False

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
                missingProviders.append(row)

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
            for mp in missingProviders:
                self.log.info(str(mp))
        else:
            self.log.info('NO PROVIDERS FOUND IN THE COVERAGE DATA THAT ARE NOT IN THE PROVIDERS TABLE.')

        if len(missingProviders) > 0 or len(errors) > 0:
            self.log.info('Errors were found during validation: %s', errors)
            return False

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
            arcpy.ManageMapServerCacheTiles_server(cachedServiceBase.format(cs), scales, 'RECREATE_ALL_TILES', 1)
