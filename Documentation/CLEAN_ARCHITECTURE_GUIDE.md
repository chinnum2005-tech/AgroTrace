# 🏗️ Clean Architecture Guide - FarmConnect

## 📋 Overview

This document describes the clean architecture implemented in FarmConnect that enables a team of 4 developers to work simultaneously without code conflicts.

## 🎯 Architecture Principles

1. **Separation of Concerns** - UI, Business Logic, and Data Access are separate
2. **Single Source of Truth** - One central API configuration
3. **Feature-Based Modularity** - Each feature has its own service file
4. **Type Safety** - TypeScript interfaces for all API calls
5. **Error Handling** - Centralized error handling with try-catch patterns

## 📁 Frontend Folder Structure

```
apps/web/src/
│
├── components/           # Reusable UI components
│   ├── Card.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── ...
│
├── pages/               # Page components (one per feature)
│   ├── Login.tsx
│   ├── Marketplace.tsx
│   ├── FarmerDashboard.tsx
│   ├── DistributorDashboard.tsx
│   └── AdminDashboard.tsx
│
├── services/            # ⭐ CENTRAL API LAYER ⭐
│   ├── api.ts              # Base axios instance
│   ├── authService.ts      # Authentication APIs
│   ├── farmService.ts      # Farm management APIs
│   ├── cropService.ts      # Crop management APIs
│   ├── productService.ts   # Product/marketplace APIs
│   ├── orderService.ts     # Order management APIs
│   ├── supplyChainService.ts # Supply chain tracking APIs
│   ├── verifyService.ts    # QR verification APIs
│   └── index.ts            # Export all services
│
├── types/               # TypeScript type definitions
│   └── types.ts
│
└── App.tsx             # Main routing component
```

## 🔧 Service Layer Pattern

### 1. Base API Instance (`api.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Why?**
- Single place to configure API base URL
- Automatic JWT token attachment
- Consistent error handling

### 2. Feature Services (e.g., `authService.ts`)

```typescript
import api from './api';

export const authService = {
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
};
```

**Why?**
- Organized by feature
- Easy to find and maintain
- Team members can own specific services

### 3. Usage in Components

```typescript
import { authService } from '../services/authService';

// In your component
const handleLogin = async () => {
  try {
    const response = await authService.login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 📦 All Available Services

### `authService`
```typescript
register(userData)        // Register new user
login(email, password)    // Login user
logout()                  // Clear local storage
getCurrentUser()          // Get user from localStorage
isAuthenticated()         // Check if logged in
```

### `farmService`
```typescript
getMyFarm()              // Get farmer's farm
createFarm(farmData)     // Create new farm
updateFarm(id, data)     // Update farm
deleteFarm(id)           // Delete farm
getAllFarms()            // Get all farms (public)
```

### `cropService`
```typescript
getMyCrops()             // Get farmer's crops
createCrop(cropData)     // Create new crop
updateCropStage(id, stage) // Update growth stage
getPrediction(id)        // Get AI yield prediction
updateCrop(id, data)     // Update crop details
deleteCrop(id)           // Delete crop
```

### `productService`
```typescript
getAllProducts()         // Get marketplace products
getMyProducts()          // Get farmer's products
createProduct(data)      // Create product from crop
getProductById(id)       // Get single product
updateProduct(id, data)  // Update product
deleteProduct(id)        // Delete product
```

### `orderService`
```typescript
createOrder(orderData)   // Place new order
getMyOrders()            // Get consumer's orders
getFarmerOrders()        // Get farmer's orders
getOrderById(id)         // Get specific order
updateOrderStatus(id, status) // Update order
cancelOrder(id)          // Cancel order
```

### `supplyChainService`
```typescript
recordEvent(eventData)   // Record supply chain event
getProductEvents(id)     // Get product's journey
getAllEvents()           // Get all events
getEventsByActor(id)     // Get events by user
updateEvent(id, data)    // Update event
```

### `verifyService`
```typescript
verifyProduct(qrCode)    // Verify via QR code
generateQRCode(cropId)   // Generate QR code
getProductByQR(qrCode)   // Get product details
downloadQR(cropId)       // Download QR as image
```

## 👥 Team Division (4 Members)

### 👨‍💻 Member 1: Authentication & User Management
**Owns:** `authService.ts`, Login page, Registration flow

**Tasks:**
- User registration with role selection
- Login/logout functionality
- JWT token management
- Role-based redirects
- Profile management

### 👨‍💻 Member 2: Farmer Features
**Owns:** `farmService.ts`, `cropService.ts`, `productService.ts`

**Tasks:**
- Farm CRUD operations
- Crop management
- Product creation from crops
- QR code generation
- Farmer dashboard UI

### 👨‍💻 Member 3: Marketplace & Orders
**Owns:** `orderService.ts`, `productService.ts`, Marketplace page

**Tasks:**
- Browse products
- Shopping cart
- Order placement
- Order tracking
- Payment integration (future)

### 👨‍💻 Member 4: Supply Chain & Blockchain
**Owns:** `supplyChainService.ts`, `verifyService.ts`

**Tasks:**
- Record supply chain events
- Track product journey
- QR verification
- Blockchain integration
- Distributor dashboard

## 🔄 Example Flow: Consumer Buys Product

### Step 1: Browse Products (Marketplace.tsx)
```typescript
import { productService } from '../services/productService';

