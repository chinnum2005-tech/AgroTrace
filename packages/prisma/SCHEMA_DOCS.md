# Prisma Database Schema Documentation

## Overview

This document describes the complete database schema for the FarmConnect platform, implemented using Prisma ORM with PostgreSQL.

## Schema Statistics

- **Models**: 7 (User, Farm, Crop, Product, AIPrediction, SupplyChainEvent, AuditLog)
- **Enums**: 4 (Role, CropType, GrowthStage, EventType)
- **Relationships**: Fully configured with cascading deletes
- **Indexes**: Optimized for common queries

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│ (role enum) │
└──────┬──────┘
       │ 1:1
       ▼
┌─────────────┐
│    Farm     │
└──────┬──────┘
       │ 1:n
       ▼
┌─────────────┐
│    Crop     │◄──────┐
└──────┬──────┘       │
       │ 1:n          │ n:1
       ├──────────────┘
       │
       ├──► AIPrediction
       │
       └──► Product
            └───► SupplyChainEvent
                  ▲
                  │
            User (actor)
```

---

## Models Detail

### 1. User Model

**Purpose**: Authentication and user management with role-based access control.

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  firstName     String
  lastName      String
  role          Role      @default(CONSUMER)
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  farm          Farm?
  supplyChainEvents SupplyChainEvent[]
  
  @@index([email])
  @@index([role])
}
```

**Fields:**
- `id`: UUID primary key
- `email`: Unique email for authentication
- `password`: Bcrypt hashed password
- `firstName`, `lastName`: User identity
- `role`: RBAC enum (ADMIN, FARMER, DISTRIBUTOR, CONSUMER)
- `phone`: Optional contact information
- `timestamps`: Automatic creation and update tracking

**Indexes:**
- `email`: Fast login lookups
- `role`: Efficient role-based filtering

**Relationships:**
- One-to-one with Farm (farmers only)
- One-to-many with SupplyChainEvent (as actor)

---

### 2. Farm Model

**Purpose**: Agricultural land registration and management.

