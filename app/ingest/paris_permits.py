import requests
import json
from datetime import datetime

# OpenData Paris - Chantiers Perturbants (Disruptive Construction Sites)
# Using the v2.1 ODS API
API_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-perturbants/records"

def fetch_active_permits(limit: int = 100, target_start: str = None, target_end: str = None):
    """
    Fetches disruptive construction permits. If target dates are provided, 
    filters permits to only those that overlap with the targeted forecast window.
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
        
        # Parse target dates if provided (assuming YYYY-MM-DD)
        t_start = datetime.strptime(target_start[:10], "%Y-%m-%d") if target_start else None
        t_end = datetime.strptime(target_end[:10], "%Y-%m-%d") if target_end else None

        for permit in results:
            start_str = permit.get("date_debut_chantier")
            end_str = permit.get("date_fin_chantier")
            
            # Predictive filtering
            if t_start and t_end and start_str and end_str:
                try:
                    p_start = datetime.strptime(start_str[:10], "%Y-%m-%d")
                    p_end = datetime.strptime(end_str[:10], "%Y-%m-%d")
                    # Check for overlap: permit starts before target ends AND permit ends after target starts
                    if not (p_start <= t_end and p_end >= t_start):
                        continue # Skip this permit, no overlap
                except ValueError:
                    continue # Skip if dates are malformed

            # Extract relevant fields for our Acoustic Engine
            parsed_permits.append({
                "id": permit.get("identifiant"),
                "description": permit.get("objet"),
                "start_date": start_str,
                "end_date": end_str,
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
