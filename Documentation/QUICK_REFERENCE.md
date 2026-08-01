# 🚀 Quick Reference - FarmConnect Services

## Import Pattern

```typescript
// Import specific service
import { authService } from '../services/authService';
import { productService } from '../services/productService';

// OR import all services
import { authService, productService, orderService } from '../services';
```

---

## 🔐 Authentication Service

```typescript
import { authService } from '../services/authService';

// Register new user
await authService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CONSUMER' // or 'FARMER', 'DISTRIBUTOR', 'ADMIN'
});

// Login
await authService.login('email@example.com', 'password');

// Logout (client-side)
authService.logout();

// Check if authenticated
const isAuth = authService.isAuthenticated();
```

---

## 🏡 Farm Service

```typescript
import { farmService } from '../services/farmService';

// Get farmer's farm
const farm = await farmService.getMyFarm();

// Create farm
await farmService.createFarm({
  name: 'Green Valley Farm',
  location: { lat: 10.5, lng: 76.2, address: 'Kerala, India' },
  size: 5.5, // hectares
  certification: 'USDA Organic'
});

// Update farm
await farmService.updateFarm(farmId, { name: 'New Name' });

// Delete farm
await farmService.deleteFarm(farmId);
```

---

## 🌱 Crop Service

```typescript
import { cropService } from '../services/cropService';

// Get crops
const crops = await cropService.getMyCrops();

// Create crop
await cropService.createCrop({
  name: 'Organic Rice Batch 1',
  type: 'RICE',
  plantingDate: '2026-03-01',
  area: 2.5,
  farmId: 'farm-uuid'
});

// Update growth stage
await cropService.updateCropStage(cropId, 'READY_FOR_HARVEST');

// Get AI prediction
const prediction = await cropService.getPrediction(cropId);
```

---

## 🛒 Product Service (Marketplace)

```typescript
import { productService } from '../services/productService';

// Browse all products (public)
const products = await productService.getAllProducts();

// Get farmer's products
const myProducts = await farmService.getMyProducts();

// Create product from harvested crop
await productService.createProduct({
  name: 'Premium Organic Rice',
  cropId: 'crop-uuid',
  quantity: 500, // kg
  batchNumber: 'BATCH-001',
  expiryDate: '2027-03-01'
});
```

---

## 📦 Order Service

```typescript
import { orderService } from '../services/orderService';

// Consumer places order
await orderService.createOrder({
  productId: 'product-uuid',
  quantity: 2,
  totalAmount: 240, // ₹
  shippingAddress: '123 Main St, Bangalore'
});

// Consumer views orders
const orders = await orderService.getMyOrders();

// Farmer views orders for their products
const farmerOrders = await orderService.getFarmerOrders();

// Update order status
await orderService.updateOrderStatus(orderId, 'SHIPPED');

// Cancel order
await orderService.cancelOrder(orderId);
```

---

## 🚚 Supply Chain Service

```typescript
import { supplyChainService } from '../services/supplyChainService';

// Record event (e.g., shipment picked up)
await supplyChainService.recordEvent({
  productId: 'product-uuid',
  eventType: 'SHIPPED', // PLANTED, HARVESTED, PACKAGED, etc.
  location: 'Warehouse A, Mumbai',
  metadata: { temperature: '18°C', driver: 'John' }
});

// Get product's journey timeline
const events = await supplyChainService.getProductEvents(productId);

// Get all events
const allEvents = await supplyChainService.getAllEvents();
```

---

## ✅ Verification Service

```typescript
import { verifyService } from '../services/verifyService';

// Verify product via QR code
const result = await verifyService.verifyProduct('QR-CODE-123');

// Generate QR code for crop
const qrResponse = await verifyService.generateQRCode(cropId, 'url');
console.log(qrResponse.qrCode); // URL or base64

// Download QR as image
await verifyService.downloadQR(cropId);
```

---

## 🎯 Common Button Click Handlers

### Marketplace "Buy Now" Button
```typescript
<button
  onClick={async () => {
    try {
      await orderService.createOrder({
        productId: product.id,
        quantity: 1,
        totalAmount: product.price,
        shippingAddress: 'Default Address'
      });
      alert('✅ Order placed!');
    } catch (error) {
      alert('❌ Failed to place order');
    }
  }}
>
  Buy Now
</button>
```

### Farmer "Generate QR" Button
```typescript
<button
  onClick={async () => {
    try {
      const response = await verifyService.generateQRCode(cropId);
      setQrCode(response.qrCode);
      setShowModal(true);
    } catch (error) {
      alert('Failed to generate QR');
    }
  }}
>
  Generate QR Code
</button>
```

### Consumer "Track Order" Button
```typescript
<button
  onClick={async () => {
    try {
      const orders = await orderService.getMyOrders();
      console.log('My orders:', orders.data);
    } catch (error) {
      alert('Failed to load orders');
    }
  }}
>
  Track Orders
</button>
```

### Distributor "Update Shipment" Button
```typescript
<button
  onClick={async () => {
    try {
      await supplyChainService.recordEvent({
        productId: shipment.productId,
        eventType: 'SHIPPED',
        location: currentLocation
      });
      alert('Shipment updated!');
    } catch (error) {
      alert('Failed to update shipment');
    }
  }}
>
  Update Status
</button>
```

---

## 🐛 Error Handling Template

```typescript
try {
  const response = await someService.someMethod(data);
  
  if (response.success) {
    // Success handling
    alert('✅ Success!');
  } else {
    // Business logic error
    alert('❌ ' + response.message);
  }
} catch (error: any) {
  // Network/server error
  const message = error.response?.data?.message || 'Something went wrong';
  alert('❌ ' + message);
}
```

---

## 📊 Response Format

All API responses follow this format:

```typescript
// Success
{
  success: true,
  message: 'Operation successful',
  data: { /* your data */ }
}

// Error
{
  success: false,
  message: 'Error description',
  error: 'Detailed error (optional)'
}
```

---

## 🔑 Quick Tips

1. **Always wrap API calls in try-catch**
2. **Check `response.success` before using data**
3. **Use TypeScript for type safety**
4. **Import only the services you need**
5. **Keep UI logic out of services**

---

**Print this page and keep it at your desk!** 📋
