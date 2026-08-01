import sys
import os

# Add parent directory to path so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.yield_service import predict_yield

print("=== End-to-End Verification: ML Service ===")

# Simulated payload from a 1-Acre crop planted today
payload = {
    "crop_type": "CORN",
    "area_hectares": 0.404686,
    "days_since_sowing": 1,
    "ndvi_trend": 0.15, # Baseline fallback
    "avg_temp": 28.5,
    "cum_rainfall": 150.0
}

print(f"\nPayload received by AI Router: {payload}")

print("\nExecuting predict_yield()... Check trace logs below:\n")

result = predict_yield(**payload)

print(f"\nSUCCESS: Prediction completed.")
print(f"Result Yield: {result['predicted_yield_kg']} kg")
print(f"Confidence: {result['confidence']}")
print(f"Message: {result['message']}")
