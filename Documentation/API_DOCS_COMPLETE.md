# 🚀 FarmConnect API Documentation

## Overview
Clean, RESTful API architecture designed for scalability and developer experience.

**Base URL:** `http://localhost:3001/api`

---

## 📋 Table of Contents

1. [API Structure](#api-structure)
2. [Authentication Endpoints](#authentication)
3. [Farm Management](#farms)
4. [Crop Management](#crops)
5. [Product Management](#products)
6. [Cart & Orders](#cart--orders)
7. [Supply Chain](#supply-chain)
8. [QR Code & Verification](#qr--verification)
9. [AI Predictions](#predictions)
10. [Error Handling](#error-handling)

---

## 🏗️ API Structure

### Organized by Resource

```
/api
├── /auth              # Authentication & Authorization
│   ├── POST   /register
│   ├── POST   /login
│   └── POST   /refresh-token
│
├── /farms             # Farm management
│   ├── GET    /              # Get all farms
│   ├── GET    /my-farm       # Get my farm (farmer-specific)
│   ├── POST   /              # Create farm
│   ├── GET    /:id           # Get farm by ID
│   ├── PUT    /:id           # Update farm
│   └── DELETE /:id           # Delete farm
│
├── /crops             # Crop management
│   ├── GET    /              # Get all crops
│   ├── GET    /my-crops      # Get my crops (farmer-specific)
│   ├── POST   /              # Create crop
│   ├── GET    /:id           # Get crop by ID
│   ├── PUT    /:id           # Update crop
│   ├── DELETE /:id           # Delete crop
│   └── POST   /:id/harvest   # Record harvest
│
├── /products          # Product management
│   ├── GET    /              # Get all products
│   ├── GET    /:id           # Get product by ID
│   ├── PUT    /:id           # Update product
│   └── DELETE /:id           # Delete product
│
├── /cart              # Shopping cart
│   ├── GET    /              # Get user's cart
│   ├── POST   /items         # Add item to cart
│   ├── PUT    /items/:id     # Update cart item
│   └── DELETE /items/:id     # Remove item from cart
│
├── /orders            # Order management
│   ├── GET    /              # Get all orders (admin)
│   ├── GET    /my-orders     # Get my orders (consumer)
│   ├── POST   /create        # Create new order
│   ├── GET    /:id           # Get order by ID
│   └── PUT    /:id/status    # Update order status
│
├── /shipments         # Shipment tracking
│   ├── GET    /              # Get all shipments
│   ├── GET    /:id           # Get shipment by ID
│   ├── PUT    /:id           # Update shipment
│   └── POST   /:id/assign    # Assign shipment to distributor
│
├── /supply-chain      # Supply chain events
│   ├── GET    /trace/:productId  # Get product traceability
│   ├── POST   /event           # Record supply chain event
│   ├── GET    /events/:cropId  # Get crop events
│   └── GET    /events/product/:productId  # Get product events
│
├── /verify            # Product verification
│   ├── GET    /:qrCode      # Verify product by QR code
│   └── POST   /generate/:cropId  # Generate QR code
│
├── /qr                # QR code services
│   ├── GET    /:cropId      # Get QR code for crop
│   └── POST   /generate     # Generate new QR code
│
└── /predictions       # AI predictions
    ├── GET    /yield/:cropId    # Get yield prediction
    ├── POST   /yield           # Create yield prediction
    └── GET    /confidence/:id  # Get prediction confidence
```

---

## 🔐 Authentication

### **POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Farmer",
  "role": "FARMER",
  "phone": "+1-555-0100"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Farmer",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

---

### **POST** `/api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "farmer@example.com",
      "firstName": "John",
      "lastName": "Farmer",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

---

### **POST** `/api/auth/refresh-token`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new-access-token",
    "expiresIn": "24h"
  }
}
```

---

## 🏡 Farms

### **GET** `/api/farms`

Get all farms (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Green Valley Farm",
      "description": "Organic farm specializing in wheat and corn",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194,
        "address": "Agricultural Valley, CA"
      },
      "size": 150.5,
      "certification": "USDA Organic",
      "userId": "uuid",
      "createdAt": "2026-03-01T10:00:00Z",
      "updatedAt": "2026-03-13T10:00:00Z"
    }
  ]
}
```

---

### **GET** `/api/farms/my-farm`

Get current farmer's farm (Farmer only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm",
    "description": "Organic farm",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "Agricultural Valley, CA"
    },
    "size": 150.5,
    "certification": "USDA Organic"
  }
}
```

---

### **POST** `/api/farms`

Create a new farm (Farmer only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Green Valley Farm",
  "description": "Organic farm specializing in wheat and corn",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "Agricultural Valley, CA"
  },
  "size": 150.5,
  "certification": "USDA Organic"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Farm created successfully",
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm",
    "location": { ... },
    "size": 150.5
  }
}
```

---

### **GET** `/api/farms/:id`

Get farm by ID.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm",
    "description": "Organic farm",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "Agricultural Valley, CA"
    },
    "size": 150.5,
    "certification": "USDA Organic",
    "crops": [...]
  }
}
```

---

### **PUT** `/api/farms/:id`

Update farm information (Owner or Admin only).

**Request Body:**
```json
{
  "name": "Green Valley Farm - Expanded",
  "size": 200.5,
  "certification": "USDA Organic, Fair Trade"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Farm updated successfully",
  "data": {
    "id": "uuid",
    "name": "Green Valley Farm - Expanded",
    "size": 200.5
  }
}
```

---

### **DELETE** `/api/farms/:id`

Delete farm (Owner or Admin only).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Farm deleted successfully"
}
```

---

## 🌾 Crops

### **GET** `/api/crops`

Get all crops (Admin only).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "variety": "Hard Red Winter Wheat",
      "plantingDate": "2026-03-01",
      "expectedHarvest": "2026-07-15",
      "growthStage": "VEGETATIVE",
      "area": 50.0,
      "estimatedYield": 2250,
      "farmId": "uuid",
      "qrCode": "FARMCONNECT-WHT-001"
    }
  ]
}
```

---

### **GET** `/api/crops/my-crops`

Get current farmer's crops (Farmer only).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "growthStage": "VEGETATIVE",
      "area": 50.0,
      "estimatedYield": 2250
    }
  ]
}
```

