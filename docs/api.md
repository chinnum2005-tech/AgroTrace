# AgriTrace AI - API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "FARMER",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "FARMER"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

---

## 🏭 Farm Endpoints

### Get My Farm
**GET** `/farms/my-farm`

Get the authenticated farmer's farm details.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm",
    "description": "Organic farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Farm Road"
    },
    "size": 50.5,
    "certification": "USDA Organic",
    "crops": [...]
  }
}
```

### Create Farm
**POST** `/farms`

Register a new farm.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

**Request Body:**
```json
{
  "name": "Green Valley Farm",
  "description": "Organic vegetable farm",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Farm Road"
  },
  "size": 50.5,
  "certification": "USDA Organic"
}
```

---

## 🌱 Crop Endpoints

### Get My Crops
**GET** `/crops/my-crops`

Get all crops for the authenticated farmer's farm.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

### Create Crop
**POST** `/crops`

Add a new crop to the farm.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

**Request Body:**
```json
{
  "name": "Wheat Field A",
  "type": "WHEAT",
  "variety": "Hard Red Winter",
  "plantingDate": "2024-03-15T00:00:00Z",
  "expectedHarvest": "2024-07-15T00:00:00Z",
  "area": 25.0
}
```

### Update Crop Stage
**PATCH** `/crops/:id/stage`

Update the growth stage of a crop.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

**Request Body:**
```json
{
  "growthStage": "FLOWERING"
}
```

---

## 🤖 Prediction Endpoints

### Get Yield Prediction
**GET** `/predictions/crop/:cropId`

Get AI-powered yield prediction for a specific crop.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "id": "uuid",
      "predictedYield": 4500.5,
      "confidence": 0.87,
      "factors": {
        "weather": { "temperature": 25, "rainfall": 800 },
        "soil": { "ph_level": 6.5, "nitrogen": 50 },
        "historical": 1.02
      }
    },
    "message": "Yield prediction generated successfully"
  }
}
```

---

## ⛓️ Supply Chain Endpoints

### Record Supply Chain Event
**POST** `/supply-chain/events`

Record a new event in the supply chain (optionally with blockchain reference).

**Headers:** `Authorization: Bearer <token>`  
**Role:** DISTRIBUTOR

**Request Body:**
```json
{
  "productId": "CROP-uuid",
  "eventType": "SHIPPED",
  "timestamp": "2024-05-20T10:30:00Z",
  "location": "Distribution Center A",
  "metadata": "{\"temperature\": \"5°C\", \"vehicle\": \"TRK-001\"}",
  "transactionHash": "0x...",
  "blockNumber": 12345678
}
```

### Get Product Events
**GET** `/supply-chain/events/:productId`

Get complete supply chain history for a product.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "CROP-uuid",
      "eventType": "PLANTED",
      "timestamp": "2024-03-15T08:00:00Z",
      "location": "Green Valley Farm",
      "actor": { "firstName": "John", "lastName": "Doe" },
      "transactionHash": "0x...",
      "verified": true
    }
  ]
}
```

---

## ✅ Verification Endpoints

### Verify Product
**GET** `/verify/:qrCode`

Public endpoint to verify product authenticity using QR code.

**No Authentication Required**

**Response (200):**
```json
{
  "success": true,
  "message": "Product verified successfully",
  "data": {
    "crop": {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "growthStage": "READY_FOR_HARVEST"
    },
    "farm": {
      "name": "Green Valley Farm",
      "location": {...},
      "certification": "USDA Organic",
      "farmer": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "predictions": {...},
    "supplyChainEvents": [...]
  }
}
```

### Generate QR Code
**POST** `/verify/generate/:cropId`

Generate QR code for a crop.

**Headers:** `Authorization: Bearer <token>`  
**Role:** FARMER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "AGRITRACE-uuid-timestamp",
    "qrCodeImage": "data:image/png;base64,..."
  },
  "message": "QR code generated successfully"
}
```

---

## 📊 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 🔄 Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1640000000`

---

## 🌐 AI Service API

Base URL: `http://localhost:8000`

### Health Check
**GET** `/health`

### Yield Prediction
**POST** `/predict/yield`

**Request Body:**
```json
{
  "cropType": "WHEAT",
  "area": 25.0,
  "plantingDate": "2024-03-15T00:00:00Z",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Response (200):**
```json
{
  "predictedYield": 4500.5,
  "confidence": 0.87,
  "factors": {
    "weather": {...},
    "soil": {...},
    "historical": 1.02
  }
}
```

---

For more information, see [README.md](../README.md)
