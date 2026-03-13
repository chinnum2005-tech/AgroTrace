# AgriTrace AI Backend - Quick Start Guide 🚀

## ⚡ Setup in 5 Steps

### Step 1: Install Dependencies
```bash
cd apps/backend
npm install
```

This installs all required packages:
- Express.js (web framework)
- Prisma (database ORM)
- JWT & bcryptjs (authentication)
- Zod (validation)
- TypeScript & type definitions
- And all other dependencies

---

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings:
# - DATABASE_URL=postgresql://user:pass@localhost:5432/agritrace
# - JWT_SECRET=your-secret-key-here
# - PORT=3001
```

**Required Environment Variables:**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agritrace
JWT_SECRET=change-this-to-a-random-string-in-production
CORS_ORIGIN=http://localhost:5173
```

---

### Step 3: Setup Database

**Option A: Using Docker (Recommended)**
```bash
# From project root
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**
```bash
# Create database manually
createdb agritrace

# Or use psql
psql -U postgres
CREATE DATABASE agritrace;
```

Then run migrations:
```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
```

---

### Step 4: Seed Database (Optional)
```bash
cd ../prisma
npm install
npm run seed
```

This creates sample data with test users:
- **Admin**: admin@agritrace.ai / Admin123!
- **Farmer**: farmer@agritrace.ai / Farmer123!
- **Consumer**: consumer@agritrace.ai / Consumer123!

---

### Step 5: Start Server
```bash
cd ../backend
npm run dev
```

Server starts on `http://localhost:3001`

✅ **Health check**: http://localhost:3001/health  
📚 **API docs**: See API_DOCS.md

---

## 🧪 Test the API

### 1. Register a User
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

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 3. Create a Farm
```bash
curl -X POST http://localhost:3001/api/farms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Test Farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Farm Road"
    },
    "size": 100.5
  }'
```

### 4. Create a Crop
```bash
curl -X POST http://localhost:3001/api/crops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Wheat Field",
    "type": "WHEAT",
    "plantingDate": "2024-03-01T00:00:00Z",
    "area": 50.0
  }'
```

### 5. Verify Product (Public Endpoint)
```bash
curl http://localhost:3001/api/verify/AGRITRACE-WHEAT-001
```

---

## 🛠️ Common Issues

### Error: Cannot find module 'express'
**Solution**: Run `npm install` in the backend directory

### Error: DATABASE_URL not set
**Solution**: Create `.env` file with proper DATABASE_URL

### Error: Prisma Client not generated
**Solution**: Run `npx prisma generate`

### Error: Database does not exist
**Solution**: Create the database or update DATABASE_URL

### Error: Port 3001 already in use
**Solution**: Change PORT in .env or stop the process using port 3001

### CORS errors
**Solution**: Update CORS_ORIGIN in .env to match your frontend URL

---

## 📋 Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

---

## 🔗 Useful Links

- **API Documentation**: [API_DOCS.md](./API_DOCS.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Database Schema**: [../../packages/prisma/schema.prisma](../../packages/prisma/schema.prisma)
- **Postman Collection**: Import endpoints from API_DOCS.md

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Health endpoint responds: http://localhost:3001/health
- [ ] Can register a new user
- [ ] Can login and receive JWT token
- [ ] Can access protected routes with token
- [ ] Can create farms and crops
- [ ] Can verify products by QR code
- [ ] Database queries work correctly
- [ ] Validation rejects invalid input
- [ ] Error handling returns proper status codes

---

## 🎯 Next Steps

Once the backend is running:

1. ✅ Test all endpoints using cURL or Postman
2. ✅ Connect the frontend React app
3. ✅ Connect the Flutter mobile app
4. ✅ Deploy to production (Heroku, Railway, Render, etc.)
5. ✅ Set up CI/CD pipeline
6. ✅ Monitor logs and performance

---

**Happy Coding! 🎉**
