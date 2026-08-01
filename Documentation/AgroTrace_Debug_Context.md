# AgroTrace AI (FarmConnect) — Project Context for Debugging

This document is meant to be given to an AI coding agent (Antigravity) as background before it starts
debugging or modifying this codebase. It covers the system architecture, tech stack, data flows, and a
full log of errors already diagnosed and fixed in a prior session — so the agent doesn't need to
rediscover them.

---

## 1. System Overview

AgroTrace AI (FarmConnect) is a full-stack **npm workspaces monorepo** for agricultural management,
AI-driven yield forecasting, and blockchain-based supply chain traceability.

### Tiers (high to low)
1. **Client Tier** — React Web App (port 5173, HTTP/Cookies) and Flutter mobile app (HTTP/JWT)
2. **Orchestration Tier** — Express API Gateway (port 3001), the single entry point for all clients
3. **Service Tier**
   - Prisma ORM Database Client → Prisma queries
   - Hardhat local blockchain node (port 8545) → JSON-RPC via Ethers.js
   - FastAPI AI Service (port 8000) → REST API requests
4. **Storage Tier**
   - Neon Cloud PostgreSQL (via TCP/IP)
   - Local Polygon-simulated ledger (via Hardhat "state commit")

---

## 2. Components & Tech Stack

### `apps/web` — Web Frontend
- React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- All API calls go through a services layer (`apps/web/src/services/api.ts`), e.g. `authService`,
  `cropService`, `productService` — components never call Axios directly
- Auth flow: HTTP + Cookies (web) vs HTTP + JWT (mobile)

### `apps/backend` — Backend API
- Node.js, Express, TypeScript, Ethers.js, Prisma Client
- Handles auth, RBAC routing, DB access via Prisma, calls to Python AI service, and anchors
  transaction hashes on-chain

### `services/ai-service` — AI Yield Prediction Service
- Python, FastAPI, Scikit-learn, Uvicorn
- Random Forest Regressor predicting yield (kg/hectare) from N, P, K, pH, avg temp, rainfall
- Swagger docs at `http://localhost:8000/docs`

### `services/blockchain` — Blockchain Ledger Simulator
- Solidity, Hardhat, Ethers.js
- `SupplyChain.sol` — logistics checkpoints (harvest, processing, transit, retail)
- `PredictionProvenance.sol` — hashes of AI predictions to prevent tampering
- Simulated local Polygon network at `http://127.0.0.1:8545`

### `packages/prisma` — Centralized Database
- `schema.prisma` connected to Neon Cloud PostgreSQL
- Stores users, farms, crops, marketplace products, geo-verification scans

---

## 3. Key Data Flows

### Flow A — Farmer requests AI yield forecast, anchored on-chain
1. Farmer (frontend) → Backend: `POST` request for prediction on Crop ID
2. Backend → PostgreSQL: fetch crop growth details & soil index → returns crop details
3. Backend → Python AI Service: `POST` soil & weather variables → returns yield prediction (e.g. 5200 kg) + model version
4. Backend generates a SHA-256 hash of (inputs + prediction + model version)
5. Backend → Hardhat Node: anchor prediction hash via Ethers.js JSON-RPC → returns tx hash (e.g. `0x4fbc...`)
6. Backend → PostgreSQL: save prediction + blockchain tx metadata (Prisma)
7. Backend → Frontend: render prediction with "Blockchain Verified" badge

### Flow B — Consumer scans QR code to trace origin
1. Consumer (mobile/web) → Backend: `GET` crop timeline & origin for Batch SKU
2. Backend → PostgreSQL: query supply chain checkpoints & geo-logs → return records
3. Backend → Hardhat Node: verify tx hashes match DB logs → confirm block & matching hashes
4. Backend → PostgreSQL: log geo-location of the scan (security tracking)
5. Backend → Frontend: render interactive map of origin farm + transit journey

---

## 4. Startup Orchestration (`start.bat`)

1. Check `.env` files exist (copy from `.env.example` if missing)
2. Verify Node.js, Python, and ports `8545`, `3001`, `5173`, `8000` are free
3. Run `npm install` and `npm run db:generate` (generates 3 Prisma Clients)
4. Start services in order:
   - Hardhat node (own window) → poll port `8545` until open → deploy Solidity contracts
   - Backend API (port 3001)
   - Web frontend (port 5173)
   - Python AI service (port 8000)

---

## 5. Errors Already Diagnosed & Fixed (Prior Session)