const products = await productService.getAllProducts();
setProducts(products.data);
```

### Step 2: Add to Cart (UI State)
```typescript
const addToCart = (product) => {
  setCart([...cart, product]);
};
```

### Step 3: Place Order (Marketplace.tsx)
```typescript
import { orderService } from '../services/orderService';

const handleBuyNow = async (product) => {
  const orderData = {
    productId: product.id,
    quantity: 2,
    totalAmount: product.price * 2,
    shippingAddress: 'User Address'
  };
  
  const response = await orderService.createOrder(orderData);
  alert('Order placed!');
};
```

### Step 4: Track Order
```typescript
const orders = await orderService.getMyOrders();
```

## 🎯 Benefits of This Architecture

### ✅ No Code Conflicts
- Member 1 works on `authService.ts`
- Member 2 works on `cropService.ts`
- Member 3 works on `orderService.ts`
- Member 4 works on `supplyChainService.ts`

**No merge conflicts!**

### ✅ Easy Testing
Each service can be tested independently:
```typescript
describe('authService', () => {
  it('should login user', async () => {
    const response = await authService.login('test@test.com', 'password');
    expect(response.success).toBe(true);
  });
});
```

### ✅ Easy Maintenance
Need to change API endpoint? Update only in the service file.

### ✅ Scalability
Adding new feature? Create new service file:
```typescript
// reviewsService.ts
export const reviewsService = {
  createReview: async (data) => api.post('/api/reviews', data),
  getProductReviews: async (productId) => api.get(`/api/reviews/${productId}`),
};
```

## 🚀 Quick Start for New Team Members

### If you're working on Authentication:
```typescript
import { authService } from '../services/authService';

// Use it
await authService.register(userData);
```

### If you're working on Marketplace:
```typescript
import { productService, orderService } from '../services';

// Use them
const products = await productService.getAllProducts();
await orderService.createOrder(orderData);
```

## 📝 Best Practices

1. **Always use services**, never call `api` directly in components
2. **Handle errors** in components, not in services
3. **Type your data** with TypeScript interfaces
4. **Keep services pure** - no UI logic in services
5. **Use consistent naming** - `get`, `create`, `update`, `delete`

## 🔐 Error Handling Pattern

```typescript
try {
  const response = await authService.login(email, password);
  // Success: redirect user
} catch (error: any) {
  // Error: show message
  alert(error.response?.data?.message || 'Login failed');
}
```

## 📊 API Endpoint Mapping

All endpoints follow RESTful conventions:

```
POST   /api/auth/register     → authService.register()
POST   /api/auth/login        → authService.login()
GET    /api/products          → productService.getAllProducts()
POST   /api/orders            → orderService.createOrder()
GET    /api/supply-chain/:id  → supplyChainService.getProductEvents()
```

---

**Result:** Your team can build features 4x faster with zero conflicts! 🚀
