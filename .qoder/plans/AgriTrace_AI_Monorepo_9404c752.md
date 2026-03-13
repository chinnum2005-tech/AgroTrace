# AgriTrace AI Monorepo Architecture Plan

## Project Structure

```
FarmConnect/
├── package.json                 # Root workspace config
├── turbo.json                   # Turborepo configuration
├── docker-compose.yml           # Multi-service orchestration
├── .env.example                 # Environment template
├── README.md                    # Main documentation
├── apps/
│   ├── web/                     # React + Vite + Tailwind dashboard
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Dashboard, Farm, Crop pages
│   │   │   ├── services/       # API client
│   │   │   └── App.tsx
│   │   └── Dockerfile
│   ├── mobile/                  # Flutter application
│   │   ├── pubspec.yaml
│   │   ├── lib/
│   │   │   ├── screens/        # Farmer & Consumer views
│   │   │   ├── services/       # API integration
│   │   │   └── main.dart
│   │   └── Dockerfile
│   └── backend/                 # Node.js Express API
│       ├── package.json
│       ├── src/
│       │   ├── controllers/    # Business logic
│       │   ├── middleware/     # Auth, RBAC
│       │   ├── routes/         # API endpoints
│       │   ├── services/       # External integrations
│       │   └── server.ts
│       └── Dockerfile
├── services/
│   ├── ai-service/             # Python FastAPI ML service
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── models/            # Yield prediction model
│   │   └── Dockerfile
│   └── blockchain/            # Smart contracts
│       ├── contracts/         # SupplyChain.sol
│       ├── scripts/           # Deployment scripts
│       ├── test/              # Contract tests
│       └── hardhat.config.ts
├── packages/
│   └── prisma/                # Database schema & client
│       ├── schema.prisma      # Data models
│       └── migrations/
└── docs/
    └── api.md                 # API documentation
```

## Implementation Phases

### Phase 1: Foundation & Infrastructure
1. Initialize monorepo with Turborepo
2. Configure root package.json and workspaces
3. Set up Docker Compose for all services
4. Create environment configuration templates
5. Establish shared types/utilities (if needed)

### Phase 2: Database Layer
6. Design Prisma schema with models:
   - User (with roles: admin, farmer, distributor, consumer)
   - Farm (location, size, certification)
   - Crop (type, planting date, farm relation)
   - SupplyChainEvent (blockchain transaction reference)
   - AIPrediction (crop yield forecasts)
7. Configure PostgreSQL connection
8. Create initial migration

### Phase 3: Backend API
9. Set up Express server with TypeScript
10. Implement JWT authentication system
11. Build role-based access control middleware
12. Create REST API endpoints:
    - POST /auth/register, /auth/login
    - GET/POST /farms (farmers only)
    - GET/POST /crops (authenticated users)
    - GET /predictions/:cropId (AI service proxy)
    - POST /supply-chain/events (distributors)
    - GET /verify/:qrCode (public verification)
13. Integrate Prisma client
14. Add API validation with Zod/Joi
15. Implement error handling middleware
16. Set up CORS and security headers

### Phase 4: AI Service
17. Create FastAPI application structure
18. Implement scikit-learn yield prediction model:
    - Features: crop type, area, weather data, soil quality
    - Output: predicted yield in kg/hectare
19. Build prediction endpoint: POST /predict/yield
20. Add model training script with simulated data
21. Create health check endpoint
22. Containerize with Docker

### Phase 5: Blockchain Module
23. Initialize Hardhat project with TypeScript
24. Configure for Polygon Mumbai testnet
25. Write SupplyChain smart contract:
    - recordEvent(productId, eventType, timestamp, metadata)
    - getEvents(productId)
    - Event emission for tracking
26. Create deployment scripts
27. Write comprehensive tests
28. Generate contract ABI for backend integration

### Phase 6: Web Frontend
29. Scaffold React + Vite project
30. Configure Tailwind CSS
31. Build authentication pages (Login/Register)
32. Create dashboard layout with sidebar navigation
33. Implement role-based routing:
    - Admin: user management, analytics
    - Farmer: farm management, crop submission
    - Distributor: supply chain event logging
    - Consumer: product verification
34. Build farm management interface
35. Create crop data submission forms
36. Integrate QR code generation library
37. Set up API service layer with Axios
38. Add loading states and error handling

### Phase 7: Mobile App
39. Initialize Flutter project
40. Set up project structure (screens, services, widgets)
41. Implement farmer mobile features:
    - Farm registration
    - Quick crop data entry
42. Implement consumer features:
    - QR code scanner
    - Product verification display
43. Create API service integration
44. Build responsive mobile UI

### Phase 8: Integration & Documentation
45. Wire up all services via Docker Compose
46. Test end-to-end flows:
    - User registration → login
    - Farmer adds farm → submits crop
    - AI prediction generation
    - Distributor records supply chain event
    - Consumer scans QR code
47. Create comprehensive README with:
    - Project overview
    - Quick start guide
    - Architecture diagram
    - API documentation
    - Development workflow
48. Add environment setup instructions
49. Create GitHub Actions CI/CD workflow (optional)

## Key Technical Specifications

### Authentication Flow
- JWT tokens stored in HTTP-only cookies
- Access token: 15min expiry, Refresh token: 7 days
- Role payload included in JWT for RBAC
- Password hashing with bcrypt (10 rounds)

### Database Schema Highlights
- Users table with unique email and role enum
- Farms linked to farmer (userId)
- Crops linked to farms with growth stages
- SupplyChainEvent table referencing blockchain tx hash
- Indexes on frequently queried fields

### Smart Contract Events
```solidity
event SupplyChainEvent(
    string indexed productId,
    EventType eventType,
    uint256 timestamp,
    string metadata
);
```

### API Security
- Helmet.js for security headers
- Rate limiting with express-rate-limit
- Input sanitization
- SQL injection prevention (Prisma handles this)

### Docker Strategy
- Each service has its own Dockerfile
- docker-compose.yml orchestrates all services
- PostgreSQL volume persistence
- Network isolation between services

## Deliverables Checklist

✅ Complete monorepo folder structure  
✅ Turborepo configuration  
✅ PostgreSQL database with Prisma schema  
✅ Express backend with JWT auth & RBAC  
✅ Python FastAPI AI service with sklearn model  
✅ Solidity smart contract for Polygon  
✅ React web dashboard with Tailwind  
✅ Flutter mobile app starter  
✅ Docker Compose setup  
✅ Environment configuration files  
✅ API documentation  
✅ README with setup instructions  

## Next Steps After Plan Approval

Once you approve this plan, I'll implement the entire monorepo structure with all scaffolded code, ready for team collaboration.