---

### **POST** `/api/crops`

Create new crop (Farmer only).

**Request Body:**
```json
{
  "name": "Wheat Field A",
  "type": "WHEAT",
  "variety": "Hard Red Winter Wheat",
  "plantingDate": "2026-03-01",
  "expectedHarvest": "2026-07-15",
  "area": 50.0,
  "farmId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Crop created successfully",
  "data": {
    "id": "uuid",
    "name": "Wheat Field A",
    "type": "WHEAT",
    "growthStage": "PLANTED"
  }
}
```

---

### **POST** `/api/crops/:id/harvest`

Record harvest for a crop (Farmer only).

**Request Body:**
```json
{
  "actualYield": 2300,
  "harvestDate": "2026-07-15",
  "quality": "Premium",
  "notes": "Excellent yield this season"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Harvest recorded successfully",
  "data": {
    "id": "uuid",
    "actualYield": 2300,
    "growthStage": "HARVESTED"
  }
}
```

---

## 📦 Products

### **GET** `/api/products`

Get all products (Public).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Organic Wheat Flour",
      "sku": "WHT-FLR-001",
      "cropId": "uuid",
      "quantity": 500,
      "packagingDate": "2026-07-20",
      "expiryDate": "2027-07-20",
      "batchNumber": "BATCH-2026-001",
      "status": "ACTIVE",
      "price": 45.00
    }
  ]
}
```

---

### **GET** `/api/products/:id`

Get product by ID.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Organic Wheat Flour",
    "sku": "WHT-FLR-001",
    "quantity": 500,
    "batchNumber": "BATCH-2026-001",
    "status": "ACTIVE",
    "supplyChainEvents": [...]
  }
}
```

---

## 🛒 Cart & Orders

### **GET** `/api/cart`

