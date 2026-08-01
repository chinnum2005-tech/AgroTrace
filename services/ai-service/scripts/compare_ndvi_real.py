import sys
import os
import csv
import json
import random
import hashlib
import urllib.request
import urllib.parse
import io
import math
import numpy as np
from PIL import Image
from sklearn.metrics import r2_score

# Add services/ai-service to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from models.yield_predictor import YieldPredictor

# State centroids for India coordinate lookup
STATE_CENTROIDS = {
    "Andhra Pradesh": (15.91, 79.74),
    "Arunachal Pradesh": (28.21, 94.72),
    "Assam": (26.20, 92.93),
    "Bihar": (25.09, 85.31),
    "Chhattisgarh": (21.27, 81.86),
    "Goa": (15.29, 74.12),
    "Gujarat": (22.25, 71.19),
    "Haryana": (29.05, 76.08),
    "Himachal Pradesh": (31.10, 77.17),
    "Jharkhand": (23.61, 85.27),
    "Karnataka": (15.31, 75.71),
    "Kerala": (10.85, 76.27),
    "Madhya Pradesh": (22.97, 78.65),
    "Maharashtra": (19.75, 75.71),
    "Manipur": (24.66, 93.90),
    "Meghalaya": (25.46, 91.36),
    "Mizoram": (23.16, 92.93),
    "Nagaland": (26.15, 94.56),
    "Odisha": (20.95, 85.09),
    "Punjab": (31.14, 75.34),
    "Rajasthan": (27.02, 74.21),
    "Sikkim": (27.53, 88.51),
    "Tamil Nadu": (11.12, 78.65),
    "Telangana": (18.11, 79.01),
    "Tripura": (23.94, 91.98),
    "Uttarakhand": (30.06, 79.01),
    "Uttar Pradesh": (26.84, 80.88),
    "West Bengal": (22.98, 87.85)
}

def get_deterministic_centroid(state, district):
    base_coords = STATE_CENTROIDS.get(state, (20.59, 78.96))
    h = hashlib.md5(district.encode('utf-8')).hexdigest()
    val_lat = int(h[0:4], 16) / 65535.0
    val_lon = int(h[4:8], 16) / 65535.0
    lat_offset = -0.4 + (0.8 * val_lat)
    lon_offset = -0.4 + (0.8 * val_lon)
    return base_coords[0] + lat_offset, base_coords[1] + lon_offset

def get_token():
    client_id = "129b495a-932f-47e5-8084-4ef1431ce98c"
    client_secret = "TsliPlMLaXaCnwfMDYQFGW2JGseFR9im"
    url = "https://services.sentinel-hub.com/oauth/token"
    data = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))["access_token"]

