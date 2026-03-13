# Prisma Schema Quick Reference

## 🚀 Quick Start Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# View database in browser
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:migrate:reset
```

---

## 📊 Model Cheat Sheet

### User
- **Purpose**: Authentication & RBAC
- **Key Fields**: email, role (enum), password
- **Relations**: Farm (1:1), SupplyChainEvents (1:n)

### Farm
- **Purpose**: Agricultural land registry
- **Key Fields**: location (JSON), size, certification
- **Relations**: User (1:1), Crops (1:n)

### Crop
- **Purpose**: Crop lifecycle tracking
- **Key Fields**: type (enum), growthStage (enum), qrCode
- **Relations**: Farm, Products, Predictions, Events

### Product
- **Purpose**: Packaged goods tracking
- **Key Fields**: sku, batchNumber, status
- **Relations**: Crop, SupplyChainEvents

### AIPrediction
- **Purpose**: ML yield forecasts
- **Key Fields**: predictedYield, confidence, factors (JSON)
- **Relations**: Crop

### SupplyChainEvent
- **Purpose**: Blockchain event logging
- **Key Fields**: eventType (enum), transactionHash, verified
- **Relations**: User (actor), Crop/Product

---

## 🔍 Common Queries (TypeScript)

### Authentication

```typescript
// Login user
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Find farmers only
const farmers = await prisma.user.findMany({
  where: { role: 'FARMER' },
  include: { farm: true }
});
```

### Farm Management

```typescript
// Get farmer's farm with crops
const farm = await prisma.farm.findUnique({
  where: { userId: farmerId },
  include: { 
    crops: {
      include: { predictions: true }
    }
  }
});

// Create farm with location
const farm = await prisma.farm.create({
  data: {
    name: 'Green Valley',
    location: { lat: 40.7, lng: -74.0, address: '123 St' },
    size: 50.5,
    userId: userId
  }
});
```

### Crop Tracking

```typescript
// Update growth stage
await prisma.crop.update({
  where: { id: cropId },
  data: { growthStage: 'FLOWERING' }
});

// Get crops by type
const wheatCrops = await prisma.crop.findMany({
  where: { 
    type: 'WHEAT',
    growthStage: 'READY_FOR_HARVEST'
  }
});
```

### Product & Supply Chain

```typescript
// Record supply chain event
await prisma.supplyChainEvent.create({
  data: {
    productId: productId,
    eventType: 'SHIPPED',
    timestamp: new Date(),
    location: 'Distribution Center',
    actorId: userId,
    transactionHash: '0x...',
    blockNumber: 12345
  }
});

// Get complete product history
const events = await prisma.supplyChainEvent.findMany({
  where: { productId: productId },
  include: { actor: true },
  orderBy: { timestamp: 'asc' }
});
```

### AI Predictions

```typescript
// Get latest prediction for crop
const prediction = await prisma.aIPrediction.findFirst({
  where: { cropId: cropId },
  orderBy: { createdAt: 'desc' }
});

// Create prediction
await prisma.aIPrediction.create({
  data: {
    cropId: cropId,
    predictedYield: 4500.5,
    confidence: 0.87,
    factors: { weather: {...}, soil: {...} }
  }
});
```

---

## 🎯 Indexes Reference

| Model | Indexed Fields | Purpose |
|-------|---------------|---------|
| User | email, role | Login, RBAC filtering |
| Farm | userId | Farmer lookup |
| Crop | farmId, type, growthStage | Farm crops, type filtering |
| Product | cropId, sku, batchNumber, status | Inventory, recalls |
| AIPrediction | cropId | Crop predictions |
| SupplyChainEvent | productId, eventType, cropId, transactionHash | Traceability queries |

---

## ⚠️ Cascade Delete Behavior

```
User deleted → Farm deleted → Crops deleted → Products deleted → Events deleted
                                          ↓
                                   AIPredictions deleted
```

**Note**: SupplyChainEvents use `SetNull` for cropId to preserve blockchain audit trail.

---

## 💡 Pro Tips

### 1. Use Transactions for Multi-Step Operations

```typescript
await prisma.$transaction(async (tx) => {
  const crop = await tx.crop.create({...});
  await tx.aIPrediction.create({
    data: { cropId: crop.id, ... }
  });
});
```

### 2. Batch Inserts for Performance

```typescript
await prisma.crop.createMany({
  data: [crop1, crop2, crop3]
});
```

### 3. Select Only Needed Fields

```typescript
const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true }
});
```

### 4. Pagination for Large Datasets

```typescript
const crops = await prisma.crop.findMany({
  skip: 20,
  take: 10
});
```

---

## 🔧 Troubleshooting

### Regenerate Prisma Client

```bash
npx prisma generate
```

### Reset Database

```bash
npx prisma migrate reset
```

### View Database

```bash
npx prisma studio
```

### Check Migrations Status

```bash
npx prisma migrate status
```

---

## 📋 Enum Values Quick Lookup

### Role
`ADMIN` | `FARMER` | `DISTRIBUTOR` | `CONSUMER`

### CropType
`WHEAT` | `RICE` | `CORN` | `SOYBEANS` | `BARLEY` | `OATS` | `CANOLA` | `SORGHUM` | `OTHER`

### GrowthStage
`PLANTED` → `GERMINATION` → `VEGETATIVE` → `FLOWERING` → `FRUITING` → `MATURING` → `READY_FOR_HARVEST` → `HARVESTED`

### EventType
`PLANTED` | `HARVESTED` | `PROCESSED` | `PACKAGED` | `SHIPPED` | `RECEIVED` | `QUALITY_CHECK` | `RETAIL` | `SOLD`

---

For detailed documentation, see [SCHEMA_DOCS.md](./SCHEMA_DOCS.md)