Get user's shopping cart (Consumer only).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Organic Wheat Flour",
        "quantity": 2,
        "price": 45.00,
        "subtotal": 90.00
      }
    ],
    "totalItems": 2,
    "totalAmount": 90.00
  }
}
```

---

### **POST** `/api/cart/items`

Add item to cart (Consumer only).

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartId": "uuid",
    "totalItems": 3,
    "totalAmount": 135.00
  }
}
```

---

### **POST** `/api/orders/create`

Create new order (Consumer only).

**Request Body:**
```json
{
  "shippingAddress": "123 Main St, City, State 12345",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 45.00
    }
  ],
  "totalPrice": 90.00
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "totalPrice": 90.00,
    "estimatedDelivery": "2026-03-20"
  }
}
```

---

### **GET** `/api/orders/my-orders`

Get consumer's orders (Consumer only).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "PENDING",
      "totalPrice": 90.00,
      "createdAt": "2026-03-13T10:00:00Z",
      "items": [...]
    }
  ]
}
```

---

### **PUT** `/api/orders/:id/status`

Update order status (Admin/Distributor only).

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "uuid",
    "status": "SHIPPED",
    "updatedAt": "2026-03-13T12:00:00Z"
  }
}
```

---

## 🚚 Supply Chain

### **GET** `/api/supply-chain/trace/:productId`

Get complete product traceability (Public).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "eventType": "PLANTED",
      "title": "🌱 Planted",
      "description": "Wheat seeds planted in Field A",
      "location": "Green Valley Farm",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "timestamp": "2026-03-01T08:00:00Z",
      "actor": "John Farmer",
      "actorRole": "FARMER",
      "verified": true,
      "transactionHash": "0x1234...abcd",
      "blockNumber": 12345
    },
    {
      "id": "uuid",
      "eventType": "HARVESTED",
      "title": "🌾 Harvested",
      "description": "Wheat harvested from Field A",
      "location": "Green Valley Farm",
      "timestamp": "2026-07-15T10:00:00Z",
      "actor": "John Farmer",
      "actorRole": "FARMER",
      "verified": true,
      "transactionHash": "0x5678...efgh",
      "blockNumber": 12346
    }
  ]
}
```

---

### **POST** `/api/supply-chain/event`

Record new supply chain event (Authenticated users).

**Request Body:**
```json
{
  "productId": "uuid",
  "eventType": "SHIPPED",
  "location": "Distribution Center, CA",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "metadata": {
    "carrier": "Fast Shipping Co",
    "temperature": "-2°C",
    "humidity": "45%"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Supply chain event recorded",
  "data": {
    "id": "uuid",
    "eventType": "SHIPPED",
    "verified": false,
    "timestamp": "2026-03-13T14:00:00Z"
  }
}
```

---

## 🔍 QR & Verification

### **GET** `/api/verify/:qrCode`

Verify product authenticity by QR code (Public).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "verified": true,
    "product": {
      "id": "uuid",
      "name": "Organic Wheat Flour",
      "batchNumber": "BATCH-2026-001",
      "cropId": "uuid"
    },
    "crop": {
      "id": "uuid",
      "name": "Wheat Field A",
      "type": "WHEAT",
      "farm": "Green Valley Farm"
    },
    "events": [...]
  }
}
```

---

### **POST** `/api/verify/generate/:cropId`

Generate QR code for a crop (Farmer only).

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "cropId": "uuid",
    "qrCode": "FARMCONNECT-WHT-001",
    "url": "https://farmconnect.in/trace/uuid"
  }
}
```

---

## 🤖 Predictions

### **GET** `/api/predictions/yield/:cropId`

Get AI yield prediction for a crop (Farmer only).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cropId": "uuid",
    "predictedYield": 2250,
    "confidence": 0.92,
    "factors": {
      "weather": {
        "rainfall": "Optimal",
        "temperature": "Favorable",
        "sunlight": "Good"
      },
      "soil": {
        "moisture": "65%",
        "nitrogen": "High",
        "pH": "6.8"
      },
      "historical": {
        "avgYield": 2100,
        "trend": "Increasing"
      }
    },
    "createdAt": "2026-03-13T10:00:00Z"
  }
}
```

---

### **POST** `/api/predictions/yield`

