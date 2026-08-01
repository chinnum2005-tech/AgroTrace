import sys
import os
import csv
import json
import numpy as np
import scipy.stats as stats
from sklearn.metrics import r2_score

# Add services/ai-service to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from models.yield_predictor import YieldPredictor

# Centroid coordinate mapping (copied from compare_ndvi_real.py)
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
    import hashlib
    base_coords = STATE_CENTROIDS.get(state, (20.59, 78.96))
    h = hashlib.md5(district.encode('utf-8')).hexdigest()
    val_lat = int(h[0:4], 16) / 65535.0
    val_lon = int(h[4:8], 16) / 65535.0
    lat_offset = -0.4 + (0.8 * val_lat)
    lon_offset = -0.4 + (0.8 * val_lon)
    return base_coords[0] + lat_offset, base_coords[1] + lon_offset

def main():
    print("Loading crop yield dataset and weather cache...")
    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Dataset", "crop_yield.csv"))
    cache_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "district_weather_cache.json"))
    
    with open(cache_path, 'r') as f:
        weather_cache = json.load(f)
        
    full_dataset = []
    overlap_subset = [] # 2015-2017 subset
    
    with open(dataset_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            year_str = row['Year'].strip()
            year = int(year_str)
            if not (1982 <= year <= 2017):
                continue
            state = row['State Name'].strip()
            dist = row['Dist Name'].strip()
            key = f"{state}:{dist}"
            
            # Record basic yield info
            y_val = float(row['Yield_kg_per_ha'])
            crop = row['Crop'].strip()
            
            record = {
                "year": year,
                "state": state,
                "district": dist,
                "crop": crop,
                "yield": y_val,
                "area": float(row['Area_ha']),
                "humidity": float(row['Humidity_%']),
                "ph": float(row['pH'])
            }
            
            if key in weather_cache and year_str in weather_cache[key]:
                full_dataset.append(record)
                if year in [2015, 2016, 2017]:
                    overlap_subset.append(record)
                    
    print(f"Full Dataset Size: {len(full_dataset)} records")
    print(f"2015-2017 Subset Size: {len(overlap_subset)} records")
    
    # 1. Compare dataset statistical characteristics (Explain baseline jump)
    yields_full = [r["yield"] for r in full_dataset]
    yields_sub = [r["yield"] for r in overlap_subset]
    
    mean_full, std_full = np.mean(yields_full), np.std(yields_full)
    mean_sub, std_sub = np.mean(yields_sub), np.std(yields_sub)
    
    # Compare Crop Distributions
    crops_full = {}
    for r in full_dataset:
        crops_full[r["crop"]] = crops_full.get(r["crop"], 0) + 1
    crops_sub = {}
    for r in overlap_subset:
        crops_sub[r["crop"]] = crops_sub.get(r["crop"], 0) + 1
        
    # Compare Area/Size of Farms
    areas_full = [r["area"] for r in full_dataset]
    areas_sub = [r["area"] for r in overlap_subset]
    
    print("\n-------------------------------------------------------------")
    print("1. DATASET COMPARISON AND STATISTICAL CHARACTERISTICS")
    print("-------------------------------------------------------------")
    print(f"Metric                 | Full Dataset (1982-2017) | 2015-2017 Subset")
    print(f"-------------------------------------------------------------")
    print(f"Row Count              | {len(full_dataset):<24} | {len(overlap_subset)}")
    print(f"Mean Yield (kg/ha)     | {mean_full:<24.2f} | {mean_sub:.2f}")
    print(f"Std Dev Yield (kg/ha)  | {std_full:<24.2f} | {std_sub:.2f}")
    print(f"Coefficient of Var     | {std_full/mean_full:<24.4f} | {std_sub/mean_sub:.4f}")
    print(f"Mean Farm Area (ha)    | {np.mean(areas_full):<24.2f} | {np.mean(areas_sub):.2f}")
    
    # 2. Run statistical evaluation on 60-field sample
    print("\nLoading models and calculating paired error statistics on sample...")
    predictor = YieldPredictor()
    import compare_ndvi_real as ndvi_eval
    
    # Re-fetch or simulate the 60 sample fields identical to the run
    import random
    random.seed(42)
    sample_records = random.sample(overlap_subset, 60)
    
    token = ndvi_eval.get_token()
    
    y_actual = []
    errors_base = []
    errors_real_fusion = []
    
    for idx, r in enumerate(sample_records):
        state = r['state']
        dist = r['district']
        year = r['year']
        crop_name = r['crop']
        crop_type = predictor._map_crop_type(crop_name)
        area = r['area']
        actual_yield = r['yield']
        
        lat, lon = get_deterministic_centroid(state, dist)
        weather_info = weather_cache[f"{state}:{dist}"][str(year)]
        temp = float(weather_info['temp'])
        rainfall = float(weather_info['rainfall'])
        humidity = r['humidity']
        ph = r['ph']
        
        # Get real NDVI
        real_ndvi, _ = ndvi_eval.fetch_real_ndvi(token, lat, lon, year, crop_type)
        
        soil_dict = {"ph_level": ph, "nitrogen": 50.0, "phosphorus": 30.0, "potassium": 40.0}
        weather_dict = {"temperature": temp, "rainfall": rainfall, "humidity": humidity}
        
        # Predict Base vs Real Fusion
        res_base = predictor.predict(crop_type, area, None, weather_dict, soil_dict, ndvi_score=None)
        res_real = predictor.predict(crop_type, area, None, weather_dict, soil_dict, ndvi_score=real_ndvi, ndvi_provider="sentinel-2")
        
        # Absolute Errors and Squared Errors
        err_b_sq = (actual_yield - res_base["yield"]) ** 2
        err_r_sq = (actual_yield - res_real["yield"]) ** 2
        
        y_actual.append(actual_yield)
        errors_base.append(err_b_sq)
        errors_real_fusion.append(err_r_sq)
        
    y_actual = np.array(y_actual)
    errors_base = np.array(errors_base)
    errors_real_fusion = np.array(errors_real_fusion)
    
    # Paired Student's t-test
    t_stat_sq, p_val_sq = stats.ttest_rel(errors_base, errors_real_fusion)
    
    # Wilcoxon signed-rank test (non-parametric, robust to non-normal errors)
    wilcox_stat, wilcox_p = stats.wilcoxon(errors_base, errors_real_fusion, alternative='greater')
    
    # Bootstrap Confidence Interval for the difference in MSE (Mean Squared Error)
    bootstrap_diffs = []
    n_bootstraps = 2000
    np.random.seed(42)
    for _ in range(n_bootstraps):
        indices = np.random.choice(len(errors_base), size=len(errors_base), replace=True)
        mse_b = np.mean(errors_base[indices])
        mse_r = np.mean(errors_real_fusion[indices])
        bootstrap_diffs.append(mse_b - mse_r)
        
    ci_lower = np.percentile(bootstrap_diffs, 2.5)
    ci_upper = np.percentile(bootstrap_diffs, 97.5)
    
    print("\n-------------------------------------------------------------")
    print("2. HYPOTHESIS TESTING AND SIGNIFICANCE RESULTS")
    print("-------------------------------------------------------------")
    print(f"Sample Size (n)             | {len(y_actual)}")
    print(f"Mean Squared Error (Base)   | {np.mean(errors_base):.2f}")
    print(f"Mean Squared Error (Real)   | {np.mean(errors_real_fusion):.2f}")
    print(f"MSE Reduction               | {np.mean(errors_base) - np.mean(errors_real_fusion):.2f} ({(np.mean(errors_base) - np.mean(errors_real_fusion))/np.mean(errors_base)*100:.2f}%)")
    print(f"-------------------------------------------------------------")
    print(f"Paired t-test t-statistic   | {t_stat_sq:.4f}")
    print(f"Paired t-test p-value       | {p_val_sq:.6f} (one-tailed: {p_val_sq/2:.6f})")
    print(f"Wilcoxon signed-rank p-value| {wilcox_p:.6f}")
    print(f"95% Bootstrap CI (Base-Real)| [{ci_lower:.2f}, {ci_upper:.2f}]")
    print("-------------------------------------------------------------")
    
    # Write report back to JSON
    report = {
        "dataset_analysis": {
            "full": {"size": len(full_dataset), "mean": mean_full, "std": std_full, "cv": std_full/mean_full},
            "subset": {"size": len(overlap_subset), "mean": mean_sub, "std": std_sub, "cv": std_sub/mean_sub}
        },
        "significance_test": {
            "n": len(y_actual),
            "mse_base": float(np.mean(errors_base)),
            "mse_real": float(np.mean(errors_real_fusion)),
            "t_stat": t_stat_sq,
            "p_value_t": p_val_sq,
            "p_value_wilcox": wilcox_p,
            "ci_95": [ci_lower, ci_upper]
        }
    }
    
    report_output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "statistical_significance_report.json"))
    with open(report_output_path, 'w') as rf:
        json.dump(report, rf, indent=2)
    print(f"Statistical report successfully written to {report_output_path}")

if __name__ == "__main__":
    main()
