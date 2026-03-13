# 🌾 AgriTrace AI - Agriculture Supply Chain Platform

A comprehensive blockchain-enabled platform for tracking agricultural products from farm to consumer with AI-powered yield prediction.

![AgriTrace AI](./docs/banner.png)

## 🚀 Features

### Core Capabilities

- **🏭 Farm Management**: Register and manage farms with geolocation data
- **🌱 Crop Tracking**: Monitor crops through all growth stages
- **🤖 AI Yield Prediction**: Machine learning-based crop yield forecasting
- **⛓️ Blockchain Traceability**: Immutable supply chain event recording on Polygon
- **📱 QR Code Verification**: Consumer-facing product verification system
- **👥 Role-Based Access**: Multi-stakeholder platform (Admin, Farmer, Distributor, Consumer)

### Technology Stack

#### Frontend Web
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for modern UI
- **React Router** for navigation
- **Axios** for API communication

#### Mobile App
- **Flutter** for cross-platform mobile
- **Provider** for state management
- **QR Scanner** for product verification
- **Material Design 3** UI

#### Backend API
- **Node.js** with Express
- **TypeScript** for type safety
- **JWT Authentication** with role-based access
- **Prisma ORM** for database operations
- **REST API** architecture

#### Database
- **PostgreSQL** relational database
- **Prisma** for schema management and migrations

#### AI Service
- **Python FastAPI** microservice
- **Scikit-learn** for ML predictions
- **Random Forest Regressor** model

#### Blockchain
- **Solidity** smart contracts
- **Hardhat** development environment
- **Polygon Mumbai** testnet deployment
- **Ethers.js** for contract interaction

## 📁 Project Structure

```
FarmConnect/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Application pages
│   │   │   ├── services/       # API integration
│   │   │   └── types.ts        # TypeScript types
│   │   ├── package.json
│   │   └── Dockerfile
│   └── mobile/                 # Flutter mobile app
│       ├── lib/
│       │   ├── screens/        # Mobile screens
│       │   ├── services/       # API services
│       │   └── main.dart       # App entry point
│       └── pubspec.yaml
├── services/
│   ├── ai-service/             # Python AI microservice
│   │   ├── models/             # ML models
│   │   ├── main.py             # FastAPI application
│   │   └── Dockerfile
│   └── blockchain/             # Smart contracts
│       ├── contracts/          # Solidity contracts
│       ├── scripts/            # Deployment scripts
│       ├── test/               # Contract tests
│       └── hardhat.config.ts
├── packages/
│   └── prisma/                 # Database layer
│       ├── schema.prisma       # Database schema
│       └── package.json
├── docker-compose.yml          # Container orchestration
├── turbo.json                  # Turborepo configuration
├── package.json                # Root workspace config
└── README.md                   # This file
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 10.2.0
- **Docker** & **Docker Compose**
- **PostgreSQL** (or use Docker)
- **Python 3.11+** (for AI service)
- **Flutter SDK** (for mobile app)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd FarmConnect
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start all services with Docker**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Generate Prisma client**
```bash
npm run db:generate
```

### Development Mode

Run all services in development mode:

```bash
npm run dev
```

This starts:
- Web frontend on `http://localhost:5173`
- Backend API on `http://localhost:3001`
- AI service on `http://localhost:8000`
- PostgreSQL on `localhost:5432`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
Body: { email, password, firstName, lastName, role }

POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

### Farm Endpoints

```
GET /api/farms/my-farm      # Get farmer's farm (FARMER only)
POST /api/farms             # Create farm (FARMER only)
GET /api/farms              # Get all farms (ADMIN only)
```

### Crop Endpoints

```
GET /api/crops/my-crops     # Get farmer's crops (FARMER only)
POST /api/crops             # Create crop (FARMER only)
PATCH /api/crops/:id/stage  # Update growth stage
GET /api/crops              # Get all crops (ADMIN only)
```

### Prediction Endpoints

```
GET /api/predictions/crop/:cropId
Returns AI yield prediction for specific crop
```

### Supply Chain Endpoints

```
POST /api/supply-chain/events          # Record event (DISTRIBUTOR only)
GET /api/supply-chain/events/:productId # Get product history
```

### Verification Endpoints

```
GET /api/verify/:qrCode      # Verify product by QR code
POST /api/verify/generate/:cropId # Generate QR code for crop
```

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main entities:

- **User**: Authentication and user data
- **Farm**: Agricultural land information
- **Crop**: Crop planting and growth tracking
- **AIPrediction**: ML yield predictions
- **SupplyChainEvent**: Blockchain-verified events
- **AuditLog**: Compliance and auditing

See `packages/prisma/schema.prisma` for complete schema.

## ⛓️ Blockchain Integration

### Smart Contract Functions

```solidity
recordEvent(productId, eventType, location, metadata)
getProductEvents(productId)
getEventCount(productId)
getLatestEvent(productId)
verifyEvent(productId, eventType, timestamp, actor)
```

### Deploying Contracts

```bash
cd services/blockchain
npm install

# Deploy to local Hardhat network
npm run deploy

# Deploy to Polygon Mumbai testnet
npm run deploy:mumbai
```

## 🤖 AI Service

The AI yield prediction service uses:
- **Random Forest Regressor** with 100 estimators
- Features: crop type, area, weather data, soil quality
- Returns predicted yield (kg/hectare) with confidence score

### Running AI Service

```bash
cd services/ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

Access API docs at: `http://localhost:8000/docs`

## 📱 Mobile App

### Features

- **Farmer Mode**: Register farms, add crops, view predictions
- **Consumer Mode**: Scan QR codes to verify products
- **Offline Support**: Local data caching
- **Secure Storage**: JWT token management

### Running Mobile App

```bash
cd apps/mobile
flutter pub get
flutter run
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests
cd apps/backend && npm test

# Blockchain tests
cd services/blockchain && npm test

# AI service tests
cd services/ai-service && pytest
```

## 🔐 Security

- **JWT tokens** with 15-minute expiry
- **Bcrypt** password hashing (10 rounds)
- **Helmet.js** security headers
- **Rate limiting** (100 requests per 15 minutes)
- **CORS** protection
- **SQL injection prevention** (Prisma ORM)
- **Role-based access control** (RBAC)

## 🚢 Deployment

### Production Environment Variables

Update `.env` with production values:

```env
DATABASE_URL=postgresql://user:pass@host:5432/agritrace
JWT_SECRET=your-super-secret-key
NODE_ENV=production
POLYGON_RPC_URL=https://polygon-rpc.com
```

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📊 Monitoring

Health check endpoints:
- Backend: `http://localhost:3001/health`
- AI Service: `http://localhost:8000/health`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the AgriTrace AI Team

## 🙏 Acknowledgments

- Polygon for blockchain infrastructure
- FastAPI for the excellent Python framework
- Prisma for database tooling
- Flutter team for the mobile framework

---

**Need Help?** Check out our [documentation](./docs/) or open an issue.
