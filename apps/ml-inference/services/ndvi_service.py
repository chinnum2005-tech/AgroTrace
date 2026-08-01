import math
import os
import random
from typing import Dict, Any

class SentinelHubMockClient:
    """
    Mock client that will be replaced with real Sentinel Hub API calls once credentials are provided.
    It simulates an NDVI fetch, returning a plausible score and cloud cover percentage.
    """
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    def get_ndvi(self, bbox: list, date_range: tuple) -> Dict[str, Any]:
        # Bbox is [min_lng, min_lat, max_lng, max_lat]
        # Simulate API delay
        # Return a synthetic NDVI score (healthy range ~0.6-0.8 for crops)
        return {
            "ndviScore": round(random.uniform(0.60, 0.85), 3),
            "cloudCoverPct": round(random.uniform(0.0, 10.0), 1),
            "source": "SIMULATED_MOCK",
            "satelliteId": "Sentinel-2"
        }

def get_ndvi_for_area(lat: float, lng: float, area_hectares: float) -> Dict[str, Any]:
    """
    Calculates a bounding box around a central point based on area,
    correcting for longitude distortion, and fetches NDVI data.
    """
    # Bounding Box Math with Latitude Correction
    area_sq_meters = area_hectares * 10000
    side_length = math.sqrt(area_sq_meters)
    radius_m = side_length / 2

    # 1 degree of latitude is roughly 111,320 meters everywhere
    meters_per_degree_lat = 111320
    
    # Longitude shrinks as we move away from the equator
    lat_radians = math.radians(lat)
    meters_per_degree_lng = 111320 * math.cos(lat_radians)

    lat_offset = radius_m / meters_per_degree_lat
    lng_offset = radius_m / meters_per_degree_lng

    min_lat = lat - lat_offset
    max_lat = lat + lat_offset
    min_lng = lng - lng_offset
    max_lng = lng + lng_offset

    bbox = [min_lng, min_lat, max_lng, max_lat]
    
    # In future, pull from secure secrets manager injected into env
    client_id = os.environ.get("SENTINEL_HUB_CLIENT_ID", "mock_id")
    client_secret = os.environ.get("SENTINEL_HUB_CLIENT_SECRET", "mock_secret")

    # If we have real credentials, we would use the real client here.
    # For now, we use the mock client to unblock development.
    client = SentinelHubMockClient(client_id, client_secret)
    
    # Fetch for last 5 days
    date_range = ("2023-01-01", "2023-01-05") # Placeholder range logic
    
    result = client.get_ndvi(bbox, date_range)
    
    return result
