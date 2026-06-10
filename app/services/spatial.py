import osmnx as ox
import pandas as pd
from shapely.geometry import Polygon

def get_surrounding_buildings(lat: float, lon: float, radius: int = 500) -> list[dict]:
    """
    Fetches 3D building geometries from OpenStreetMap within a given radius.
    Returns a list of dictionaries containing Shapely Polygons and estimated heights.
    """
    try:
        # Define the tags we want to query (all buildings)
        tags = {'building': True}
        
        # Suppress osmnx logging noise
        ox.settings.log_console = False
        
        # Download data
        gdf = ox.features_from_point((lat, lon), tags, dist=radius)
        
        if gdf.empty:
            return []
            
        buildings = []
        
        # Iterate through the GeoDataFrame
        for _, row in gdf.iterrows():
            geom = row.geometry
            
            # We only care about explicit building footprints (Polygons), not points
            if not isinstance(geom, Polygon):
                continue
                
            height = None
            
            # 1. Attempt to extract explicit height tag
            if 'height' in row and pd.notna(row['height']):
                try:
                    # Clean the string (e.g., "15 m" -> "15")
                    height_str = str(row['height']).lower().replace('m', '').replace(',', '.').strip()
                    height = float(height_str)
                except ValueError:
                    pass
            
            # 2. Fallback to building:levels tag (assume 3.5m per floor)
            if height is None and 'building:levels' in row and pd.notna(row['building:levels']):
                try:
                    levels_str = str(row['building:levels']).split(';')[0] # Sometimes stored as "5;6"
                    levels = float(levels_str)
                    height = levels * 3.5
                except ValueError:
                    pass
                    
            # 3. Parisian Fallback (5 stories)
            if height is None:
                height = 5 * 3.5  # 17.5 meters
                
            buildings.append({
                "polygon": geom,
                "height_meters": height
            })
            
        return buildings

    except Exception as e:
        print(f"Error fetching spatial data from OSM: {e}")
        return []
