# 🏗️ FarmConnect Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FARMCONNECT PLATFORM                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   FARMER     │  │  CONSUMER    │  │ DISTRIBUTOR  │          │
│  │  Dashboard   │  │  Marketplace │  │  Dashboard   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │   SERVICES  │                               │
│                    │    LAYER    │                               │
│                    └──────┬──────┘                              │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │  API Layer  │                               │
│                    │  (Axios)    │                               │
│                    └──────┬──────┘                              │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │  Backend    │                               │
│                    │ (Express)   │                               │
│                    └──────┬──────┘                              │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                   │
│         │                 │                 │                   │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │ PostgreSQL  │  │ Blockchain  │  │ AI Service  │             │
│  │  Database   │  │  (Polygon)  │  │  (Python)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + TypeScript)               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    PAGES LAYER                        │    │
│  │                                                        │    │
│  │  Login.tsx  │  Marketplace.tsx  │  FarmerDashboard   │    │
│  │  Verify.tsx │  Distributor.tsx  │  AdminDashboard    │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                   │
│                             ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   SERVICES LAYER ⭐                    │    │
│  │                                                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │    api.ts   │  │authService  │  │farmService  │   │    │
│  │  │  (Axios)    │  │  (Auth)     │  │  (Farms)    │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │cropService  │  │productSvc   │  │ orderSvc    │   │    │
│  │  │  (Crops)    │  │(Products)   │  │ (Orders)    │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                        │    │
│  │  ┌─────────────┐  ┌─────────────┐                     │    │
│  │  │supplyChain  │  │verifySvc    │                     │    │
│  │  │  (Tracking) │  │  (QR Code)  │                     │    │
│  │  └─────────────┘  └─────────────┘                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                   │
│                             ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   COMPONENTS LAYER                     │    │
│  │                                                        │    │
│  │   Card.tsx  │  Navbar.tsx  │  Sidebar.tsx  │  ...     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Communication Flow

### Example: Consumer Buys Product

```
┌────────────┐      ┌─────────────┐      ┌──────────────┐
│  Component │      │   Service   │      │    Backend   │
│ (Marketplace)      │ (orderSvc)  │      │  (Express)   │
└─────┬──────┘      └──────┬──────┘      └──────┬───────┘
      │                    │                     │
      │  onClick()         │                     │
      ├───────────────────►│                     │
      │                    │                     │
      │                    │ POST /api/orders    │
      │                    ├────────────────────►│
      │                    │                     │
      │                    │            Create Order
      │                    │            in Database
      │                    │                     │
      │                    │   Success Response  │
      │                    │◄────────────────────┤
      │                    │                     │
      │  {success: true}   │                     │
      │◄───────────────────┤                     │
      │                    │                     │
      │  alert("Order ✅") │                     │
      │                    │                     │
      └────────────────────┴─────────────────────┘
```

---

## Team Division & Service Ownership

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER ASSIGNMENTS                         │
│                                                                  │
│  👨‍💻 MEMBER 1                👨‍💻 MEMBER 2                      │
│  Authentication & Users       Farmer Features                   │
│  ┌─────────────────────┐     ┌─────────────────────────────┐   │
│  │ ✓ authService.ts    │     │ ✓ farmService.ts            │   │
│  │ ✓ Login.tsx         │     │ ✓ cropService.ts            │   │
│  │ ✓ Register flow     │     │ ✓ productService.ts         │   │
│  │ ✓ JWT tokens        │     │ ✓ FarmerDashboard.tsx       │   │
│  │ ✓ Role redirects    │     │ ✓ Add Crop/Farm features    │   │
│  └─────────────────────┘     └─────────────────────────────┘   │
│                                                                  │
│  👨‍💻 MEMBER 3                👨‍💻 MEMBER 4                      │
│  Marketplace & Orders         Supply Chain & Blockchain         │
│  ┌─────────────────────┐     ┌─────────────────────────────┐   │
│  │ ✓ orderService.ts   │     │ ✓ supplyChainService.ts     │   │
│  │ ✓ Marketplace.tsx   │     │ ✓ verifyService.ts          │   │
│  │ ✓ Browse products   │     │ ✓ DistributorDashboard.tsx  │   │
│  │ ✓ Shopping cart     │     │ ✓ Verify.tsx                │   │
│  │ ✓ Order tracking    │     │ ✓ QR verification           │   │
│  └─────────────────────┘     └─────────────────────────────┘   │
│                                                                  │
│  NO CONFLICTS! Each developer owns their services.              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Through System

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Farmer  │────►│  Crop    │────►│ Product  │────►│Consumer  │
│  Plants  │     │  Grows   │     │ Created  │     │  Buys    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                         │
                                         ▼
                                  ┌──────────┐
                                  │Distributor│
                                  │ Transports│
                                  └──────────┘
                                         │
                                         ▼
                                  ┌──────────┐
                                  │ Blockchain│
                                  │  Records  │
                                  └──────────┘
                                         │
                                         ▼
                                  ┌──────────┐
                                  │ Consumer │
                                  │ Verifies │
                                  └──────────┘