```prisma
model Farm {
  id              String   @id @default(uuid())
  name            String
  description     String?
  location        Json     // { lat, lng, address }
  size            Float    // in hectares
  certification   String?  // Organic, Fair Trade, etc.
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  crops           Crop[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

**Fields:**
- `location`: GeoJSON with latitude, longitude, and address
- `size`: Total area in hectares
- `certification`: Organic, Fair Trade, etc.
- `userId`: Foreign key to User (one farm per farmer)

**Relationships:**
- Many-to-one with User (cascade delete)
- One-to-many with Crops

---

### 3. Crop Model

**Purpose**: Track crop lifecycle from planting to harvest.

```prisma
model Crop {
  id              String      @id @default(uuid())
  name            String
  type            CropType
  variety         String?
  plantingDate    DateTime
  expectedHarvest DateTime?
  growthStage     GrowthStage @default(PLANTED)
  area            Float       // in hectares
  estimatedYield  Float?      // in kg
  actualYield     Float?
  farmId          String
  farm            Farm        @relation(fields: [farmId], references: [id], onDelete: Cascade)
  products        Product[]
  predictions     AIPrediction[]
  supplyChainEvents SupplyChainEvent[]
  qrCode          String?     @unique
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([farmId])
  @@index([type])
  @@index([growthStage])
}
```

**Enums:**
- `CropType`: WHEAT, RICE, CORN, SOYBEANS, BARLEY, OATS, CANOLA, SORGHUM, OTHER
- `GrowthStage`: PLANTED, GERMINATION, VEGETATIVE, FLOWERING, FRUITING, MATURING, READY_FOR_HARVEST, HARVESTED

**Features:**
- QR code generation for consumer verification
- Yield tracking (estimated vs actual)
- Growth stage progression

**Relationships:**
- Many-to-one with Farm (cascade delete)
- One-to-many with Products
- One-to-many with AIPredictions
- One-to-many with SupplyChainEvents

---

### 4. Product Model

**Purpose**: Packaged goods derived from crops for supply chain tracking.

```prisma
model Product {
  id              String   @id @default(uuid())
  name            String
  sku             String   @unique
  cropId          String
  crop            Crop     @relation(fields: [cropId], references: [id], onDelete: Cascade)
  quantity        Float    // quantity in kg or units
  packagingDate   DateTime
  expiryDate      DateTime?
  batchNumber     String
  storageLocation String?
  status          String   @default("ACTIVE") // ACTIVE, RECALLED, EXPIRED
  supplyChainEvents SupplyChainEvent[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([cropId])
  @@index([sku])
  @@index([batchNumber])
  @@index([status])
}
```

**Fields:**
- `sku`: Unique product identifier (barcode/UPC)
- `quantity`: Amount in kg or units
- `batchNumber`: Production batch for traceability
- `status`: Product lifecycle state

**Indexes:**
- `sku`: Fast POS/inventory lookup
- `batchNumber`: Recall management
- `status`: Active product filtering

**Relationships:**
- Many-to-one with Crop (cascade delete)
- One-to-many with SupplyChainEvents

---

### 5. AIPrediction Model

**Purpose**: Store ML-powered yield predictions.

```prisma
model AIPrediction {
  id            String   @id @default(uuid())
  cropId        String
  crop          Crop     @relation(fields: [cropId], references: [id], onDelete: Cascade)
  predictedYield Float
  confidence    Float    // 0-1 confidence score
  factors       Json     // { weather, soil, historical }
  createdAt     DateTime @default(now())

  @@index([cropId])
}
```

**Features:**
- Stores AI model predictions
- Confidence scoring
- Factor analysis (weather, soil, historical data)

**Relationships:**
- Many-to-one with Crop (cascade delete)

---

### 6. SupplyChainEvent Model

**Purpose**: Blockchain-verified supply chain tracking.

```prisma
model SupplyChainEvent {
  id              String    @id @default(uuid())
  productId       String    // Product ID or Crop ID
  eventType       EventType
  timestamp       DateTime
  location        String?
  actorId         String
  actor           User      @relation(fields: [actorId], references: [id])
  cropId          String?
  crop            Crop?     @relation(fields: [cropId], references: [id], onDelete: SetNull)
  metadata        String?   // Additional JSON data
  transactionHash String?   @unique // Blockchain transaction hash
  blockNumber     Int?
  verified        Boolean   @default(false)
  createdAt       DateTime  @default(now())

  @@index([productId])
  @@index([eventType])
  @@index([transactionHash])
  @@index([cropId])
}
```

**Enums:**
- `EventType`: PLANTED, HARVESTED, PROCESSED, PACKAGED, SHIPPED, RECEIVED, QUALITY_CHECK, RETAIL, SOLD

**Blockchain Integration:**
- `transactionHash`: On-chain transaction reference
- `blockNumber`: Ethereum/Polygon block number
- `verified`: Blockchain confirmation status

**Polymorphic Relations:**
- Can reference either Crop OR Product via `productId`
- Optional `cropId` for direct crop-level events

**Indexes:**
- `productId`: Product/crop event history
- `eventType`: Event type filtering
- `transactionHash`: Blockchain verification
- `cropId`: Crop-specific events

---

### 7. AuditLog Model

**Purpose**: Compliance and security audit trail.

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  action    String
  entity    String
  entityId  String
  userId    String
  timestamp DateTime @default(now())
  details   Json?

  @@index([userId])
  @@index([timestamp])
  @@index([entity])
}
```

**Use Cases:**
- GDPR compliance
- Security incident investigation
- Change tracking
- Regulatory reporting

---

## Enums Reference

### Role
```prisma
enum Role {
  ADMIN
  FARMER
  DISTRIBUTOR
  CONSUMER
}
```

### CropType
```prisma
enum CropType {
  WHEAT
  RICE
  CORN
  SOYBEANS
  BARLEY
  OATS
  CANOLA
  SORGHUM
  OTHER
}
```

### GrowthStage
```prisma
enum GrowthStage {
  PLANTED
  GERMINATION
  VEGETATIVE
  FLOWERING
  FRUITING
  MATURING
  READY_FOR_HARVEST
  HARVESTED
}
```

### EventType
```prisma
enum EventType {
  PLANTED
  HARVESTED
  PROCESSED
  PACKAGED
  SHIPPED
  RECEIVED
  QUALITY_CHECK
  RETAIL
  SOLD
}
```

---

## Relationships Summary

| Parent | Child | Type | onDelete |
|--------|-------|------|----------|
| User | Farm | 1:1 | Cascade |
| Farm | Crop | 1:n | Cascade |
| Crop | Product | 1:n | Cascade |
| Crop | AIPrediction | 1:n | Cascade |
| Crop | SupplyChainEvent | 1:n | SetNull |
| Product | SupplyChainEvent | 1:n | Cascade |
| User | SupplyChainEvent | 1:n | - |

---

## Indexes Optimization

### High-Frequency Queries

```sql
-- User authentication
SELECT * FROM "User" WHERE email = ?;

-- Farmer's farm lookup
SELECT * FROM "Farm" WHERE userId = ?;

-- Farm's crops
SELECT * FROM "Crop" WHERE farmId = ?;

-- Crop predictions
SELECT * FROM "AIPrediction" WHERE cropId = ?;

-- Product supply chain
SELECT * FROM "SupplyChainEvent" WHERE productId = ?;

-- Blockchain verification
SELECT * FROM "SupplyChainEvent" WHERE transactionHash = ?;
```

### Index Strategy

1. **Foreign Keys**: All FK fields indexed
2. **Unique Constraints**: email, sku, qrCode, transactionHash
3. **Filter Fields**: role, type, growthStage, status
4. **Time Series**: timestamp on AuditLog

---

## Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Best Practices

### 1. Query Optimization

```typescript
// ✅ Good: Use select to limit fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true }
});

// ✅ Good: Include related data efficiently
const farms = await prisma.farm.findMany({
  include: { 
    crops: {
      include: { predictions: true }
    }
  }
});

// ❌ Avoid: N+1 queries
const farms = await prisma.farm.findMany();
for (const farm of farms) {
  const crops = await prisma.crop.findMany({ where: { farmId: farm.id }});
}
```

### 2. Transactions

```typescript
// Atomic operations
await prisma.$transaction(async (tx) => {
  const crop = await tx.crop.create({ data: {...} });
  await tx.aIPrediction.create({ data: { cropId: crop.id, ...} });
});
```

### 3. Soft Deletes

Use `status` field instead of hard deletes for audit trail:

```typescript
await prisma.product.update({
  where: { id },
  data: { status: 'EXPIRED' }
});
```

---

## Sample Data Seeding

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.user.create({
  data: {
    email: 'farmer@example.com',
    password: '$2b$10$hashed...',
    firstName: 'John',
    lastName: 'Doe',
    role: 'FARMER',
    farm: {
      create: {
        name: 'Green Valley Farm',
        location: { lat: 40.7, lng: -74.0, address: '123 Farm Rd' },
        size: 50.5,
        certification: 'USDA Organic',
        crops: {
          create: {
            name: 'Wheat Field A',
            type: 'WHEAT',
            plantingDate: new Date(),
            area: 25.0,
          }
        }
      }
    }
  }
});
```

---

## Performance Considerations

### Connection Pooling

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

### Batch Operations

```typescript
// ✅ Efficient: Batch create
await prisma.crop.createMany({
  data: [crop1, crop2, crop3]
});

// ✅ Efficient: Pagination
const crops = await prisma.crop.findMany({
  skip: 20,
  take: 10
});
```

---

## Security Notes

1. **Password Hashing**: Always use bcrypt before saving
2. **Input Validation**: Validate with Zod/Joi before Prisma
3. **SQL Injection**: Prisma provides automatic protection
4. **Access Control**: Implement middleware for row-level security

---

## Future Enhancements

1. **Full-Text Search**: Add PostgreSQL full-text search indexes
2. **Geospatial Queries**: Enable PostGIS for location-based features
3. **Partitioning**: Time-series partitioning for SupplyChainEvent
4. **Materialized Views**: Pre-computed analytics dashboards

---

**Schema Version**: 1.0  
**Last Updated**: 2024-03-13  
**Maintained By**: Backend Team
