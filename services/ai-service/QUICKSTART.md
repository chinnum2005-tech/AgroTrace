# AgriTrace AI Service - Quick Start Guide 🚀

## ⚡ Setup in 3 Steps

### Step 1: Install Dependencies
```bash
cd services/ai-service
pip install -r requirements.txt
```

**Dependencies installed:**
- fastapi (web framework)
- uvicorn (ASGI server)
- scikit-learn (ML library)
- numpy (numerical computing)
- pandas (data manipulation)
- pydantic (data validation)
- joblib (model serialization)

---

### Step 2: Run the Service

**Development Mode:**
```bash
uvicorn main:app --reload
```

**Production Mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Service runs on `http://localhost:8000`

---

### Step 3: Test the Endpoint

**Using cURL:**
```bash
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{
    "cropType": "WHEAT",
    "area": 50.0,
    "rainfall": 750.0,
    "soilQuality": {
      "ph": 6.5,
      "nitrogen": 55.0,
      "phosphorus": 35.0,
      "potassium": 45.0
    }
  }'
```

**Expected Response:**
```json
{
  "predictedYield": 3250.75
}
```

---

## 🌐 Interactive Documentation

FastAPI provides automatic interactive API docs:

**Swagger UI:**
```
http://localhost:8000/docs
```

**ReDoc:**
```
http://localhost:8000/redoc
```

Visit these URLs to:
- View all endpoints
- Test API calls interactively
- See request/response schemas
- Download OpenAPI spec

---

## 🧪 More Examples

### Example 1: Corn Prediction
```bash
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{
    "cropType": "CORN",
    "area": 35.0,
    "rainfall": 900.0,
    "soilQuality": {
      "ph": 6.8,
      "nitrogen": 70.0,
      "phosphorus": 40.0,
      "potassium": 50.0
    }
  }'
```

### Example 2: Rice Prediction
```bash
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{
    "cropType": "RICE",
    "area": 25.0,
    "rainfall": 1200.0,
    "soilQuality": {
      "ph": 6.0,
      "nitrogen": 60.0,
      "phosphorus": 30.0,
      "potassium": 35.0
    }
  }'
```

### Example 3: Soybeans Prediction
```bash
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{
    "cropType": "SOYBEANS",
    "area": 40.0,
    "rainfall": 850.0,
    "soilQuality": {
      "ph": 6.3,
      "nitrogen": 45.0,
      "phosphorus": 25.0,
      "potassium": 40.0
    }
  }'
```

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t agritrace-ai-service .
```

### Run Container
```bash
docker run -p 8000:8000 agritrace-ai-service
```

### Using Docker Compose
```bash
# From project root directory
docker-compose up ai-service
```

---

## 🔍 Health Check

Test if the service is running:

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-13T10:30:00",
  "service": "AgriTrace AI Service"
}
```

---

## 📝 Input Requirements

### Required Fields

**cropType** (string)
- Must be one of: WHEAT, RICE, CORN, SOYBEANS, BARLEY, OATS, CANOLA, SORGHUM, OTHER
- Case-insensitive (automatically converted to uppercase)

**area** (float)
- Farm size in hectares
- Must be positive number
- Range: 0.1 - 10000

**rainfall** (float)
- Annual rainfall in millimeters
- Range: 0 - 5000

**soilQuality** (object)
- Contains soil composition data
- All properties optional (have defaults)

### Optional Soil Quality Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| ph | float | 6.5 | Soil pH level (0-14) |
| nitrogen | float | 50.0 | Nitrogen content (ppm) |
| phosphorus | float | 30.0 | Phosphorus content (ppm) |
| potassium | float | 40.0 | Potassium content (ppm) |

---

## ⚠️ Common Issues

### Issue: ModuleNotFoundError
```bash
# Error: No module named 'fastapi'
```
**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: Port Already in Use
```bash
# Error: [Errno 48] Address already in use
```
**Solution:**
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

### Issue: Permission Denied
```bash
# Error: [Errno 13] Permission denied
```
**Solution (Linux/Mac):**
```bash
sudo lsof -ti :8000 | xargs kill -9
```

