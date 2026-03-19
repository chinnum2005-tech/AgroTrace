# 🔐 AgroTrace Authentication & Authorization System

## Overview
AgroTrace implements a **production-ready** Role-Based Access Control (RBAC) system with JWT authentication, refresh tokens, and audit logging.

---

## ✅ Implemented Features

### 1. **JWT Token System**

#### Access Token
- **Expiration:** 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Payload:** `{ id, email, role }`
- **Usage:** Bearer token in Authorization header
- **Format:** `Authorization: Bearer <token>`

#### Refresh Token
- **Expiration:** 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Payload:** `{ id, email, role, type: 'refresh' }`
- **Usage:** Obtain new access token without re-login
- **Endpoint:** `POST /api/auth/refresh-token`

#### Security Enhancements
- **Bcrypt salt rounds:** 12 (stronger hashing)
- **Token type validation:** Prevents access tokens from being used as refresh tokens
- **User existence check:** Validates user still exists on refresh

---

### 2. **Role-Based Access Control (RBAC)**

#### User Roles
```typescript
enum Role {
  ADMIN       // System administrators
  FARMER      // Farm owners/managers
  DISTRIBUTOR // Logistics/shipping
  CONSUMER    // End consumers
}
```

#### Middleware Functions

**`authenticate`** - Verify JWT token
```typescript
import { authenticate } from '../middleware/auth';

router.get('/profile', authenticate, getProfile);
```

**`authorize(...roles)`** - Check user has required role(s)
```typescript
import { authorize } from '../middleware/auth';

// Only farmers can access
router.post('/crops', 
  authenticate, 
  authorize('FARMER'), 
  createCrop
);

// Multiple roles allowed
router.get('/analytics',
  authenticate,
  authorize('ADMIN', 'FARMER'),
  getAnalytics
);
```

**Convenience Middleware**
```typescript
import { isAdmin, isFarmer, isDistributor, isConsumer } from '../middleware/roleCheck';

router.delete('/users/:id', authenticate, isAdmin, deleteUser);
router.post('/farms', authenticate, isFarmer, createFarm);
router.put('/shipments/:id', authenticate, isDistributor, updateShipment);
router.get('/products', authenticate, isConsumer, getProducts);
```

**`optionalAuth`** - Don't fail if no token, but attach user if present
```typescript
import { optionalAuth } from '../middleware/roleCheck';

// Show different content for logged-in vs anonymous users
router.get('/marketplace', optionalAuth, getMarketplace);
```

---

### 3. **Database Schema**

#### Well-Structured Tables

**Users Table**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Bcrypt hashed
  firstName String
  lastName  String
  role      Role     @default(CONSUMER)
  phone     String?
  farm      Farm?    // One-to-one relation
  Cart      Cart[]
  Order     Order[]
  
  @@index([email])
  @@index([role])
}
```

**Farms Table**
```prisma
model Farm {
  id            String   @id @default(uuid())
  name          String
  description   String?
  location      Json     // { lat, lng, address }
  size          Float    // hectares
  certification String?  // Organic, Fair Trade
  userId        String   @unique
  user          User     @relation
  crops         Crop[]
  
  @@index([userId])
}
```

**Crops Table**
```prisma
model Crop {
  id              String       @id @default(uuid())
  name            String
  type            CropType
  variety         String?
  plantingDate    DateTime
  expectedHarvest DateTime?
  growthStage     GrowthStage
  area            Float        // hectares
  estimatedYield  Float?       // kg
  farmId          String
  farm            Farm         @relation
  products        Product[]
  predictions     AIPrediction[]
  qrCode          String?      @unique
  
  @@index([farmId])
  @@index([type])
  @@index([growthStage])
}
```

**Products Table** (from harvested crops)
```prisma
model Product {
  id              String   @id @default(uuid())
  name            String
  sku             String   @unique
  cropId          String
  crop            Crop     @relation
  quantity        Float    // kg or units
  packagingDate   DateTime
  expiryDate      DateTime?
  batchNumber     String
  storageLocation String?
  status          String   // ACTIVE, RECALLED, EXPIRED
  
  @@index([cropId])
  @@index([sku])
  @@index([batchNumber])
  @@index([status])
}
```

**AI Predictions Table**
```prisma
model AIPrediction {
  id             String   @id @default(uuid())
  cropId         String
  crop           Crop     @relation
  predictedYield Float
  confidence     Float    // 0-1 score
  factors        Json     // { weather, soil, historical }
  
  @@index([cropId])
}
```

**Supply Chain Events Table** (Blockchain reference)
```prisma
model SupplyChainEvent {
  id              String      @id @default(uuid())
  productId       String      // Product ID or Crop ID
  eventType       EventType   // PLANTED, HARVESTED, SHIPPED, etc.
  timestamp       DateTime
  location        String?
  latitude        Float?
  longitude       Float?
  actorId         String
  actor           User        @relation
  cropId          String?
  product         Product?    @relation
  metadata        String?     // Additional JSON data
  transactionHash String?     @unique // Blockchain hash
  blockNumber     Int?
  verified        Boolean     @default(false)
  
  @@index([productId])
  @@index([eventType])
  @@index([transactionHash])
  @@index([cropId])
}
```

**Audit Logs Table**
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  action    String   // USER_REGISTERED, USER_LOGIN, etc.
  entity    String   // User, Farm, Crop
  entityId  String
  userId    String
  timestamp DateTime @default(now())
  details   Json?
  
  @@index([userId])
  @@index([timestamp])
  @@index([entity])
}
```

