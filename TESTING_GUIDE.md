# 🧪 Quick Testing Guide

## Prerequisites
Make sure you have:
- PostgreSQL database running
- Backend server started
- Frontend dev server started

## Step-by-Step Testing

### 1️⃣ Start the Backend Server
```bash
cd apps/backend
npm run dev
```
Expected output: `🚀 AgriTrace AI Backend running on port 3001`

### 2️⃣ Start the Frontend
```bash
cd apps/web
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### 3️⃣ Test User Registration

**Register as Consumer:**
1. Open http://localhost:5173
2. Click "Login" button
3. Click "Don't have an account? Register"
4. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Role: **Consumer**
5. Click "Register"
6. ✅ Should redirect to **Marketplace**

**Register as Farmer:**
1. Logout (if logged in)
2. Register new account with Role: **Farmer**
3. ✅ Should redirect to **Farmer Dashboard**

**Register as Distributor:**
1. Logout
2. Register new account with Role: **Distributor**
3. ✅ Should redirect to **Distributor Dashboard**

### 4️⃣ Test Marketplace (As Consumer)

1. Login as Consumer
2. Browse products (should see 6 default products)
3. Click "Add to Cart" on any product
   - ✅ Should show success message
4. Click "Buy Now" on any product
   - ✅ Order modal should open
5. Adjust quantity (e.g., 2)
6. Click "Confirm Order"
   - ✅ Should show success message
7. Click "Track Orders" button
   - ✅ Should display order history

### 5️⃣ Test Farmer Dashboard

1. Login as Farmer
2. View dashboard stats
3. Click "Generate QR Code"
   - ✅ Should generate QR code for first crop
4. Click "View My Orders"
   - ✅ Should display orders (or "No orders yet")

### 6️⃣ Test Distributor Dashboard

1. Login as Distributor
2. View shipment statistics
3. Check supply chain timeline
4. Try updating shipment status
   - ✅ Buttons should be interactive

### 7️⃣ Test Currency Display

Throughout the app, verify:
- ✅ All prices show ₹ (Rupees) not $ (Dollars)
- ✅ Admin dashboard shows revenue as ₹3.75L
- ✅ Marketplace prices in ₹
- ✅ Order totals in ₹

### 8️⃣ Test Role-Based Access

1. Login as Consumer
2. Try accessing `/farmer/dashboard` directly
   - ✅ Should redirect to marketplace
3. Logout
4. Login as Farmer
5. Try accessing `/admin/dashboard` directly
   - ✅ Should redirect to farmer dashboard

## Common Issues & Solutions

### Issue: Registration doesn't work
**Solution:** Check backend is running on port 3001

### Issue: Products don't load
**Solution:** 
- Check backend API: `http://localhost:3001/api/products`
- If API fails, mock data will be used automatically

### Issue: Order placement fails
**Solution:**
- Check console for errors
- Verify database connection
- Ensure user is authenticated

### Issue: Wrong redirect after login
**Solution:**
- Clear localStorage
- Check user role in browser console: `JSON.parse(localStorage.getItem('user')).role`

## API Endpoints to Test

You can test these directly in Postman or browser:

```
GET  http://localhost:3001/api/products
     (Public - no auth required)

POST http://localhost:3001/api/auth/register
     Body: { email, password, firstName, lastName, role }

POST http://localhost:3001/api/auth/login
     Body: { email, password }

GET  http://localhost:3001/api/orders/my-orders
     Headers: Authorization: Bearer <token>

GET  http://localhost:3001/api/orders/farmer-orders
     Headers: Authorization: Bearer <token>
```

## Expected Behavior

✅ **Registration** creates user with selected role  
✅ **Login** redirects based on role  
✅ **Marketplace** loads products from API  
✅ **Buy Now** opens order modal  
✅ **Track Orders** shows order history  
✅ **Farmer QR** generates QR codes  
✅ **All prices** display in Rupees (₹)  
✅ **Role access** properly restricted  

## Success Criteria

Your platform is working correctly if:

1. ✅ Users can register with role selection
2. ✅ Login redirects to correct dashboard
3. ✅ Marketplace products load (API or fallback)
4. ✅ Consumers can place orders
5. ✅ Farmers can view their orders
6. ✅ All buttons trigger API calls
7. ✅ Currency displays in Rupees
8. ✅ Role-based access control works

## Demo Flow for Presentation

**Scenario: Farm-to-Consumer Transaction**

1. **Farmer John registers**
   - Selects "Farmer" role
   - Lands on Farmer Dashboard
   - Generates QR code for crops

2. **Consumer Jane registers**
   - Selects "Consumer" role
   - Lands on Marketplace
   - Browses products
   - Buys Organic Rice
   - Tracks order

3. **Distributor Sarah registers**
   - Selects "Distributor" role
   - Views shipments
   - Updates delivery status

4. **Admin monitors**
   - Views system health
   - Checks blockchain verification
   - Reviews all batches

This demonstrates the complete agricultural supply chain flow!

---

**Need Help?** Check `ROLE_BASED_IMPLEMENTATION.md` for detailed documentation.
