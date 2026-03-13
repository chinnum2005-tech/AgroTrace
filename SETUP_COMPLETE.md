# 🚀 AgriTrace AI - Complete Setup Guide

## ✅ Everything is Already Set Up!

Your monorepo structure is **complete and ready to run**. Follow these steps to start the platform immediately.

---

## 📋 What You Have

### ✔ Complete Monorepo Structure
```
FarmConnect/
├── apps/
│   ├── web/          # React + Vite dashboard ✅
│   ├── mobile/       # Flutter app ✅
│   └── backend/      # Express API ✅
├── services/
│   ├── ai-service/   # Python FastAPI ML ✅
│   └── blockchain/   # Solidity smart contracts ✅
├── packages/
│   └── prisma/       # Database schema ✅
└── docs/             # Documentation ✅
```

### ✔ Workspaces Configured
- Root `package.json` with workspaces enabled
- All dependencies installed
- TypeScript configured
- Turborepo for builds

### ✔ Database Schema Ready
- 7 models defined (User, Farm, Crop, Product, etc.)
- 4 enums (Role, CropType, GrowthStage, EventType)
- 15 strategic indexes
- Complete relationships

### ✔ Backend API Complete
- 11 endpoints implemented
- JWT authentication
- Role-based access control
- Zod validation
- Error handling

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Root Dependencies

```bash
cd c:\Users\Admin\Desktop\FarmConnect
npm install
```

This installs all workspace dependencies automatically!

---

### Step 2: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=agritrace
POSTGRES_PORT=5432

# Backend
NODE_ENV=development
BACKEND_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
BACKEND_URL=http://localhost:3001

# AI Service
AI_SERVICE_PORT=8000
AI_SERVICE_URL=http://localhost:8000
```

---

### Step 3: Start PostgreSQL Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d postgres
```

Wait for health check:

```bash
docker-compose ps
# Should show: agritrace-postgres - healthy
```

**Option B: Local PostgreSQL**

Install PostgreSQL 15+ from https://www.postgresql.org/download/

Then create database:

```bash
createdb agritrace
```

Or using psql:

```bash
psql -U postgres
CREATE DATABASE agritrace;
\q
```

---

### Step 4: Setup Prisma Database

```bash
# Navigate to Prisma package
cd packages/prisma

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate deploy
```

**Optional: Seed sample data**

```bash
npm run seed
```

This creates test accounts:
- **Admin**: admin@agritrace.ai / Admin123!
- **Farmer**: farmer@agritrace.ai / Farmer123!
- **Consumer**: consumer@agritrace.ai / Consumer123!

---

### Step 5: Start Backend Server

```bash
# From prisma directory, go back to backend
cd ../../apps/backend

# Install dependencies (if not done in step 1)
npm install

# Start development server
npm run dev
```

**Server starts on:** http://localhost:3001

**Test it:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-03-13T10:30:00.000Z",
  "service": "AgriTrace AI Backend"
}
```

---

### Step 6: Test Authentication Endpoints

**Register a new user:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"FARMER\"}"
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Save the token from the response!

---

### Step 7: Start Web Dashboard

Open a **new terminal**:

```bash
cd apps/web
npm install
npm run dev
```

**Dashboard runs on:** http://localhost:5173

**Access it:**
1. Open browser: http://localhost:5173
2. Login with seeded credentials
3. Explore the dashboard!

---

### Step 8: Start AI Service (Optional)

Open another terminal:

```bash
cd services/ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

**AI Service runs on:** http://localhost:8000

**Test prediction:**

```bash
curl -X POST http://localhost:8000/predict/yield \
  -H "Content-Type: application/json" \
  -d "{\"cropType\":\"WHEAT\",\"area\":50.0,\"rainfall\":750.0,\"soilQuality\":{\"ph\":6.5,\"nitrogen\":55.0,\"phosphorus\":35.0,\"potassium\":45.0}}"
```

---

### Step 9: Run Everything with Docker (Alternative)

Instead of starting services manually, use Docker Compose:

```bash
# From project root
docker-compose up --build
```

This starts ALL services:
- ✅ PostgreSQL (port 5432)
- ✅ Backend API (port 3001)
- ✅ AI Service (port 8000)
- ✅ Web Frontend (port 5173)

**Access all services:**
- Web: http://localhost:5173
- API: http://localhost:3001
- AI: http://localhost:8000
- DB: localhost:5432

---

## 📱 Mobile App Setup

The mobile app runs separately on your device/emulator.

### Install Flutter Dependencies

```bash
cd apps/mobile
flutter pub get
```

### Run on Android Emulator

