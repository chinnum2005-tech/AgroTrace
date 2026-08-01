import pandas as pd
import numpy as np
import joblib
import os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# Configuration
OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(OUTPUT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Download Public Kaggle Dataset
# Using raw GitHub link from Harvestify (which mirrors the exact Kaggle dataset)
DATA_URL = "https://raw.githubusercontent.com/Gladiator07/Harvestify/master/Data-processed/crop_recommendation.csv"
print(f"Downloading dataset from {DATA_URL}...")
df = pd.read_csv(DATA_URL)

print(f"Dataset loaded. Shape: {df.shape}")

# Features: N, P, K, temperature, humidity, ph, rainfall
X = df.drop('label', axis=1)
y_raw = df['label']

# 2. Encode Labels
le = LabelEncoder()
y = le.fit_transform(y_raw)

# Save the label encoder so the inference service can decode predictions
encoder_path = os.path.join(MODELS_DIR, "crop_label_encoder.pkl")
joblib.dump(le, encoder_path)

# 3. Train XGBoost Model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    random_state=42,
    use_label_encoder=False,
    eval_metric='mlogloss'
)

print("Training XGBoost Classifier...")
model.fit(X_train, y_train)

# 4. Evaluate
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"Model trained! Test Accuracy: {acc * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, preds, target_names=le.classes_))

# 5. Save Model
model_path = os.path.join(MODELS_DIR, "crop_rec_model.pkl")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
print(f"Label Encoder saved to {encoder_path}")