def fetch_real_ndvi(token, lat, lon, year, crop_type):
    # Determine target month based on crop growing seasons in India
    # Rabi crops (Wheat, Barley, Oats) are active in Spring (March)
    # Kharif crops (Rice, Maize/Corn, Soybeans) are active in Fall (September)
    if crop_type in ["WHEAT", "BARLEY", "OATS"]:
        target_month = 3
    else:
        target_month = 9
        
    start_date = f"{year}-{target_month:02d}-05"
    end_date = f"{year}-{target_month:02d}-25"
    
    # 1. Search Catalog for clearest scene
    catalog_url = "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search"
    bbox = [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01]
    
    catalog_body = {
        "bbox": bbox,
        "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        "collections": ["sentinel-2-l2a"],
        "limit": 10
    }
    
    req_cat = urllib.request.Request(
        catalog_url,
        data=json.dumps(catalog_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_cat) as res:
            cat_data = json.loads(res.read().decode("utf-8"))
            features = cat_data.get("features", [])
            if not features:
                return 0.5, 0.0 # Default if no imagery
                
            # Sort by cloud cover to find clearest scene
            features = sorted(features, key=lambda f: f["properties"].get("eo:cloud_cover", 100.0))
            best_feat = features[0]
            cloud_cover = best_feat["properties"].get("eo:cloud_cover", 0.0)
            best_date = best_feat["properties"]["datetime"].split("T")[0]
    except Exception as e:
        print(f"Catalog error for lat={lat}, lon={lon}: {e}")
        return 0.5, 0.0

    # 2. Call Process API to compute average NDVI for the clear date
    process_url = "https://services.sentinel-hub.com/api/v1/process"
    evalscript = """//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08"] }],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  return [ndvi];
}
"""
    process_body = {
        "input": {
            "bounds": {
                "bbox": bbox,
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                }
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{best_date}T00:00:00Z",
                            "to": f"{best_date}T23:59:59Z"
                        }
                    }
                }
            ]
        },
        "output": {
            "width": 16,
            "height": 16,
            "responses": [
                {
                    "identifier": "default",
                    "format": {
                        "type": "image/tiff"
                    }
                }
            ]
        },
        "evalscript": evalscript
    }
    
    req_proc = urllib.request.Request(
        process_url,
        data=json.dumps(process_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "image/tiff"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_proc) as res:
            tiff_bytes = res.read()
            img = Image.open(io.BytesIO(tiff_bytes))
            arr = np.array(img)
            valid_arr = arr[~np.isnan(arr) & (arr >= -1.0) & (arr <= 1.0)]
            if len(valid_arr) == 0:
                return 0.5, cloud_cover
            return float(np.mean(valid_arr)), cloud_cover
    except Exception as e:
        # Fallback to simulated logic if Process API fails
        return 0.5, cloud_cover

def main():
    print("Initializing YieldPredictor...")
    predictor = YieldPredictor()
    
    # Load dataset
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Dataset", "crop_yield.csv"))
    cache_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "district_weather_cache.json"))
    
    with open(cache_path, 'r') as f:
        weather_cache = json.load(f)
        
    overlap_rows = []
    with open(dataset_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            year_str = row['Year'].strip()
            year = int(year_str)
            if year in [2015, 2016, 2017]:
                state = row['State Name'].strip()
                dist = row['Dist Name'].strip()
                key = f"{state}:{dist}"
                if key in weather_cache and year_str in weather_cache[key]:
                    overlap_rows.append(row)
                    
    print(f"Total overlap rows: {len(overlap_rows)}")
    
    # Take a random sample of 60 rows for statistical comparison
    random.seed(42)
    sample_rows = random.sample(overlap_rows, 60)
    
    token = get_token()
    print("Obtained Sentinel Hub OAuth token. Fetching real NDVI readings...")
    
    y_actual = []
    preds_base = []
    preds_sim_fusion = []
    preds_real_fusion = []
    
    for idx, row in enumerate(sample_rows):
        state = row['State Name'].strip()
        dist = row['Dist Name'].strip()
        year = int(row['Year'])
        crop_name = row['Crop'].strip()
        crop_type = predictor._map_crop_type(crop_name)
        area = float(row['Area_ha'])
        actual_yield = float(row['Yield_kg_per_ha'])
        
        lat, lon = get_deterministic_centroid(state, dist)
        
        weather_info = weather_cache[f"{state}:{dist}"][str(year)]
        temp = float(weather_info['temp'])
        rainfall = float(weather_info['rainfall'])
        humidity = float(row['Humidity_%'])
        ph = float(row['pH'])
        
        # Call Sentinel Hub Process API for real NDVI
        real_ndvi, cloud_cover = fetch_real_ndvi(token, lat, lon, year, crop_type)
        
        # Calculate simulated NDVI using the exact training formula
        base_ndvi = (
            0.4 + 
            0.3 * min(1.0, rainfall / 1500.0) + 
            0.1 * (1.0 - abs(ph - 6.5) / 2.0) + 
            0.1 * math.cos((temp - 25.0) / 10.0)
        )
        sim_ndvi = base_ndvi + random.normalvariate(0, 0.05)
        sim_ndvi = max(-1.0, min(1.0, sim_ndvi))
        
        # Soil features dictionary
        soil_dict = {"ph_level": ph, "nitrogen": 50.0, "phosphorus": 30.0, "potassium": 40.0}
        weather_dict = {"temperature": temp, "rainfall": rainfall, "humidity": humidity}
        
        # Base Model Predict
        res_base = predictor.predict(crop_type, area, None, weather_dict, soil_dict, ndvi_score=None)
        
        # Simulated NDVI Fusion Predict
        res_sim = predictor.predict(crop_type, area, None, weather_dict, soil_dict, ndvi_score=sim_ndvi, ndvi_provider="simulated")
        
        # Real NDVI Fusion Predict
        res_real = predictor.predict(crop_type, area, None, weather_dict, soil_dict, ndvi_score=real_ndvi, ndvi_provider="sentinel-2")
        
        y_actual.append(actual_yield)
        preds_base.append(res_base["yield"])
        preds_sim_fusion.append(res_sim["yield"])
        preds_real_fusion.append(res_real["yield"])
        
        print(f"[{idx+1}/60] {crop_type} in {dist}, {state} ({year}): Actual={actual_yield:.1f} | Base={res_base['yield']:.1f} | SimFusion={res_sim['yield']:.1f} (NDVI={sim_ndvi:.2f}) | RealFusion={res_real['yield']:.1f} (NDVI={real_ndvi:.2f}, cloud={cloud_cover:.1f}%)")
        
    y_actual = np.array(y_actual)
    preds_base = np.array(preds_base)
    preds_sim_fusion = np.array(preds_sim_fusion)
    preds_real_fusion = np.array(preds_real_fusion)
    
    r2_b = r2_score(y_actual, preds_base)
    r2_sf = r2_score(y_actual, preds_sim_fusion)
    r2_rf = r2_score(y_actual, preds_real_fusion)
    
    print("\n=============================================")
    print("NDVI FUSION HYPOTHESIS EVALUATION RESULTS")
    print("=============================================")
    print(f"Evaluation Sample Size: {len(y_actual)} fields (2015-2017 crop season)")
    print(f"1. Base Model R^2 (No NDVI):                 {r2_b:.4f}")
    print(f"2. Fusion Model R^2 (Simulated Proxy NDVI): {r2_sf:.4f}")
    print(f"3. Fusion Model R^2 (Real Sentinel-2 NDVI):  {r2_rf:.4f}")
    print("=============================================")
    
    # Save results to a output JSON
    results = {
        "sample_size": len(y_actual),
        "r2_base": r2_b,
        "r2_sim_fusion": r2_sf,
        "r2_real_fusion": r2_rf
    }
    output_report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "real_ndvi_evaluation.json"))
    with open(output_report_path, 'w') as rf:
        json.dump(results, rf, indent=2)
    print(f"Results written to {output_report_path}")

if __name__ == "__main__":
    main()