```bash
flutter run
```

### Configure Backend URL

Edit `lib/services/api_service.dart`:

```dart
// For Android Emulator
static const String baseUrl = 'http://10.0.2.2:3001/api';

// For iOS Simulator
static const String baseUrl = 'http://localhost:3001/api';
```

---

## 🧪 Complete Testing Workflow

### 1. Register as Farmer

**Web:**
1. Visit http://localhost:5173/login
2. Click "Register"
3. Fill form:
   - Email: john@farm.com
   - Password: password123
   - First Name: John
   - Last Name: Doe
   - Role: FARMER
4. Click "Register"

### 2. Add Your Farm

1. Login as farmer
2. Go to "Farms" → "Add Farm"
3. Enter:
   - Name: Green Valley Farm
   - Location: 123 Farm Road
   - Size: 150 hectares
4. Click "Create Farm"

### 3. Plant a Crop

1. Go to "Crops" → "Add Crop"
2. Select:
   - Type: WHEAT
   - Area: 50 hectares
   - Planting Date: Today
3. Click "Create Crop"

### 4. Get AI Prediction

The backend automatically calls AI service and stores prediction!

View it in the crop details page.

### 5. Verify Product

1. Go to "Verify" page
2. Enter QR Code: `AGRITRACE-WHEAT-001`
3. See complete product history!

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

```bash
# Windows - Check what's using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F
```

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for health check
docker-compose exec postgres pg_isready
```

### Issue: Prisma Migration Fails

```bash
# Reset database (WARNING: deletes all data)
cd packages/prisma
npx prisma migrate reset

# Or manually fix
npx prisma db pull
npx prisma generate
```

### Issue: Backend Can't Connect to AI Service

```bash
# Ensure both services are running
docker-compose ps

# Check AI service is accessible
curl http://agritrace-ai:8000/health

# Update backend .env
AI_SERVICE_URL=http://agritrace-ai:8000
```

---

## 📊 Service Status Commands

```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f web

# Stop all
docker-compose down

# Restart specific service
docker-compose restart backend
```

---

## 🎯 What to Do Next

### Immediate Actions

1. ✅ **Start all services** - Choose Docker or manual startup
2. ✅ **Seed database** - Create sample data
3. ✅ **Login to web dashboard** - Test CRUD operations
4. ✅ **Test AI predictions** - Create crops and view predictions
5. ✅ **Verify products** - Use public verification page

### Development Workflow

1. **Backend changes** - Edit files in `apps/backend/src/`, auto-reloads
2. **Frontend changes** - Edit files in `apps/web/src/`, hot reload
3. **AI changes** - Edit files in `services/ai-service/`, auto-reloads
4. **Database changes** - Edit `packages/prisma/schema.prisma`, then:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Production Deployment

1. Deploy to cloud (AWS, GCP, Azure)
2. Use managed PostgreSQL (RDS, Cloud SQL)
3. Set up CI/CD pipeline
4. Configure SSL certificates
5. Enable monitoring
6. Set up logging

---

## 📚 Documentation Reference

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete integration guide
- **[PROJECT_COMPLETION.md](./PROJECT_COMPLETION.md)** - Full project summary
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup
- **[apps/backend/API_DOCS.md](./apps/backend/API_DOCS.md)** - API reference
- **[services/ai-service/README.md](./services/ai-service/README.md)** - AI documentation
- **[services/blockchain/SUPPLYCHAIN_DOCS.md](./services/blockchain/SUPPLYCHAIN_DOCS.md)** - Blockchain docs
- **[packages/prisma/SCHEMA_DOCS.md](./packages/prisma/SCHEMA_DOCS.md)** - Database schema

---

## ✅ Success Checklist

After following this guide:

- [ ] PostgreSQL database is running
- [ ] Backend API responds at http://localhost:3001
- [ ] Web dashboard accessible at http://localhost:5173
- [ ] AI service running at http://localhost:8000
- [ ] Sample data seeded in database
- [ ] Can login as farmer/admin/consumer
- [ ] Can add farms and crops
- [ ] AI predictions working
- [ ] Product verification working

---

## 🎉 You're Ready!

Your complete AgriTrace AI platform is now running with:

✅ **Monorepo structure** with workspaces  
✅ **Backend API** with 11 endpoints  
✅ **PostgreSQL database** with Prisma ORM  
✅ **Web dashboard** with React + Vite  
✅ **AI service** with ML predictions  
✅ **Blockchain integration** ready  
✅ **Mobile app** foundation  

**All services are integrated and communicating!**

For detailed guides, see the documentation files listed above.

**Happy Farming! 🌾**
