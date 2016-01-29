# Check UBBMAP sde data for errors
#
# Scott Davis | stdavis@utah.gov
# 8-22-11

import arcpy
from agrc import logging

# create new tools object
logger = logging.Logger()

# variables
pathToSDE = r"UBBMAP.sde"
fltr = "TRANSTECH <> 60"
fc = 'UBBMAP.UBBADMIN.BB_Service'
coverageFieldName = "UTProvCode"
providerTableName = "UBBMAP.UBBADMIN.BB_Providers_Table"
providerTableFieldName = "Code"
coverageProviders = []  # list to hold all providers in coverage data
tableProviders = []  # list of all providers in providers table
nonNullFields = ['"' + coverageFieldName + '" IS NULL OR "' + coverageFieldName + '" = \'\'',
                 '"MAXADUP" IS NULL OR "MAXADUP" = 0',
                 '"MAXADDOWN" IS NULL OR "MAXADDOWN" = 0',
                 '"TRANSTECH" IS NULL OR "TRANSTECH" = 0']
errors = []

try:
    logger.logMsg('setting workspace to sde database')
    arcpy.env.workspace = pathToSDE
    arcpy.env.geographicTransformations = 'WGS_1984_(ITRF00)_To_NAD_1983'

    logger.logMsg("checking non-null fields")

    # create layer for selecting
    logger.logMsg('creating layer')
    layerName = fc + 'Layer'
    arcpy.MakeFeatureLayer_management(fc, layerName, fltr);
    logger.logGPMsg()

    # loop through fields
    for query in nonNullFields:
        logger.logMsg('query: ' + query)
        arcpy.SelectLayerByAttribute_management(layerName, 'NEW_SELECTION', query)
        logger.logGPMsg()
        cnt = arcpy.GetCount_management(layerName)
        logger.logGPMsg()

        if int(str(cnt)) > 0:
            errors.append('ERROR: null or empty values found in ' + fc + ':' + query)

    # get search cursor
    logger.logMsg("building list of providers in coverage feature class")
    cur = arcpy.SearchCursor(fc, fltr, "", coverageFieldName)
    row = cur.next()
    while row:
        code = row.getValue(coverageFieldName)

        # add to list of providers
        if not [code, fc] in coverageProviders:
            coverageProviders.append([code, fc])

        row = cur.next()
    del cur

    logger.logMsg("Finished with " + fc)

    # get cursor for provider table
    logger.logMsg("building list of providers in providers table")
    prows = arcpy.SearchCursor(providerTableName, "Exclude IS NULL OR Exclude = ''")
    row = prows.next()
    while row:
        tableProviders.append(row.getValue(providerTableFieldName))

        row = prows.next()
    del prows, row

    # loop through coverage providers and make sure that they are in the provider table list
    logger.logMsg('looking for providers that show up in coverage data but not providers table')
    missingProviders = []
    for row in coverageProviders:
        if not row[0] in tableProviders:
            missingProviders.append(row)

    # check for data errors
    if len(errors) > 0:
        logger.logMsg("ERRORS IN DATA:")
        for e in errors:
            logger.logMsg(e)
    else:
        logger.logMsg("NO ERRORS IN DATA")

    # check for mis matching providers
    if len(missingProviders) > 0:
        logger.logMsg("MISSING PROVIDERS THAT ARE IN THE COVERAGE DATA BUT NOT IN THE PROVIDERS TABLE:")
        for mp in missingProviders:
            logger.logMsg(str(mp))
    else:
        logger.logMsg("NO PROVIDERS FOUND IN THE COVERAGE DATA THAT ARE NOT IN THE PROVIDERS TABLE.")
except arcpy.ExecuteError:
    logger.logGPMsg()
    logger.logError()
    print 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

except:
    logger.logError()
    print 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

raw_input("\ndone. Press Enter to exit...")