```

---

## API Request Flow with JWT

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED REQUEST                     │
│                                                              │
│  Component calls service method                              │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ authService  │                                           │
│  │ .login()     │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    api.ts    │                                           │
│  │  (Axios)     │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────┐                  │
│  │  Request Interceptor                 │                  │
│  │  ─────────────────────────────────── │                  │
│  │  1. Get token from localStorage      │                  │
│  │  2. Add to Authorization header      │                  │
│  │  3. Return config with headers       │                  │
│  └──────┬───────────────────────────────┘                  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────┐                  │
│  │  Backend receives request            │                  │
│  │  ─────────────────────────────────── │                  │
│  │  1. Extract JWT from header          │                  │
│  │  2. Verify token signature           │                  │
│  │  3. Decode user info                 │                  │
│  │  4. Attach user to request           │                  │
│  └──────┬───────────────────────────────┘                  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────┐                  │
│  │  Protected route executes            │                  │
│  │  (user available in req.user)        │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Dependencies

```
┌──────────────────────────────────────────────────────────┐
│                   MODULE DEPENDENCIES                     │
│                                                           │
│  components/                                              │
│    └── Uses: services/                                    │
│                                                           │
│  pages/                                                   │
│    └── Uses: services/, components/                       │
│                                                           │
│  services/                                                │
│    ├── api.ts (no dependencies)                          │
│    ├── authService.ts → depends on: api.ts               │
│    ├── farmService.ts → depends on: api.ts               │
│    ├── cropService.ts → depends on: api.ts               │
│    ├── productService.ts → depends on: api.ts            │
│    ├── orderService.ts → depends on: api.ts              │
│    ├── supplyChainService.ts → depends on: api.ts        │
│    └── verifyService.ts → depends on: api.ts             │
│                                                           │
│  NO CIRCULAR DEPENDENCIES!                                │
│  Clean, one-way dependency flow.                          │
└──────────────────────────────────────────────────────────┘
```

---

## File Organization by Feature

```
apps/web/src/
│
├── 📁 auth/                    # All authentication code
│   ├── Login.tsx
│   └── services/authService.ts
│
├── 📁 farmer/                  # All farmer features
│   ├── FarmerDashboard.tsx
│   ├── services/farmService.ts
│   ├── services/cropService.ts
│   └── services/productService.ts
│
├── 📁 marketplace/             # All e-commerce features
│   ├── Marketplace.tsx
│   ├── services/orderService.ts
│   └── services/productService.ts
│
├── 📁 supply-chain/           # All logistics features
│   ├── DistributorDashboard.tsx
│   ├── services/supplyChainService.ts
│   └── services/verifyService.ts
│
└── 📁 shared/                 # Shared utilities
    ├── services/api.ts
    ├── components/
    └── types/
```

---

**This architecture enables:**
✅ Parallel development  
✅ Zero merge conflicts  
✅ Easy testing  
✅ Clear ownership  
✅ Fast onboarding  

**Your team is ready to build! 🚀**
