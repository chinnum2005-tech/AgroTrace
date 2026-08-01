# 🌾 FarmConnect AI (AgroTrace) - Complete Smart Agriculture & Supply Chain Platform

Welcome to **FarmConnect AI** (also known as **AgroTrace**), an enterprise-grade, intelligence-driven farm management, AI yield forecasting, and secure farm-to-fork blockchain tracking platform. 

This platform has been transformed from a prototype into a high-performance startup-ready application, implementing professional design standards, micro-interactions, complete error handling, and robust multi-role dashboards.

---

## 🚀 Key Implemented Features

### 1. 🎨 Premium UI/UX & Design System (Phase 1–5 Upgrade)
* **Toast Notification System** (`apps/web/src/components/Toast.tsx`): Success, error, and informational notification system powered by Framer Motion with custom animations and auto-dismiss.
* **Skeleton Loading System** (`apps/web/src/components/Skeleton.tsx`): Pre-built patterns for cards, tables, stats grids, and timelines to avoid layout shifts.
* **Animated Enhanced Buttons** (`apps/web/src/components/Button.tsx`): Custom variant states (primary, secondary, danger, etc.) with touch optimization, click actions, and loading spinners.
* **Global Error Boundaries** (`apps/web/src/components/ErrorBoundary.tsx`): High-fidelity recovery screens for component-level crashes, preventing the white screen of death.
* **Network Status Detector**: Real-time monitoring of online/offline status with interactive alerts.
* **Demo Mode System**: Contextual banners and pre-loaded demonstration datasets for seamless presentation.

### 2. 🔐 Multi-Role Access Control (RBAC)
We have implemented a role-based login and session security system with four distinct actors:
* **🛡️ Admin (`admin@farmconnect.in` / `admin123`)**: Accesses the full platform suite, modifies system users, oversees farm approvals, and analyzes platform revenue.
* **🌾 Farmer (`farmer@farmconnect.in` / `farmer123`)**: Manages personal farm locations, tracks crops through growth stages, and requests AI yield forecasting predictions.
* **🛒 Distributor (`distributor@farmconnect.in` / `dist123`)**: Adds transit checkpoints and writes immutable logs to the supply chain history.
* **👤 Consumer (`consumer@farmconnect.in` / `consumer123`)**: Accesses the public QR code verification dashboard to trace food back to the origin farm.

### 3. 🖥️ The Protected Admin Panel (7 Screens)
A responsive collapsible navigation drawer (width 280px to 80px) built with Framer Motion that houses:
* **Dashboard Analytics (`/admin/dashboard`)**: Displays performance metrics cards (revenue, active users, products) and interactive SVG charts (user growth and revenue trends).
* **User Management (`/admin/users`)**: Searchable index of database users with status indicators, edit forms, and role modification options.
* **Farm Registry (`/admin/farms`)**: Grid of registered farms showing size, location coordinates, interactive maps, and USDA Organic certification badges.
* **Products Inventory (`/admin/products`)**: Table view of current products, price tracking, verification indicators, and search filtration.
* **System Analytics (`/admin/analytics`)**: Detailed performance analytics with custom range selectors (7 days, 30 days, 12 months).
* **QR Verification Log (`/admin/verifications`)**: Interactive record of customer scan history, geographical lookup data, and blockchain hashes.
* **Configuration Settings (`/admin/settings`)**: Secure panel to adjust system configurations, toggle maintenance modes, and update secrets.

### 4. 🧠 Python FastAPI AI Yield Forecasting Microservice
* **Scikit-learn Regressor**: Machine learning microservice (`services/ai-service/main.py`) powered by a Random Forest Regressor.
* **Smart Parameters**: Predicts yield outputs (kg/hectare) using complex variables such as crop type, farm area, local soil quality index (pH, nitrogen), and weather forecasts.
* **FastAPI Docs**: Automatic Swagger/OpenAPI documentation served at `http://localhost:8000/docs`.

### 5. ⛓️ Blockchain Simulation & QR Code Tracking
* **Smart Contracts**: Solidity contracts (`services/blockchain/contracts/`) to write audit trails.
* **QR Validation Endpoint**: Endpoint to instantly generate scan codes linked to crop details and trace the full route from the harvesting field to transit.

---

## 📁 Technical Architecture & Project Structure

The project is structured as an npm workspaces monorepo:

```
AgroTrace/
├── apps/
│   ├── web/                    # React 18, Vite, Tailwind CSS, Framer Motion
│   │   ├── src/components/     # Design system (Toasts, Skeletons, Buttons, Error Boundaries)
│   │   └── src/pages/admin/    # Protected Admin Layout & Dashboards
│   └── backend/                # Express API with JWT auth and Prisma client hooks
├── services/
│   ├── ai-service/             # FastAPI Python microservice with ML model
│   └── blockchain/             # Hardhat, Solidity contracts for Polygon
├── packages/
│   └── prisma/                 # Central schema configuration and migrations
└── *.bat                       # Startup and setup scripting
```

---

## 🛠️ Installation & Setup (One-Click Launchers)

Setting up the entire multi-service ecosystem is fully automated via Windows batch scripts.

### Step 1: Install Dependencies
Double-click the **`install-all.bat`** file in the root directory. This will install packages across the monorepo, including frontend, backend, database layers, and blockchain.

### Step 2: Configure Environment
Copy the `.env.example` file in the root to `.env` and configure your credentials:
```bash
copy .env.example .env
```

### Step 3: Seed Database
Double-click the **`seed-database.bat`** script. This runs the Prisma database migrations and seeds the DB with the four demo users, products, crop fields, and geolocation coordinates.

### Step 4: Run the Platform
Double-click the **`start.bat`** script. This opens separate consoles to start all services simultaneously:
* **Web Client**: http://localhost:5173
* **Express Backend**: http://localhost:3001
* **AI FastAPI Service**: http://localhost:8000
* **SQLite Database Studio**: Available through packages

---

## 🧪 Testing and Verification

To verify that the system runs smoothly, execute the following commands in the root:

```bash
# Run tests across all workspace apps
npm run test

# Direct backend test execution
cd apps/backend && npm test

# AI service unit tests
cd services/ai-service && pytest
```

---
*Built by the FarmConnect AI / AgroTrace Engineering Team.*