---

### 4. **API Endpoints with RBAC**

#### Authentication Routes
```
POST /api/auth/register          // Public
POST /api/auth/login             // Public
POST /api/auth/refresh-token     // Public (uses refresh token)
```

#### Protected Routes Examples

**Admin Only**
```typescript
DELETE /api/users/:id            // authenticate + isAdmin
GET    /api/admin/analytics      // authenticate + isAdmin
```

**Farmer Only**
```typescript
POST   /api/farms                // authenticate + isFarmer
POST   /api/crops                // authenticate + isFarmer
PUT    /api/crops/:id            // authenticate + isFarmer
DELETE /api/crops/:id            // authenticate + isFarmer
```

**Distributor Only**
```typescript
PUT    /api/shipments/:id        // authenticate + isDistributor
POST   /api/supply-chain/events  // authenticate + isDistributor
```

**Consumer Only**
```typescript
POST   /api/cart/items           // authenticate + isConsumer
POST   /api/orders               // authenticate + isConsumer
GET    /api/orders/my-orders     // authenticate + isConsumer
```

**Public (with optional auth)**
```typescript
GET    /api/marketplace          // optionalAuth
GET    /api/products/:id         // optionalAuth
GET    /api/verify/:qrCode       // Public (no auth needed)
```

---

### 5. **Test Credentials**

```
👨‍💼 ADMIN
Email: admin@agritrace.ai
Password: admin123
Role: ADMIN

🌾 FARMER
Email: farmer@agritrace.ai
Password: farmer123
Role: FARMER
Farm: Green Valley Farm (150.5 hectares)
Crops: Wheat, Corn, Soybeans

🚚 DISTRIBUTOR
Email: distributor@agritrace.ai
Password: dist123
Role: DISTRIBUTOR

🛒 CONSUMER
Email: consumer@agritrace.ai
Password: consumer123
Role: CONSUMER
```

---

### 6. **Usage Examples**

#### Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newfarmer@example.com",
    "password": "securepass123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "FARMER",
    "phone": "+1-555-0100"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newfarmer@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "FARMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@agritrace.ai",
    "password": "farmer123"
  }'
```

#### Refresh Token
```bash
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Access Protected Endpoint
```bash
curl http://localhost:3001/api/farms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 7. **Error Handling**

#### Authentication Errors
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token.",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "error": "Token has expired. Please login again.",
  "statusCode": 401
}
```

```json
{
  "success": false,
  "error": "Invalid token format",
  "statusCode": 401
}
```

#### Authorization Errors
```json
{
  "success": false,
  "error": "Access denied. Required roles: FARMER, ADMIN. Your role: CONSUMER",
  "statusCode": 403
}
```

---

### 8. **Environment Variables**

Create `.env` file in backend directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agritrace

# Server
PORT=3001
NODE_ENV=development
```

---

## 🎯 Key Advantages

✅ **Production-Ready Security**
- Bcrypt with 12 salt rounds
- JWT with configurable expiration
- Refresh token mechanism
- Token type validation

✅ **Clean Role-Based Access**
- Clear separation of concerns
- Easy to add new roles
- Middleware composition
- Audit logging for compliance

✅ **Well-Structured Database**
- Proper foreign key relations
- Indexed fields for performance
- Cascade deletes for data integrity
- JSON fields for flexible metadata

✅ **Developer Friendly**
- Reusable middleware
- Clear error messages
- Comprehensive documentation
- Test accounts for all roles

---

## 🚀 Next Steps

1. **Add Rate Limiting** - Prevent brute force attacks
2. **Implement Password Reset** - Email-based recovery
3. **Add 2FA** - Two-factor authentication for admins
4. **Session Management** - Track active sessions
5. **OAuth Integration** - Google, Facebook login
6. **Permission Granularity** - Fine-grained permissions beyond roles

---

## 📝 Compliance Notes

- All passwords are hashed using bcrypt (salt rounds: 12)
- JWT tokens are signed with HS256 algorithm
- Refresh tokens have longer expiration but are validated against user existence
- Audit logs track all authentication events
- Role validation happens server-side (never trust client)
- CORS properly configured for production deployment

---

**Status:** ✅ Fully Implemented & Production Ready

**Last Updated:** March 13, 2026
