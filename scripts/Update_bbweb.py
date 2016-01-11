import arcpy
from agrc import logging, messaging, ags
from settings import *


# create new tools object
logger = logging.Logger()
emailer = messaging.Emailer('stdavis@utah.gov', not sendEmails)

# variables
pathToSDE = r".\UBBMAP.sde"
pathToFGD = r".\Broadband.gdb"

fltr = "TRANSTECH <> 60"
fc = 'UBBMAP.UBBADMIN.BB_Service_test'
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
mapServices = ['Broadband/ProviderCoverage',
              'Broadband/ProviderCoverageCached',
              'BBEcon/MapService']
scales = [
    1.8489297737236E7,
    9244648.868618,
    4622324.434309,
    2311162.217155,
    1155581.108577,
    577790.554289,
    288895.277114,
    144447.638572,
    72223.819286
]

try:
    logger.logMsg('setting workspace to sde database')
    arcpy.env.workspace = pathToSDE

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

    # if errors, bail on script and send an email
    if len(missingProviders) > 0 or len(errors) > 0:
        logger.logMsg('Sending error email')
        emailer.sendEmail('Update_bbweb has found errors', logger.log)
    else:
        # delete all feature classes
        logger.logMsg('switching workspace to local filegeodatabase')
        arcpy.env.workspace = pathToFGD

        logger.logMsg('deleting all feature classes')
        fClasses = arcpy.ListFeatureClasses()
        for c in fClasses:
            arcpy.Delete_management(c)
            logger.logGPMsg()

        logger.logMsg('importing new feature classes')
        arcpy.env.outputCoordinateSystem = arcpy.SpatialReference(3857)
        arcpy.FeatureClassToFeatureClass_conversion(pathToSDE + '\\' + fc, pathToFGD, fc.split('.')[2], fltr)

        # provider table
        arcpy.Delete_management(pathToFGD + '\\' + providerTableName.split('.')[2])
        arcpy.TableToTable_conversion(pathToSDE + '\\' + providerTableName, pathToFGD, providerTableName.split('.')[2])
        logger.logGPMsg()

        admin = ags.AGSAdmin(AGS_USER, AGS_PASSWORD, AGS_SERVER)

        for s in mapServices:
            logger.logMsg('stopping {}'.format(s))
            admin.stopService(s, 'MapServer')

        arcpy.Delete_management(pathToProdFGD)
        logger.logGPMsg()
        arcpy.Copy_management(pathToFGD, pathToProdFGD)
        logger.logGPMsg()

        for s in mapServices:
            logger.logMsg('starting {}'.format(s))
            admin.startService(s, 'MapServer')

        logger.logMsg('recaching')

        arcpy.ManageMapServerCacheTiles_server(cachedService, scales, 'RECREATE_ALL_TILES', 1)
        logger.logGPMsg()

        emailer.sendEmail('Update_bbweb.py has run successfully', "Nice work!")

except arcpy.ExecuteError:
    logger.logMsg('arcpy.ExecuteError')
    logger.logError()
    logger.logGPMsg()
    emailer.sendEmail(logger.scriptName + ' - arcpy.ExecuteError', logger.log)

except:
    logger.logError()
    emailer.sendEmail(logger.scriptName + ' - Python Error', logger.log)
