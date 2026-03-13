# AgriTrace AI - SupplyChain Smart Contract Quick Start 🚀

## ⚡ Setup in 4 Steps

### Step 1: Install Dependencies
```bash
cd services/blockchain
npm install
```

**Installs:**
- hardhat (development environment)
- ethers.js (Ethereum library)
- @openzeppelin/contracts (security libraries)
- @nomicfoundation/hardhat-toolbox (testing tools)

---

### Step 2: Compile the Contract
```bash
npx hardhat compile
```

**Expected Output:**
```
Compiled 1 Solidity file successfully
```

---

### Step 3: Run Tests
```bash
npx hardhat test
```

**Expected Output:**
```
  SupplyChain
    ✔ Should record an event
    ✔ Should get all events for a product
    ✔ Should emit SupplyChainEventRecorded
    ...

  10 passing (2s)
```

---

### Step 4: Deploy Locally
```bash
# Start local Hardhat network
npx hardhat node

# In another terminal, deploy contract
npx hardhat run scripts/deploy.ts
```

**Expected Output:**
```
🚀 Deploying SupplyChain contract...
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ SupplyChain contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 🎯 Quick Usage Example

### Record Your First Event

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Get contract instance
  const contractAddress = "YOUR_DEPLOYED_ADDRESS";
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = SupplyChain.attach(contractAddress);
  
  // Record a planting event
  const tx = await supplyChain.recordEvent(
    "WHEAT-001",                    // Product ID
    0,                              // 0 = PLANTED
    "Green Valley Farm, California", // Location
    JSON.stringify({                // Metadata (JSON)
      farmer: "John Doe",
      seedType: "Organic Winter Wheat",
      area: "50 hectares"
    })
  );
  
  await tx.wait();
  console.log("✅ Event recorded!");
  
  // Query events
  const events = await supplyChain.getProductEvents("WHEAT-001");
  console.log(`Total events: ${events.length}`);
  console.log("First event:", events[0]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 📋 Core Functions

### 1. recordEvent(productId, eventType, location, metadata)

Records a new supply chain event.

**Quick Example:**
```javascript
await contract.recordEvent(
  "PRODUCT-123",
  0,  // PLANTED
  "Farm Location",
  JSON.stringify({ key: "value" })
);
```

**Event Types:**
- `0` - PLANTED
- `1` - HARVESTED
- `2` - PROCESSED
- `3` - PACKAGED
- `4` - SHIPPED
- `5` - RECEIVED
- `6` - QUALITY_CHECK
- `7` - RETAIL
- `8` - SOLD

---

### 2. getProductEvents(productId)

Get all events for a product.

**Quick Example:**
```javascript
const events = await contract.getProductEvents("PRODUCT-123");

events.forEach(event => {
  console.log("Type:", event.eventType);
  console.log("Date:", new Date(Number(event.timestamp) * 1000));
  console.log("Metadata:", event.metadata);
});
```

---

## 🔍 Testing Examples

### Test Recording Events

```javascript
const { expect } = require("chai");

describe("SupplyChain", function () {
  it("Should record and retrieve events", async function () {
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const contract = await SupplyChain.deploy();
    
    // Record event
    await contract.recordEvent(
      "TEST-001",
      0,
      "Test Location",
      "Test Metadata"
    );
    
    // Verify event was recorded
    const events = await contract.getProductEvents("TEST-001");
    expect(events.length).to.equal(1);
    expect(events[0].eventType).to.equal(0);
  });
});
```

---

## 🌐 Interactive Testing with Hardhat Console

### Start Console

```bash
npx hardhat console
```

### Commands to Try

```javascript
// Deploy contract
const SupplyChain = await ethers.getContractFactory("SupplyChain");
const contract = await SupplyChain.deploy();

// Record events
await contract.recordEvent(
  "WHEAT-001",
  0,
  "Farm",
  JSON.stringify({ farmer: "John" })
);

await contract.recordEvent(
  "WHEAT-001",
  1,
  "Farm",
  JSON.stringify({ yield: "225 tons" })
);

// Query events
const events = await contract.getProductEvents("WHEAT-001");
console.log("Events:", events.length);

// Get latest event
const latest = await contract.getLatestEvent("WHEAT-001");
console.log("Latest:", latest);
```

---

## 🚀 Deploy to Testnet

### Polygon Mumbai Testnet

**Step 1: Get Test MATIC**
- Visit: https://faucet.polygon.technology/
- Request free test MATIC

**Step 2: Set Environment Variables**

Create `.env`:
```env
PRIVATE_KEY=your-wallet-private-key
POLYGON_MUMBAI_URL=https://rpc-mumbai.maticvigil.com
```

**Step 3: Deploy**
```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

**Output:**
```
✅ SupplyChain contract deployed to: 0x1234567890123456789012345678901234567890
```

