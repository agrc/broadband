# Generate County PDFs
# Generates broadband related pdf maps by county.
# Scott Davis/Christy Heaton 3-14-11

# import modules
import arcpy.mapping, os

# variables
baseFolder = os.getcwd() # current working directory
outputFolder = baseFolder + r'\PDFs'
countyData = r'I:\PROJECTS\Broadband\DataDrivenPages\DataDrivenPages.gdb\SGIDCounties'
#countyData = r'C:\PythonScripts\BroadbandPDFs\DataDrivenPages.gdb\SGIDCounties'
countyLyr = 'countyLyr'

# create county layer to use for checking for no data
arcpy.MakeFeatureLayer_management(countyData, countyLyr);

# clear out old pdfs
print '\nDeleting old PDFs...'
oldPDFs = os.listdir(outputFolder)
for f in oldPDFs:
    os.remove(outputFolder + '\\' + f)

# get list of all files in the folder
print '\nGetting list of mxds...'
allItems = os.listdir(baseFolder)

# filter out just .mxd's
mxdFileNames = [(x) for x in allItems if x.endswith('.mxd')]
mxdFileNames.sort()

# loop through mxds
for name in mxdFileNames:
    print '\nProcessing: ' + name
    
    # get mxd
    mxd = arcpy.mapping.MapDocument(baseFolder + '\\' + name)
    
    # get datadrivenpages object
    ddp = mxd.dataDrivenPages
    
    # loop through pages
    pg = 1
    while pg <= ddp.pageCount:
        # change current page
        ddp.currentPageID = pg
        
        # get name of current page
        name = ddp.pageRow.getValue('NAME')
        print '\n' + name
        
        # check for no data
        print 'checking for no data...'
        
        # select current county
        arcpy.SelectLayerByAttribute_management(countyLyr, 'NEW_SELECTION', '"NAME" = \'' + name + '\'')
        
        # find CAI data layer
        caiLyr = None
        try:
            caiLyr = arcpy.mapping.ListLayers(mxd, 'Maximum Download Speeds')[0]
        except:
            print 'No Maximum Download Speeds layer found. Skipping No Data stuff'
        
        if caiLyr is not None:
            # intersect selections
            arcpy.SelectLayerByLocation_management(caiLyr, 'INTERSECT', countyLyr, '#', 'NEW_SELECTION')
            
            # count
            count = arcpy.GetCount_management(caiLyr)
            
            # clear selection
            arcpy.SelectLayerByAttribute_management(caiLyr, 'CLEAR_SELECTION')
            
            element = None
            
            # remove text if appropriate
            if int(str(count)) > 0:
                print 'Data found.'
                
                try:
                    # find text element
                    element = arcpy.mapping.ListLayoutElements(mxd, 'TEXT_ELEMENT', 'NO_DATA')[0]
                    
                    # save text for future
                    text = element.text
                    
                    # remove text
                    element.text = ''
                except:
                    print 'No text element with NO_DATA as name found.'
                
            else:
                print 'No data found.'
                
        # check to see if there is already a pdf file created for this county
        pdfFile = outputFolder + '\\' + name + '.pdf' 
        if os.path.exists(pdfFile):
            print 'Existing pdf found. Appending...'
            
            # open PDF document
            pdf = arcpy.mapping.PDFDocumentOpen(pdfFile)
            
            # output to temporary file
            tempFile = outputFolder + '\\temp.pdf'
            ddp.exportToPDF(tempFile, 'CURRENT')
            
            # append to existing file
            pdf.appendPages(tempFile)
            
            # delete temp file
            os.remove(tempFile)
            
            # clean up variables
            del pdf
            
        else: # file does not exist, export to new file
            print 'No existing pdf found. Exporting to new pdf.'
            ddp.exportToPDF(pdfFile, 'CURRENT')
            
        # add text back in
        if element is not None:
            element.text = text
        
        # increment page number
        pg = pg + 1
        
    # clean up variables
    del mxd, ddp
    
raw_input('Done. Press any key to exit...')