> These are **resolved** — listed so the agent doesn't re-flag or re-"fix" them, and so it understands
> conventions already established in the codebase (e.g. `.cmd` usage, bracket syntax in echo statements).

### Category 1 — Windows Batch Script & Execution Policy

**Error 1: PowerShell execution policy block**
- Symptom: terminal closed immediately during Node dependency checks
- Cause: bare `npm`/`npx` in `.bat` invoked Node's `.ps1` wrapper, blocked by restricted PowerShell execution policy
- Fix: use `npm.cmd` / `npx.cmd` explicitly to force native cmd wrappers

**Error 2: Batch parser crash (`. was unexpected at this time`)**
- Symptom: crash right after `[5/6] Checking AI Service Python Dependencies...`
- Cause: cmd.exe misparses parentheses inside `if` blocks; `echo ...(Python not available).` had a `)` that cmd read as closing the `if` block, so the trailing `.` became an invalid next command
- Fix: replaced parentheses with square brackets, e.g. `[Python not available]`

**Error 3: Direct `npx.cmd` exits parent terminal**
- Symptom: terminal closed during step `4/6` (Prisma Client generation)
- Cause: calling `npx.cmd` directly inside a subdirectory changed execution context; on completion it terminated the parent shell
- Fix: replaced with workspace-level commands run from root, e.g. `call npm.cmd run db:generate`

### Category 2 — Network & Environment Configuration

**Error 4: `ECONNREFUSED 127.0.0.1:8545`**
- Symptom: backend/contract deploy refused connection on Hardhat's port
- Cause: fixed 6-second startup delay was too short for Hardhat to compile & initialize JSON-RPC
- Fix: dynamic polling loop using `netstat` to wait (up to 15s) until port 8545 is actually open before deploying

**Error 5: Environment variable overwrite conflict**
- Symptom: blockchain interactions failed with credential errors
- Cause: `packages/prisma/.env` auto-loaded by Prisma Client contained a placeholder private key
  (`"your-private-key-here"`) that overwrote the correct backend dev private key (`0xac09...2ff80`)
- Fix: synchronized root `.env`, backend `.env`, and Prisma `.env` to matching correct values; bound
  blockchain provider explicitly to `127.0.0.1` (IPv4) to avoid Windows IPv6 resolution issues

### Category 3 — React Frontend & Session Sync

**Error 6: Missing `authService` import**
- Symptom: silent build failure / crash on page load
- Cause: `apps/web/src/contexts/AuthContext.tsx` used `authService` without importing it
- Fix: added `import authService from '../services/authService'`

**Error 7: Session check data structure mismatch**
- Symptom: user session never restored on page reload (always redirected to landing page)
- Cause: `AuthContext.tsx` expected `authService.getMe()` to return `{ success, data }`, but the
  service actually returns the raw `user` object directly
- Fix: updated `AuthContext.tsx` to handle the direct user object

### Category 4 — Windows File Locking & Backend Downtime

**Error 8: `EPERM: operation not permitted` (Prisma generate)**
- Symptom: Prisma generation fails at step `4/6`: `unlink ...query_engine-windows.dll.node`
- Cause: Windows locks binaries in memory; if a previous backend instance is still running in another
  window, Prisma can't overwrite the loaded query engine DLL
- Fix: close all active terminals to release file handles before rerunning `start.bat`; added a
  `[HINT]` log in `start.bat` explaining this scenario

**Error 9: Frontend `ERR_CONNECTION_REFUSED` on port 3001**
- Symptom: login/register calls fail with "Could not connect to the backend server"
- Cause: downstream effect of Error 8 — startup script aborted at `4/6`, so backend never launched
- Fix: resolved once Error 8 was fixed and `start.bat` completed all steps

---

## 6. Notes for the Agent

- This is a **Windows** development environment; batch script quirks (execution policy, parenthesis
  parsing, `.cmd` vs `.ps1`) are relevant and recurring failure classes here.
- Auth is dual-mode: cookies for the React web client, JWT for the Flutter mobile client — keep this
  distinction in mind when debugging login/session issues; a fix for one path may not apply to the other.
- Three separate Prisma Clients are generated (backend + workspace packages) — schema/client mismatches
  across packages are a plausible source of new errors.
- Env var precedence matters: `packages/prisma/.env` is auto-loaded by Prisma Client and can silently
  override backend `.env` values (see Error 5) — check this first if credentials/config look wrong
  despite correct-looking `.env` files elsewhere.
- If new errors appear in login/signup, check both categories 3 (frontend session/auth code) and 2
  (env var conflicts) as first suspects, since they've been root causes in this codebase before.
