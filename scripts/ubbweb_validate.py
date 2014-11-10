# Check UBBMAP sde data for errors 
#
# Scott Davis | stdavis@utah.gov
# 8-22-11

import arcpy
from agrc import logging

# create new tools object
logger = logging.Logger()

# variables
pathToSDE = r"C:\PythonScripts\DatabaseConnections\UBBMAP.sde"
fltr = "Provider_Type = 1 AND NOT (UTProvCode IN ('Strata'))"
fltr_wireless = "TRANSTECH <> 60"
fcs = [
       ['UBBMAP.UBBADMIN.BB_Service_Buffered_Road', fltr],
       ['UBBMAP.UBBADMIN.BB_Service_CensusBlock', fltr],
       ['UBBMAP.UBBADMIN.BB_Service_Wireless', fltr_wireless],
       ['UBBMAP.UBBADMIN.BB_SpecialCoverage_Polygons', "1 = 1"]
       ]
coverageFieldName = "UTProvCode"
providerTableName = "UBBMAP.UBBADMIN.BB_Providers_Table"
providerTableFieldName = "Code"
coverageProviders = [] # list to hold all providers in coverage data
tableProviders = [] # list of all providers in providers table
nonNullFields = [
                 '"' + coverageFieldName + '" IS NULL OR "' + coverageFieldName + '" = \'\'',
                 '"MAXADUP" IS NULL OR "MAXADUP" = \'\'',
                 '"MAXADDOWN" IS NULL OR "MAXADDOWN" = \'\'',
                 '"TRANSTECH" IS NULL OR "TRANSTECH" = 0'
                 ]
errors = []
mapServices = [
               'Broadband/ProviderCoverage',
               'Broadband/ProviderCoverageCached',
               'Broadband/Basemaps'
               ]
cai = r'UBBMAP.UBBADMIN.BB_Service_CAInstitutions'

try:
    logger.logMsg('setting workspace to sde database')
    arcpy.env.workspace = pathToSDE
    
    # loop through coverage feature classes
    logger.logMsg('Looping through polygon feature classes')
    for fc in fcs:
        logger.logMsg(fc[0])
        
        logger.logMsg("checking non-null fields")
        
        # create layer for selecting
        logger.logMsg('creating layer')
        layerName = fc[0] + 'Layer'
        arcpy.MakeFeatureLayer_management(fc[0], layerName, fc[1]);
        logger.logGPMsg()
        
        # loop through fields
        for query in nonNullFields:
            logger.logMsg('query: ' + query)
            arcpy.SelectLayerByAttribute_management(layerName, 'NEW_SELECTION', query)
            logger.logGPMsg()
            cnt = arcpy.GetCount_management(layerName)
            logger.logGPMsg()
            
            if int(str(cnt)) > 0:
                errors.append('ERROR: null or empty values found in ' + fc[0] + ':' + query)
        
        # get search cursor
        logger.logMsg("building list of providers in coverage feature class")
        cur = arcpy.SearchCursor(fc[0], fc[1], "", coverageFieldName)
        row = cur.next()
        while row:
            code = row.getValue(coverageFieldName)
            
            # add to list of providers
            if not [code, fc[0]] in coverageProviders:
                coverageProviders.append([code, fc[0]])

            row = cur.next()
        
        logger.logMsg("Finished with " + fc[0])
    
    # get cursor for provider table
    logger.logMsg("building list of providers in providers table")
    prows = arcpy.SearchCursor(providerTableName, "Exclude IS NULL")
    row = prows.next()
    while row:
        tableProviders.append(row.getValue(providerTableFieldName))

        row = prows.next()
    
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
