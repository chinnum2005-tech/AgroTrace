# AgriTrace AI Backend API Documentation

## 🚀 Quick Start

```bash
cd apps/backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

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

**Validation:**
- `email`: Valid email format
- `password`: Minimum 6 characters
- `firstName`: Required
- `lastName`: Required
- `role`: Optional, defaults to CONSUMER

---

### Login
**POST** `/api/auth/login`

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

---

## 🏭 Farm Endpoints

**All farm routes require authentication via Bearer token**

### Get All Farms (Admin Only)
**GET** `/api/farms`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Green Valley Farm",
      "description": "Organic farm",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060,
        "address": "123 Farm Road"
      },
      "size": 150.5,
      "certification": "USDA Organic",
      "user": {
        "id": "uuid",
        "email": "farmer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get My Farm (Farmer Only)
**GET** `/api/farms/my-farm`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

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
    "size": 150.5,
    "certification": "USDA Organic",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Farm (Farmer Only)
**POST** `/api/farms`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Request Body:**
```json
{
  "name": "Green Valley Farm",
  "description": "Organic vegetable farm",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Farm Road, Farmville, CA 12345"
  },
  "size": 150.5,
  "certification": "USDA Organic"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Farm created successfully",
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm",
    "description": "Organic vegetable farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Farm Road, Farmville, CA 12345"
    },
    "size": 150.5,
    "certification": "USDA Organic",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Validation:**
- `name`: Required, minimum 1 character
- `location.lat`: Required, number
- `location.lng`: Required, number
- `location.address`: Required, string
- `size`: Required, positive number
- `certification`: Optional

---

## 🌱 Crop Endpoints

**All crop routes require authentication via Bearer token**

