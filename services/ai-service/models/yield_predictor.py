import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from datetime import datetime


class YieldPredictor:
    """
    Crop yield prediction model using scikit-learn
    Uses Random Forest Regressor for predictions
    """
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        
        # Crop type mapping
        self.crop_types = [
            "WHEAT", "RICE", "CORN", "SOYBEANS", "BARLEY", 
            "OATS", "CANOLA", "SORGHUM", "OTHER"
        ]
        
        # Train the model with simulated data
        self._train_initial_model()
    
    def _train_initial_model(self):
        """Train the model with simulated historical data"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: crop_type_encoded, area, temperature, rainfall, humidity, ph_level, nitrogen, phosphorus, potassium
        X_train = np.random.rand(n_samples, 9)
        
        # Encode crop types
        crop_codes = np.random.randint(0, len(self.crop_types), n_samples)
        X_train[:, 0] = crop_codes
        
        # Simulate realistic feature ranges
        X_train[:, 1] *= 100  # Area (0-100 hectares)
        X_train[:, 2] = 15 + X_train[:, 2] * 20  # Temperature (15-35°C)
        X_train[:, 3] *= 1500  # Rainfall (0-1500mm)
        X_train[:, 4] = 40 + X_train[:, 4] * 50  # Humidity (40-90%)
        X_train[:, 5] = 5 + X_train[:, 5] * 3  # pH level (5-8)
        X_train[:, 6] *= 100  # Nitrogen (0-100)
        X_train[:, 7] *= 80   # Phosphorus (0-80)
        X_train[:, 8] *= 100  # Potassium (0-100)
        
        # Generate target variable (yield in kg/hectare)
        # Simplified formula: base_yield influenced by various factors
        y_train = (
            2000 +  # Base yield
            X_train[:, 2] * 50 +  # Temperature contribution
            X_train[:, 3] * 2 +   # Rainfall contribution
            X_train[:, 6] * 20 +  # Nitrogen contribution
            X_train[:, 7] * 15 +  # Phosphorus contribution
            np.random.normal(0, 500, n_samples)  # Random variation
        )
        
        # Ensure positive yields
        y_train = np.maximum(y_train, 0)
        
        # Train the model
        self.model.fit(X_train, y_train)
        self.is_trained = True
    
    def predict(self, crop_type: str, area: float, planting_date: datetime, 
                weather: dict, soil: dict) -> dict:
        """
        Predict crop yield
        
        Args:
            crop_type: Type of crop (e.g., "WHEAT", "RICE")
            area: Area in hectares
            planting_date: Planting date
            weather: Weather data dict
            soil: Soil data dict
            
        Returns:
            Dictionary with yield prediction and confidence
        """
        if not self.is_trained:
            raise Exception("Model not trained")
        
        # Encode crop type
        try:
            crop_code = self.crop_types.index(crop_type.upper())
        except ValueError:
            crop_code = len(self.crop_types) - 1  # Use "OTHER" category
        
        # Prepare features
        features = np.array([[
            crop_code,
            area,
            weather.get("temperature", 25),
            weather.get("rainfall", 800),
            weather.get("humidity", 65),
            soil.get("ph_level", 6.5),
            soil.get("nitrogen", 50),
            soil.get("phosphorus", 30),
            soil.get("potassium", 40),
        ]])
        
        # Make prediction
        predicted_yield = self.model.predict(features)[0]
        
        # Calculate confidence (simplified)
        # In production, this would use prediction intervals or ensemble variance
        confidence = min(0.95, max(0.6, 0.8 + np.random.normal(0, 0.1)))
        
        # Historical factor (simulated)
        historical_factor = 1.0 + np.random.normal(0, 0.1)
        
        return {
            "yield": float(predicted_yield),
            "confidence": float(confidence),
            "historical_factor": float(historical_factor)
        }
    
    def save_model(self, path: str):
        """Save the trained model to disk"""
        os.makedirs(path, exist_ok=True)
        model_path = os.path.join(path, "yield_predictor.joblib")
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")
    
    def load_model(self, path: str):
        """Load a trained model from disk"""
        model_path = os.path.join(path, "yield_predictor.joblib")
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.is_trained = True
            print(f"Model loaded from {model_path}")
        else:
            raise FileNotFoundError(f"No model found at {model_path}")
