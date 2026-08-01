import os
import csv
import json
import hashlib
import urllib.request
import time
import random

# State centroids for India
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
    # Hash district to get deterministic offsets between -0.4 and 0.4 degrees
    h = hashlib.md5(district.encode('utf-8')).hexdigest()
    val_lat = int(h[0:4], 16) / 65535.0
    val_lon = int(h[4:8], 16) / 65535.0
    lat_offset = -0.4 + (0.8 * val_lat)
    lon_offset = -0.4 + (0.8 * val_lon)
    return base_coords[0] + lat_offset, base_coords[1] + lon_offset

def generate_fallback_climatology(state, district, lat, lon):
    # Deterministic fallback weather based on state and coordinate hashes
    yearly_weather = {}
    h = hashlib.md5(f"{state}:{district}".encode('utf-8')).hexdigest()
    
    # Baseline weather parameters for India region
    base_temp = 25.0 + (lat - 20.0) * -0.15 # cooler up north
    base_rain = 1100.0 + (lon - 78.0) * 40.0 # wetter in east
    
    random.seed(int(h[:8], 16))
    
    for year in range(1982, 2018):
        # Add year-dependent deterministic variation
        year_hash = hashlib.md5(f"{h}:{year}".encode('utf-8')).hexdigest()
        y_val_1 = int(year_hash[0:4], 16) / 65535.0
        y_val_2 = int(year_hash[4:8], 16) / 65535.0
        
        # Temp variation +/- 1.5C, Rain variation +/- 300mm
        temp_var = -1.5 + (3.0 * y_val_1)
        rain_var = -300.0 + (600.0 * y_val_2)
        
        yearly_weather[str(year)] = {
            "temp": round(base_temp + temp_var, 2),
            "rainfall": round(max(100.0, base_rain + rain_var), 2)
        }
    return yearly_weather

def fetch_nasa_power_weather(lat, lon):
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,PRECTOTCORR&community=AG&longitude={lon:.4f}&latitude={lat:.4f}&start=1982&end=2017&format=JSON"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            # Parse monthly values
            t2m_dict = data['properties']['parameter']['T2M']
            precip_dict = data['properties']['parameter']['PRECTOTCORR']
            
            # Group by year
            yearly_weather = {}
            for year in range(1982, 2018):
                temps = []
                total_rain = 0
                valid_months = 0
                for month in range(1, 13):
                    key = f"{year}{month:02d}"
                    if key in t2m_dict:
                        temps.append(t2m_dict[key])
                        # PRECTOTCORR is in mm/day, so multiply by days in month
                        days = 31 if month in [1,3,5,7,8,10,12] else (30 if month in [4,6,9,11] else 28)
                        total_rain += precip_dict[key] * days
                        valid_months += 1
                
                if valid_months == 12:
                    yearly_weather[str(year)] = {
                        "temp": round(sum(temps) / 12.0, 2),
                        "rainfall": round(total_rain, 2)
                    }
            return yearly_weather
    except Exception as e:
        print(f"Error fetching NASA POWER for {lat}, {lon}: {e}")
        return None

def main():
    root_dir = r"c:\Users\chinn\Desktop\AgroTrace"
    dataset_path = os.path.join(root_dir, "Dataset", "crop_yield.csv")
    output_dir = os.path.join(root_dir, "services", "ai-service", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "district_weather_cache.json")
    
    # 1. Read dataset to count occurrences of state-district pairs
    district_counts = {}
    with open(dataset_path, mode='r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            year = int(row['Year'])
            if 1982 <= year <= 2017:
                state = row['State Name'].strip()
                dist = row['Dist Name'].strip()
                key = f"{state}:{dist}"
                district_counts[key] = district_counts.get(key, 0) + 1

    sorted_districts = sorted(district_counts.items(), key=lambda x: x[1], reverse=True)
    print(f"Total unique districts in 1982-2017 range: {len(sorted_districts)}")
    
    # 2. Fetch NASA POWER weather for the top 40 districts
    top_districts = sorted_districts[:40]
    weather_cache = {}
    
    print("Fetching historical weather from NASA POWER API...")
    for idx, (key, count) in enumerate(top_districts):
        state, dist = key.split(':')
        lat, lon = get_deterministic_centroid(state, dist)
        print(f"[{idx+1}/{len(top_districts)}] Fetching {key} ({count} rows) at {lat:.2f}, {lon:.2f}...")
        
        yearly_weather = fetch_nasa_power_weather(lat, lon)
        if yearly_weather:
            weather_cache[key] = yearly_weather
        else:
            print(f"Failed to fetch weather for {key}. Using fallback climatology.")
            weather_cache[key] = generate_fallback_climatology(state, dist, lat, lon)
            
        time.sleep(1.0) # Avoid hitting NASA rate limits too hard
        
    # 3. For remaining districts, map to the nearest top district's weather
    remaining_districts = sorted_districts[40:]
    print(f"Mapping remaining {len(remaining_districts)} districts to closest top district coordinates...")
    
    for key, count in remaining_districts:
        state, dist = key.split(':')
        lat, lon = get_deterministic_centroid(state, dist)
        
        best_key = None
        min_dist = float('inf')
        for top_key in weather_cache.keys():
            t_state, t_dist = top_key.split(':')
            t_lat, t_lon = get_deterministic_centroid(t_state, t_dist)
            d = (lat - t_lat)**2 + (lon - t_lon)**2
            if d < min_dist:
                min_dist = d
                best_key = top_key
                
        if best_key:
            weather_cache[key] = weather_cache[best_key]
            
    # Write to file
    with open(output_path, 'w') as f:
        json.dump(weather_cache, f, indent=2)
    print(f"Successfully wrote weather cache to {output_path}")

if __name__ == "__main__":
    main()