**Step 4: Verify on Polygonscan**
```bash
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

---

## 📊 Complete Workflow Example

### Track Coffee from Farm to Cup

```javascript
async function trackCoffeeJourney() {
  const productId = "COFFEE-001";
  
  console.log("🌱 Planting coffee...");
  await contract.recordEvent(
    productId, 0,
    "Colombian Farm",
    JSON.stringify({
      variety: "Arabica",
      altitude: "1800m",
      farmer: "Maria Rodriguez"
    })
  );
  
  console.log("🍒 Harvesting...");
  await contract.recordEvent(
    productId, 1,
    "Colombian Farm",
    JSON.stringify({
      harvestDate: "2024-01-15",
      method: "Hand-picked"
    })
  );
  
  console.log("🏭 Processing...");
  await contract.recordEvent(
    productId, 2,
    "Processing Facility",
    JSON.stringify({
      method: "Washed",
      dryingTime: "7 days"
    })
  );
  
  console.log("📦 Packaging...");
  await contract.recordEvent(
    productId, 3,
    "Processing Facility",
    JSON.stringify({
      bags: 50,
      weight: "60kg each"
    })
  );
  
  console.log("🚢 Shipping...");
  await contract.recordEvent(
    productId, 4,
    "Port of Cartagena",
    JSON.stringify({
      vessel: "Ocean Carrier",
      destination: "New York"
    })
  );
  
  console.log("📥 Receiving...");
  await contract.recordEvent(
    productId, 5,
    "Brooklyn Warehouse",
    JSON.stringify({
      condition: "Excellent",
      moistureContent: "11%"
    })
  );
  
  console.log("✅ Quality check...");
  await contract.recordEvent(
    productId, 6,
    "Testing Lab",
    JSON.stringify({
      grade: "Specialty Grade",
      cuppingScore: 87
    })
  );
  
  console.log("☕ Retail...");
  await contract.recordEvent(
    productId, 7,
    "Coffee Shop NYC",
    JSON.stringify({
      roastDate: "2024-02-01",
      roastLevel: "Medium"
    })
  );
  
  console.log("💰 Sold to customer!");
  await contract.recordEvent(
    productId, 8,
    "Checkout Counter",
    JSON.stringify({
      price: "$18.00",
      size: "250g"
    })
  );
  
  // Show complete journey
  const events = await contract.getProductEvents(productId);
  console.log(`\n📊 Complete journey: ${events.length} events recorded`);
}
```

---

## ⚠️ Common Issues

### Issue: "Cannot find module 'hardhat'"
```bash
# Solution: Install dependencies
npm install
```

### Issue: "Account not found"
```bash
# Solution: Use Hardhat's default accounts
# Hardhat provides 20 pre-funded accounts for testing
```

### Issue: "Gas estimation failed"
```javascript
// Solution: Check your parameters
// Ensure product ID is not empty
await contract.recordEvent("", 0, "Location", "Metadata"); // ❌ Will fail
await contract.recordEvent("ID-001", 0, "Location", "Metadata"); // ✅ Works
```

### Issue: "Transaction reverted"
```javascript
// Solution: Check event index bounds
await contract.getEventByIndex("PRODUCT-001", 10); // ❌ If only 2 events exist
await contract.getEventByIndex("PRODUCT-001", 0); // ✅ Works
```

---

## 🔗 Integration with Backend

### Node.js Service

```typescript
// apps/backend/src/services/blockchain.service.ts
import { ethers } from 'ethers';
import SupplyChainABI from '../abi/SupplyChain.json';

class BlockchainService {
  private contract: ethers.Contract;
  
  constructor() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS!,
      SupplyChainABI.abi,
      wallet
    );
  }
  
  async recordEvent(productId: string, type: number, metadata: any) {
    const tx = await this.contract.recordEvent(
      productId,
      type,
      "Location",
      JSON.stringify(metadata)
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }
  
  async getProductHistory(productId: string) {
    const events = await this.contract.getProductEvents(productId);
    
    return events.map(event => ({
      type: event.eventType,
      timestamp: new Date(Number(event.timestamp) * 1000),
      location: event.location,
      metadata: JSON.parse(event.metadata)
    }));
  }
}

export default BlockchainService;
```

---

## 📚 Next Steps

1. ✅ Deploy contract to testnet
2. ✅ Record sample events
3. ✅ Integrate with backend API
4. ✅ Create QR code verification system
5. ✅ Build frontend dashboard
6. ✅ Add access control (production)
7. ✅ Deploy to mainnet

---

## 🔗 Additional Resources

- **[SUPPLYCHAIN_DOCS.md](./SUPPLYCHAIN_DOCS.md)** - Full documentation (763 lines)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Hardhat Documentation](https://hardhat.org/docs)** - Development tools
- **[Solidity Documentation](https://docs.soliditylang.org/)** - Language reference
- **[Ethers.js Documentation](https://docs.ethers.org/)** - Ethereum library

---

**Happy Tracking! 🌾**
