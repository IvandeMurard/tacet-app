import requests
import json
from datetime import datetime

# OpenData Paris - Chantiers Perturbants (Disruptive Construction Sites)
# Using the v2.1 ODS API
API_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-perturbants/records"

def fetch_active_permits(limit=10):
    """
    Fetches the most recent disruptive construction permits from OpenData Paris.
    In a real scenario, we would filter this by GPS bounding box around a hotel.
    """
    params = {
        "limit": limit
    }

    print(f"Fetching data from {API_URL}...")
    response = requests.get(API_URL, params=params)
    
    if response.status_code == 200:
        data = response.json()
        results = data.get("results", [])
        
        parsed_permits = []
        for permit in results:
            # Extract relevant fields for our Acoustic Engine
            parsed_permits.append({
                "id": permit.get("identifiant"),
                "description": permit.get("objet"),
                "start_date": permit.get("date_debut_chantier"),
                "end_date": permit.get("date_fin_chantier"),
                "impact_level": permit.get("niveau_perturbation"),
                "address": f"{permit.get('numero')} {permit.get('voie')}, {permit.get('cp')} Paris",
                "coordinates": permit.get("geo_point_2d") # {lon, lat}
            })
            
        return parsed_permits
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

if __name__ == "__main__":
    print("--- Tacet V1: Ingestion Engine Test ---")
    permits = fetch_active_permits(limit=5)
    
    if permits:
        print(f"\nSuccessfully fetched {len(permits)} active construction sites.")
        print("Sample output payload to be sent to the Acoustic Engine:\n")
        print(json.dumps(permits, indent=2, ensure_ascii=False))
    else:
        print("Failed to fetch data.")