### Issue: Invalid JSON
```bash
# Error: 422 Unprocessable Entity
```
**Solution:** Check JSON format and field names
```bash
# Ensure proper quotes and commas
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d '{"cropType": "WHEAT", "area": 50.0, ...}'
```

---

## 🎯 Testing with Python

### Simple Test Script

Create `test_api.py`:

```python
import requests
import json

# API endpoint
url = "http://localhost:8000/predict/yield"

# Test data
payload = {
    "cropType": "WHEAT",
    "area": 50.0,
    "rainfall": 750.0,
    "soilQuality": {
        "ph": 6.5,
        "nitrogen": 55.0,
        "phosphorus": 35.0,
        "potassium": 45.0
    }
}

# Make request
response = requests.post(url, json=payload)

# Print result
print(f"Status Code: {response.status_code}")
print(f"Predicted Yield: {response.json()['predictedYield']} kg/hectare")
```

**Run test:**
```bash
python test_api.py
```

---

## 📊 Understanding the Output

### predictedYield

**Unit:** kg/hectare (kilograms per hectare)

**Typical Ranges:**
- **Wheat:** 2000 - 5000 kg/ha
- **Rice:** 2500 - 6000 kg/ha
- **Corn:** 3000 - 8000 kg/ha
- **Soybeans:** 1500 - 4000 kg/ha

**Factors Affecting Yield:**
1. **Rainfall** - More rain generally increases yield (up to optimal level)
2. **Soil Nutrients** - Higher NPK values improve yield
3. **Soil pH** - Neutral pH (6-7) is optimal for most crops
4. **Crop Type** - Different crops have different base yields

### Example Interpretations

**Low Yield (< 2000 kg/ha):**
- Poor soil quality
- Insufficient rainfall
- Acidic/alkaline soil
- Low nutrient levels

**Medium Yield (2000-4000 kg/ha):**
- Average conditions
- Moderate inputs
- Typical farm management

**High Yield (> 4000 kg/ha):**
- Optimal soil quality
- Good rainfall
- Balanced nutrients
- Ideal growing conditions

---

## 🔗 Integration with Backend

The AI service integrates with the Node.js backend API:

### Backend Controller Integration

```typescript
// apps/backend/src/controllers/crop.controller.ts
async function createCrop(req: AuthRequest, res: Response) {
  // Create crop in database
  const crop = await prisma.crop.create({ ... });
  
  // Get yield prediction from AI service
  const predictionResponse = await fetch(
    'http://ai-service:8000/predict/yield',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropType: crop.type,
        area: crop.area,
        rainfall: 800,
        soilQuality: { ph: 6.5, nitrogen: 50, phosphorus: 30, potassium: 40 }
      })
    }
  );
  
  const prediction = await predictionResponse.json();
  
  // Save prediction to database
  await prisma.aIPrediction.create({
    data: {
      cropId: crop.id,
      predictedYield: prediction.predictedYield,
      ...
    }
  });
  
  return res.json({ ...crop, prediction });
}
```

---

## 📈 Performance Optimization

### Development
```bash
# Single worker, auto-reload
uvicorn main:app --reload
```

### Production
```bash
# Multiple workers for better throughput
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Benchmarking
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:8000/health
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Service starts without errors
- [ ] Health endpoint responds: `GET /health`
- [ ] Prediction endpoint works: `POST /predict/yield`
- [ ] Swagger UI accessible: `/docs`
- [ ] Returns valid JSON responses
- [ ] Handles invalid input gracefully
- [ ] Model loads on startup
- [ ] Predictions complete in < 1 second

---

## 📚 Next Steps

1. ✅ Test with different crop types
2. ✅ Experiment with soil quality values
3. ✅ Integrate with backend API
4. ✅ Connect to frontend dashboard
5. ✅ Deploy to production environment
6. ✅ Set up monitoring and logging
7. ✅ Collect real data for model retraining

---

## 🔗 Additional Resources

- **[README.md](./README.md)** - Complete documentation (708 lines)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[main.py](./main.py)** - Source code
- **[models/yield_predictor.py](./models/yield_predictor.py)** - ML model

---

**Happy Predicting! 🌾**