### Get All Crops (Admin Only)
**GET** `/api/crops`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "variety": "Hard Red Winter",
      "plantingDate": "2024-03-01",
      "expectedHarvest": "2024-07-15",
      "area": 50.0,
      "growthStage": "VEGETATIVE",
      "qrCode": "AGRITRACE-WHEAT-001",
      "farm": {
        "id": "uuid",
        "name": "Green Valley Farm",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "predictions": [],
      "createdAt": "2024-03-01T00:00:00Z",
      "updatedAt": "2024-03-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get My Crops (Farmer Only)
**GET** `/api/crops/my-crops`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "variety": "Hard Red Winter",
      "plantingDate": "2024-03-01",
      "expectedHarvest": "2024-07-15",
      "area": 50.0,
      "growthStage": "VEGETATIVE",
      "qrCode": "AGRITRACE-WHEAT-001",
      "farmId": "uuid",
      "createdAt": "2024-03-01T00:00:00Z",
      "updatedAt": "2024-03-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Create Crop (Farmer Only)
**POST** `/api/crops`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Request Body:**
```json
{
  "name": "Wheat Field A",
  "type": "WHEAT",
  "variety": "Hard Red Winter",
  "plantingDate": "2024-03-01T00:00:00Z",
  "expectedHarvest": "2024-07-15T00:00:00Z",
  "area": 50.0
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Crop created successfully",
  "data": {
    "id": "uuid",
    "name": "Wheat Field A",
    "type": "WHEAT",
    "variety": "Hard Red Winter",
    "plantingDate": "2024-03-01T00:00:00Z",
    "expectedHarvest": "2024-07-15T00:00:00Z",
    "area": 50.0,
    "growthStage": "PLANTED",
    "qrCode": "AGRITRACE-WHEAT-001",
    "farmId": "uuid",
    "createdAt": "2024-03-01T00:00:00Z",
    "updatedAt": "2024-03-01T00:00:00Z"
  }
}
```

**Validation:**
- `name`: Required, minimum 1 character
- `type`: Required, enum (WHEAT, RICE, CORN, SOYBEANS, BARLEY, OATS, CANOLA, SORGHUM, OTHER)
- `plantingDate`: Required, ISO 8601 date format
- `area`: Required, positive number
- `variety`: Optional
- `expectedHarvest`: Optional, ISO 8601 date format

---

### Update Crop Stage (Farmer Only)
**PATCH** `/api/crops/:id/stage`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Request Body:**
```json
{
  "growthStage": "VEGETATIVE"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Crop stage updated successfully",
  "data": {
    "id": "uuid",
    "name": "Wheat Field A",
    "growthStage": "VEGETATIVE",
    "updatedAt": "2024-03-15T00:00:00Z"
  }
}
```

**Validation:**
- `growthStage`: Required, enum (PLANTED, GERMINATION, VEGETATIVE, FLOWERING, FRUITING, MATURING, READY_FOR_HARVEST, HARVESTED)

---

## ✅ Verification Endpoints

### Verify Product by QR Code (Public)
**GET** `/api/verify/:qrCode`

**No authentication required**

**Example:**
```
GET /api/verify/AGRITRACE-WHEAT-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "crop": {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "variety": "Hard Red Winter",
      "growthStage": "READY_FOR_HARVEST",
      "qrCode": "AGRITRACE-WHEAT-001",
      "farm": {
        "name": "Green Valley Farm",
        "location": {
          "address": "123 Farm Road"
        },
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "predictions": [
        {
          "predictedYield": 225.5,
          "confidence": 0.87,
          "factors": {
            "temperature": 25.5,
            "rainfall": 750
          }
        }
      ],
      "supplyChainEvents": [
        {
          "eventType": "PLANTED",
          "timestamp": "2024-03-01T00:00:00Z",
          "actor": {
            "firstName": "John",
            "lastName": "Doe",
            "role": "FARMER"
          }
        }
      ]
    }
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### Generate QR Code (Authenticated)
**POST** `/api/verify/generate/:cropId`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "AGRITRACE-WHEAT-001",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

## 🔒 Authentication Details

### JWT Token Format
Tokens are JSON Web Tokens signed with the server's JWT secret. Decode to get:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "FARMER",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Token Expiry
- Access tokens expire after **24 hours**
- Users must re-login to obtain a new token

### Role-Based Access Control

| Endpoint | ADMIN | FARMER | DISTRIBUTOR | CONSUMER |
|----------|-------|--------|-------------|----------|
| POST /auth/register | ✅ | ✅ | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| GET /api/farms | ✅ | ❌ | ❌ | ❌ |
| GET /api/farms/my-farm | ❌ | ✅ | ❌ | ❌ |
| POST /api/farms | ❌ | ✅ | ❌ | ❌ |
| GET /api/crops | ✅ | ❌ | ❌ | ❌ |
| GET /api/crops/my-crops | ❌ | ✅ | ❌ | ❌ |
| POST /api/crops | ❌ | ✅ | ❌ | ❌ |
| GET /api/verify/:qrCode | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed: Email is required, Password must be at least 6 characters"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Insufficient permissions. Required: ADMIN"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🧪 Testing with cURL

### Register a New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "FARMER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@test.com",
    "password": "password123"
  }'
```

### Create Farm (replace TOKEN with actual JWT)
```bash
curl -X POST http://localhost:3001/api/farms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Test Farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Test Street"
    },
    "size": 100.5
  }'
```

### Create Crop
```bash
curl -X POST http://localhost:3001/api/crops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Test Wheat",
    "type": "WHEAT",
    "plantingDate": "2024-03-01T00:00:00Z",
    "area": 50.0
  }'
```

### Verify Product
```bash
curl http://localhost:3001/api/verify/AGRITRACE-WHEAT-001
```

---

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agritrace

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🛡️ Security Features

1. **Password Hashing**: bcryptjs with salt rounds of 10
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Helmet.js**: Security HTTP headers
5. **CORS Protection**: Configurable origin restrictions
6. **Input Validation**: Zod schema validation on all inputs
7. **Error Handling**: Centralized error handling with proper status codes

---

## 📊 Database Integration

The backend uses **Prisma ORM** for database operations:

- **Auto-generated Client**: Type-safe database queries
- **Migrations**: Automatic schema synchronization
- **Relationships**: Proper cascade deletes and includes
- **Indexes**: Optimized queries on frequently accessed fields

See `packages/prisma/schema.prisma` for the complete database schema.