Create new yield prediction (Farmer only).

**Request Body:**
```json
{
  "cropId": "uuid",
  "weatherData": {
    "rainfall": 450,
    "avgTemperature": 25,
    "sunlightHours": 8
  },
  "soilData": {
    "moisture": 65,
    "nitrogen": 120,
    "phosphorus": 45,
    "potassium": 180
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Yield prediction generated",
  "data": {
    "predictedYield": 2250,
    "confidence": 0.92,
    "recommendations": [
      "Increase irrigation by 10%",
      "Apply nitrogen fertilizer in 2 weeks"
    ]
  }
}
```

---

## ❌ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

---

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists |
| `422` | Validation Error | Invalid request body |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Internal server error |

---

### Example Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token.",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied. Required roles: FARMER, ADMIN. Your role: CONSUMER",
  "statusCode": 403
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Farm not found",
  "statusCode": 404
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 422,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "size",
      "message": "Size must be greater than 0"
    }
  ]
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Format

**Header:**
```
Authorization: Bearer <token>
```

**Token Payload:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "FARMER",
  "iat": 1710316800,
  "exp": 1710403200
}
```

---

### Role-Based Access Control

| Endpoint | Allowed Roles |
|----------|---------------|
| `/api/auth/*` | Public |
| `/api/farms` | All authenticated |
| `/api/farms/my-farm` | FARMER only |
| `/api/crops/my-crops` | FARMER only |
| `/api/orders/create` | CONSUMER only |
| `/api/supply-chain/event` | FARMER, DISTRIBUTOR, ADMIN |
| `/api/predictions/*` | FARMER, ADMIN |

---

## 📊 Rate Limiting

**Default Limits:**
- Window: 15 minutes
- Max requests: 100 per IP
- Auth endpoints: 10 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710317700
```

---

## 🎯 Best Practices

### 1. **Always Use HTTPS in Production**
```bash
# Development
http://localhost:3001/api

# Production
https://api.farmconnect.in/api
```

### 2. **Store Tokens Securely**
```javascript
// ✅ Good: Store in localStorage or secure cookie
localStorage.setItem('token', token);

// ❌ Bad: Don't log tokens
console.log(token); // NEVER DO THIS
```

### 3. **Handle Token Expiration**
```javascript
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh or logout
    await refreshToken();
  }
  
  return response;
}
```

### 4. **Use Proper HTTP Methods**
```
GET    - Retrieve resources
POST   - Create new resources
PUT    - Update entire resource
PATCH  - Partial update
DELETE - Remove resources
```

### 5. **Validate Input Data**
```javascript
// ✅ Good: Validate before sending
const farmData = {
  name: validateString(name),
  size: validateNumber(size),
  location: validateCoordinates(lat, lng)
};

// ❌ Bad: Send unvalidated data
fetch('/api/farms', {
  method: 'POST',
  body: JSON.stringify({ name, size, location })
});
```

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "FARMER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Farm (with token)
```bash
curl -X POST http://localhost:3001/api/farms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Farm",
    "size": 100,
    "location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "California, USA"
    }
  }'
```

### Get Product Traceability
```bash
curl http://localhost:3001/api/supply-chain/trace/PRODUCT_ID
```

---

## 📚 Additional Resources

- **Swagger/OpenAPI Docs:** http://localhost:3001/api-docs
- **Health Check:** http://localhost:3001/health
- **GitHub Repo:** https://github.com/your-repo/farmconnect
- **Postman Collection:** Available in repo

---

## 🎉 Summary

FarmConnect API provides:

✅ **Clean RESTful Architecture**  
✅ **Role-Based Access Control**  
✅ **JWT Authentication**  
✅ **Comprehensive Error Handling**  
✅ **Rate Limiting Protection**  
✅ **Blockchain Integration**  
✅ **AI Prediction Endpoints**  
✅ **Complete CRUD Operations**  
✅ **Supply Chain Traceability**  
✅ **QR Code Generation**  

**All endpoints are production-ready and well-documented!** 🚀

---

**Version:** 1.0  
**Last Updated:** March 13, 2026  
**Status:** ✅ Production Ready
