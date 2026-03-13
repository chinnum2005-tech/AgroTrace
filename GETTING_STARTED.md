# 🚀 Getting Started with AgriTrace AI

This guide will help you get the platform up and running in minutes.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd FarmConnect
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Generate a secure JWT secret (optional but recommended)
# On Linux/Mac:
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# On Windows PowerShell:
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Add-Content .env "JWT_SECRET=$jwtSecret"
```

### Step 4: Start All Services with Docker

```bash
docker-compose up -d
```

Wait for services to start (about 30 seconds).

### Step 5: Run Database Migrations

```bash
# This sets up all database tables
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### Step 6: Verify Everything is Running

Check service health:

```bash
# Backend API
curl http://localhost:3001/health

# AI Service
curl http://localhost:8000/health
```

Or open in your browser:
- **Web Frontend**: http://localhost:5173
- **Backend Health**: http://localhost:3001/health
- **AI Service Docs**: http://localhost:8000/docs

## 🎯 First Steps

### Create Your First User

Use the web interface or API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "FARMER"
  }'
```

Save the returned JWT token for subsequent requests.

### Register a Farm

```bash
curl -X POST http://localhost:3001/api/farms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Green Valley Farm",
    "description": "Organic vegetable farm",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Farm Road"
    },
    "size": 50.5,
    "certification": "USDA Organic"
  }'
```

### Add a Crop

```bash
curl -X POST http://localhost:3001/api/crops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Wheat Field A",
    "type": "WHEAT",
    "variety": "Hard Red Winter",
    "plantingDate": "2024-03-15T00:00:00Z",
    "area": 25.0
  }'
```

### Get AI Yield Prediction

```bash
curl http://localhost:3001/api/predictions/crop/YOUR_CROP_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 Using the Web Interface

1. Navigate to http://localhost:5173
2. Click "Register" to create an account
3. Choose role: FARMER, DISTRIBUTOR, or CONSUMER
4. Explore the dashboard!

## 🔧 Development Commands

```bash
# Start all services in development mode
npm run dev

# Start only backend
cd apps/backend && npm run dev

# Start only web frontend
cd apps/web && npm run dev

# View database in browser
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:migrate:reset
```

## 🐛 Troubleshooting

### Port Already in Use

If ports 3001, 5173, or 8000 are already in use:

```bash
# Edit .env file
BACKEND_PORT=3002
VITE_BACKEND_URL=http://localhost:3002
```

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps

# View PostgreSQL logs
docker logs agritrace-postgres

# Restart database
docker-compose restart postgres
```

### Permission Issues on Linux/Mac

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Prisma Client Errors

```bash
# Regenerate Prisma client
npm run db:generate
```

## 📚 Next Steps

- Read the [API Documentation](./docs/api.md)
- Deploy smart contracts to Polygon testnet
- Build the mobile app with Flutter
- Customize the UI/UX
- Add more AI training data

## 💡 Tips

1. **Save your JWT token** after login for API requests
2. **Use Prisma Studio** (`npm run db:studio`) to visually browse your database
3. **Check the main README** for detailed architecture information
4. **Join our Discord** for community support (link in main README)

## 🆘 Need Help?

- Check existing [GitHub Issues](https://github.com/your-org/FarmConnect/issues)
- Read the full [Documentation](./docs/)
- Contact: support@agritrace.ai

---

**Happy Farming! 🌾**
