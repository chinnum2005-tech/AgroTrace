import pandas as pd
import numpy as np
import random
import joblib
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import os

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

# Configuration
NUM_SAMPLES = 5000
OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(OUTPUT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Agronomic Baselines
# Crop Types and their baseline expected yields in kg per hectare
CROP_BASE_YIELD = {
    'RICE': 4000,
    'WHEAT': 3200,
    'MAIZE': 6000,
    'COTTON': 1500,
    'SUGARCANE': 70000,
    'PULSES': 900
}

# Crop typical growing duration in days
CROP_DURATION = {
    'RICE': 120,
    'WHEAT': 140,
    'MAIZE': 110,
    'COTTON': 150,
    'SUGARCANE': 365,
    'PULSES': 90
}

# 2. Generate Data
data = []
crop_types = list(CROP_BASE_YIELD.keys())

for _ in range(NUM_SAMPLES):
    crop_type = random.choice(crop_types)
    base_yield_per_ha = CROP_BASE_YIELD[crop_type]
    
    # Area (0.5 to 10 hectares)
    area_hectares = round(random.uniform(0.5, 10.0), 2)
    
    # Days since sowing (randomly pick a stage in the crop's lifecycle)
    days_since_sowing = random.randint(10, CROP_DURATION[crop_type])
    
    # NDVI Trend (simulated historical average)
    health_state = random.choices(['HEALTHY', 'STRESSED', 'CRITICAL'], weights=[0.6, 0.3, 0.1])[0]
    
    # Growth-stage based NDVI generation
    def generate_ndvi(days, state):
        if days <= 5:
            base = random.uniform(0.05, 0.20)
        elif days <= 30:
            base = random.uniform(0.20, 0.50)
        elif days <= 70:
            base = random.uniform(0.50, 0.80)
        else:
            base = random.uniform(0.75, 0.90)
            
        if state == 'STRESSED':
            return base * 0.8
        elif state == 'CRITICAL':
            return base * 0.5
        return base

    ndvi_trend = generate_ndvi(days_since_sowing, health_state)
    
    # Modifier for yield calculation
    if health_state == 'HEALTHY':
        ndvi_modifier = 1.1 
    elif health_state == 'STRESSED':
        ndvi_modifier = 0.8 
    else:
        ndvi_modifier = 0.4

    # Weather (Cumulative rainfall, Avg Temp)
    # Different crops have different optimal rainfall/temp, but we'll use a simplified generic modifier
    avg_temp = round(random.uniform(15.0, 35.0), 1)
    cum_rainfall = round(random.uniform(50.0, 800.0), 1)
    
    # Extreme temps penalty
    temp_modifier = 1.0
    if avg_temp > 32:
        temp_modifier = 0.85
    elif avg_temp < 18:
        temp_modifier = 0.90
        
    # Drought penalty
    rain_modifier = 1.0
    if cum_rainfall < 150:
        rain_modifier = 0.7
    
    # Calculate Final Yield
    expected_yield_kg = base_yield_per_ha * area_hectares
    actual_yield_kg = expected_yield_kg * ndvi_modifier * temp_modifier * rain_modifier
    
    # Add some random noise (+/- 5%)
    noise = random.uniform(0.95, 1.05)
    actual_yield_kg = round(actual_yield_kg * noise, 2)
    
    data.append({
        'crop_type': crop_type,
        'area_hectares': area_hectares,
        'days_since_sowing': days_since_sowing,
        'ndvi_trend': round(ndvi_trend, 3),
        'avg_temp': avg_temp,
        'cum_rainfall': cum_rainfall,
        'yield_kg': actual_yield_kg
    })

df = pd.DataFrame(data)
csv_path = os.path.join(OUTPUT_DIR, "scripts", "synthetic_yield_data.csv")
df.to_csv(csv_path, index=False)
print(f"Generated {NUM_SAMPLES} synthetic records at {csv_path}")

# 3. Train LightGBM Model
# Convert categorical crop_type to category for LightGBM
df['crop_type'] = df['crop_type'].astype('category')

X = df.drop('yield_kg', axis=1)
y = df['yield_kg']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LGBMRegressor(
    n_estimators=100,
    learning_rate=0.1,
    random_state=42,
    verbose=-1 # Suppress warnings
)

print("Training LightGBM model...")
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)]
)

preds = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, preds))
print(f"Overall Model trained! Overall RMSE: {rmse:.2f} kg\n")

# Calculate metrics per crop type
print("Per-Crop Type Evaluation (Test Set):")
results_df = X_test.copy()
results_df['actual'] = y_test
results_df['predicted'] = preds

for crop in sorted(results_df['crop_type'].unique()):
    crop_data = results_df[results_df['crop_type'] == crop]
    if len(crop_data) == 0:
        continue
    
    crop_rmse = np.sqrt(mean_squared_error(crop_data['actual'], crop_data['predicted']))
    # Calculate Mean Absolute Percentage Error (MAPE)
    # add small epsilon to avoid div by zero, though yields shouldn't be 0
    crop_mape = np.mean(np.abs((crop_data['actual'] - crop_data['predicted']) / (crop_data['actual'] + 1e-8))) * 100
    
    print(f" - {crop}: RMSE = {crop_rmse:.2f} kg | MAPE = {crop_mape:.2f}% (n={len(crop_data)})")

# Save the model
model_path = os.path.join(MODELS_DIR, "yield_model.pkl")
joblib.dump(model, model_path)
print(f"\nModel saved to {model_path}")
