import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import csv

class CropAdvisor:
    """
    Crop Recommendation Advisor using scikit-learn
    Trained on Crop_recommendation.csv (22 crops, 2,200 rows)
    """
    
    def __init__(self):
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.model_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        
        # Load or train model
        self._load_or_train()

    def _load_or_train(self):
        model_path = os.path.join(self.model_dir, "crop_advisor.joblib")
        encoder_path = os.path.join(self.model_dir, "crop_advisor_encoder.joblib")
        
        if os.path.exists(model_path) and os.path.exists(encoder_path):
            try:
                self.load_model(self.model_dir)
                return
            except Exception as e:
                print(f"[MODEL TRAINING] Error loading crop advisor model: {e}. Retraining...")
                
        self._train_model()
        self.save_model(self.model_dir)

    def _train_model(self):
        dataset_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "..",
            "Dataset",
            "Crop_recommendation.csv"
        )
        
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Missing crop recommendation dataset at {dataset_path}")
            
        X = []
        y = []
        
        with open(dataset_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            # N, P, K, temperature, humidity, ph, rainfall, label
            for row in reader:
                X.append([float(x) for x in row[:-1]])
                y.append(row[-1])
                
        X = np.array(X)
        y_encoded = self.label_encoder.fit_transform(y)
        
        X_train, X_val, y_train, y_val = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
        self.classifier.fit(X_train, y_train)
        
        acc = self.classifier.score(X_val, y_val)
        print(f"[MODEL TRAINING] Crop Recommendation trained. Validation Accuracy: {acc:.4f}")
        self.is_trained = True

    def recommend(self, n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float) -> dict:
        if not self.is_trained:
            raise Exception("Crop Advisor model not trained")
            
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
        pred_class_encoded = self.classifier.predict(features)[0]
        pred_crop = self.label_encoder.inverse_transform([pred_class_encoded])[0]
        
        # Calculate probabilities
        probs = self.classifier.predict_proba(features)[0]
        top_indices = np.argsort(probs)[::-1][:3]
        
        recommendations = []
        for idx in top_indices:
            crop_name = self.label_encoder.inverse_transform([idx])[0]
            confidence = float(probs[idx])
            if confidence > 0.01:
                recommendations.append({
                    "crop": crop_name,
                    "confidence": confidence
                })
                
        return {
            "recommendedCrop": pred_crop,
            "alternativeRecommendations": recommendations,
            "dataSource": "crop-recommendation-kaggle-2200"
        }

    def save_model(self, path: str):
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.classifier, os.path.join(path, "crop_advisor.joblib"))
        joblib.dump(self.label_encoder, os.path.join(path, "crop_advisor_encoder.joblib"))
        print(f"Crop Advisor model saved to {path}")

    def load_model(self, path: str):
        self.classifier = joblib.load(os.path.join(path, "crop_advisor.joblib"))
        self.label_encoder = joblib.load(os.path.join(path, "crop_advisor_encoder.joblib"))
        self.is_trained = True
        print(f"Crop Advisor model loaded from {path}")
