'''
This is intended to be run via ArcGIS Desktop's python interpreter; Pro can't run ManageMapServerCacheTiles as of 2.0.
'''
import arcpy
from sys import argv

scales = [float(s) for s in argv[2].split(';')]
arcpy.ManageMapServerCacheTiles_server(argv[1], argv[2], argv[3], argv[4])
