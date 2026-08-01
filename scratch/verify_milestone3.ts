import axios from 'axios';
import { ethers } from 'ethers';
import crypto from 'crypto';

const BACKEND_URL = 'http://localhost:3001/api/v1';
const AI_SERVICE_URL = 'http://localhost:8000';

// Hardhat contract configuration
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const PROVIDER_URL = 'http://127.0.0.1:8545';

const contractAbi = [
  "event PredictionAnchored(bytes32 indexed predictionId, bytes32 indexed hash, uint8 predictionType, uint256 blockNumber)",
  "function predictionHashes(bytes32 predictionId) view returns (bytes32)"
];

// Helper to compute prediction hash deterministically in TypeScript
function computeLocalPredictionHash(inputSnapshot: any, modelVersion: string, predictedYield: number): string {
  const sortedKeys = Object.keys(inputSnapshot).sort();
  const sortedObj: any = {};
  for (const key of sortedKeys) {
    sortedObj[key] = inputSnapshot[key];
  }
  const dataToHash = JSON.stringify({
    inputs: sortedObj,
    modelVersion,
    output: predictedYield
  });
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

async function runVerification() {
  console.log('🏁 Starting Milestone 3 Verification Script...\n');
  
  // Import backend prisma client instance to use the generated types correctly
  const { default: prisma } = await import('../apps/backend/src/database/prisma');

  try {
    // ----------------------------------------------------
    // Clean database test records first
    // ----------------------------------------------------
    console.log('🧼 Cleaning database test records...');
    await prisma.provenanceRecord.deleteMany({});
    await prisma.yieldPrediction.deleteMany({});
    await prisma.cropRecommendation.deleteMany({});
    await prisma.weatherSyncJob.deleteMany({});
    await prisma.weatherSnapshot.deleteMany({});
    await prisma.soilReading.deleteMany({});
    await prisma.nDVIReading.deleteMany({});
    await prisma.crop.deleteMany({});
    await prisma.field.deleteMany({});
    await prisma.farm.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'farmer_m3@example.com' } });

    // ----------------------------------------------------
    // Seed test farmer
    // ----------------------------------------------------
    console.log('👤 Registering test farmer...');
    const regRes = await axios.post(`${BACKEND_URL}/auth/register`, {
      firstName: 'Farmer',
      lastName: 'M3',
      email: 'farmer_m3@example.com',
      password: 'password123',
      role: 'FARMER'
    });

    console.log('🔑 Logging in to retrieve JWT token...');
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'farmer_m3@example.com',
      password: 'password123'
    });
    const cookies = loginRes.headers['set-cookie'] || [];
    const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
    let token = '';
    if (tokenCookie) {
      const tokenVal = tokenCookie.split(';')[0].split('=')[1];
      token = `Bearer ${tokenVal}`;
    }

    console.log('🔗 Setting up farm and field database structures...');
    // Create farm with specific coordinates (using Chhindwara centroid lat/lng)
    const farm = await prisma.farm.create({
      data: {
        name: 'Chhindwara Organic Valley',
        location: { lat: 22.79, lng: 78.88, address: 'Madhya Pradesh' },
        size: 15.5,
        organicCertified: true,
        userId: loginRes.data.data.user.id
      }
    });

    const field = await prisma.field.create({
      data: {
        farmId: farm.id,
        name: 'North Wheat Grid',
        soilType: 'Clay Loam'
      }
    });

    const crop = await prisma.crop.create({
      data: {
        name: 'Kalyansona Wheat',
        type: 'WHEAT',
        plantingDate: new Date('2026-05-01'),
        growthStage: 'VEGETATIVE',
        area: 5.5,
        farmId: farm.id,
        fieldId: field.id
      }
    });

    // ----------------------------------------------------
    // TEST 1: Direct call to AI Service without auth
    // ----------------------------------------------------
    console.log('\n❌ [TEST 1] Testing direct call to AI Service without auth...');
    try {
      await axios.post(`${AI_SERVICE_URL}/predict/yield`, {
        cropType: 'WHEAT',
        area: 5.5,
        rainfall: 800.0,
        soilQuality: { ph: 6.5, nitrogen: 80.0, phosphorus: 40.0, potassium: 50.0 }
      });
      console.log('❌ Failed: direct call succeeded when it should fail!');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Passed: direct call returned 401 Unauthorized.');
      } else {
        console.log(`❌ Failed: expected 401, got ${err.response?.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST 2: HTTP Fail-Closed validation (no soil or weather data)
    // ----------------------------------------------------
    console.log('\n🛡️ [TEST 2] Testing HTTP Fail-Closed behavior (no soil or weather in DB)...');
    try {
      await axios.post(`${BACKEND_URL}/predict/crop/${crop.id}`, {}, {
        headers: { Authorization: token }
      });
      console.log('❌ Failed: gateway allowed prediction without inputs!');
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Passed: Gateway returned 400 Bad Request on missing data.');
      } else {
        console.log(`❌ Failed: expected 400, got ${err.response?.status}`);
      }
    }

    // ----------------------------------------------------
    // TEST 3: Weather backfill from NASA POWER API
    // ----------------------------------------------------
    console.log('\n🌎 [TEST 3] Testing historical weather backfill from NASA POWER API...');
    const backfillRes = await axios.post(
      `${BACKEND_URL}/weather/backfill/${field.id}`,
      {
        startDate: '2026-05-01',
        endDate: '2026-07-15'
      },
      { headers: { Authorization: token } }
    );

    const { weatherSnapshot, jobStatus } = backfillRes.data.data;
    console.log(`- Created weather sync job status: ${jobStatus}`);
    console.log(`- Fetched Temperature: ${weatherSnapshot.temperature} C`);
    console.log(`- Fetched Rainfall: ${weatherSnapshot.rainfall} mm`);
    console.log(`- Weather Data Source: ${weatherSnapshot.source}`);

    if (weatherSnapshot.temperature > 0 && weatherSnapshot.source === 'nasa-power' && jobStatus === 'SUCCESS') {
      console.log('✅ Passed: historical weather backfilled successfully from NASA POWER.');
    } else {
      console.log('❌ Failed: weather backfill details mismatch!');
    }

    // Add required soil readings
    await prisma.soilReading.create({
      data: {
        fieldId: field.id,
        N: 82.0,
        P: 42.0,
        K: 51.0,
        pH: 6.4,
        moisture: 35.0
      }
    });

    // ----------------------------------------------------
    // TEST 4: Gated Sentinel Hub simulation mode check
    // ----------------------------------------------------
    console.log('\n🛰️ [TEST 4] Testing gated Sentinel Hub simulation modes...');
    
    // Gated simulation - NDVI_SIMULATION_MODE = false (Tests real Sentinel Hub path!)
    console.log('- Fetching satellite NDVI with simulation mode disabled (queries Sentinel Hub directly)...');
    try {
      const realSatRes = await axios.post(
        `${BACKEND_URL}/ndvi/satellite-fetch`,
        { fieldId: field.id, date: '2028-09-27' },
        { headers: { Authorization: token, 'x-disable-simulation': 'true' } }
      );
      const realSatData = realSatRes.data.data.ndviReading;
      console.log(`- Returned NDVI Score: ${realSatData.ndviScore}`);
      console.log(`- Satellite Provider: ${realSatData.provider}`);
      
      if (realSatData.provider === 'sentinel-2') {
        console.log('✅ Passed: satellite NDVI successfully resolved via Sentinel Hub API with "sentinel-2" provider label.');
      } else {
        console.log(`❌ Failed: expected sentinel-2 provider, got: ${realSatData.provider}`);
      }
    } catch (err: any) {
      console.log(`❌ Failed: real satellite query failed with error:`, err.response?.data || err.message);
    }

    // Gated simulation - NDVI_SIMULATION_MODE = true
    console.log('- Fetching satellite NDVI with simulation mode enabled...');
    
    // Set environment variable in python process by triggering main.py reload
    // For local test run, we query using NDVI_SIMULATION_MODE=true in .env
    // (Our Python satellite_ndvi.py reads NDVI_SIMULATION_MODE from its own env, which is set to true in setup)
    const ndviFetchRes = await axios.post(
      `${BACKEND_URL}/ndvi/satellite-fetch`,
      { fieldId: field.id, date: '2028-09-27' }, // Coordinates + date result in cloud < 20%
      { headers: { Authorization: token, 'x-force-simulation': 'true' } }
    );

    const { ndviReading } = ndviFetchRes.data.data;
    console.log(`- Returned NDVI Score: ${ndviReading.ndviScore}`);
    console.log(`- Satellite Provider: ${ndviReading.provider}`);
    console.log(`- Cloud Cover Percent: ${ndviReading.cloudCoverPercent}%`);

    if (ndviReading.ndviScore > 0 && ndviReading.provider === 'simulated') {
      console.log('✅ Passed: satellite NDVI successfully ingested with simulated provider label.');
    } else {
      console.log('❌ Failed: satellite NDVI returned incorrect values or provider!');
    }

    // ----------------------------------------------------
    // TEST 5: Fail-closed cloud cover rejection
    // ----------------------------------------------------
    console.log('\n☁️ [TEST 5] Testing fail-closed cloud cover rejection (cloud > 20%)...');
    try {
      // Date '2026-06-15' deterministic hash results in cloud cover > 20%
      await axios.post(
        `${BACKEND_URL}/ndvi/satellite-fetch`,
        { fieldId: field.id, date: '2026-06-15' },
        { headers: { Authorization: token, 'x-force-simulation': 'true' } }
      );
      console.log('❌ Failed: satellite fetch succeeded on a cloudy date!');
    } catch (err: any) {
      if (err.response && err.response.status === 400 && err.response.data?.message?.includes('cloud cover')) {
        console.log(`✅ Passed: rejected with error: "${err.response.data.message}"`);
      } else {
        console.log(`❌ Failed: expected 400 cloud cover rejection, got:`, err.response?.data);
      }
    }

    // ----------------------------------------------------
    // TEST 6: Yield prediction generation and updated dataSource label assertions
    // ----------------------------------------------------
    console.log('\n🔮 [TEST 6] Generating yield predictions and verifying updated dataSource labels...');
    
    // Clear previous predictions/provenance records to bypass the 48-hour debounce check
    console.log('- Clearing previous test predictions to bypass the 48-hour debounce gate...');
    await prisma.provenanceRecord.deleteMany({});
    await prisma.yieldPrediction.deleteMany({});
    
    // Base model prediction
    const basePredRes = await axios.post(
      `${BACKEND_URL}/predict/crop/${crop.id}`,
      {},
      { headers: { Authorization: token } }
    );
    const basePrediction = basePredRes.data.data.prediction;
    console.log(`- Base Prediction Yield: ${basePrediction.predictedYield} kg/ha`);
    console.log(`- Base Model Data Source: ${basePrediction.metadata.dataSource}`);

    // Fusion model prediction
    // Triggering satellite NDVI fetch on a date that triggers stress (ndviScore < 0.3)
    // Date '2026-05-15' deterministic hash yields ndviScore < 0.3
    const fusionFetchRes = await axios.post(
      `${BACKEND_URL}/ndvi/satellite-fetch`,
      { fieldId: field.id, date: '2028-09-27' },
      { headers: { Authorization: token, 'x-force-simulation': 'true' } }
    );
    
    const fusionPrediction = fusionFetchRes.data.data.prediction;
    console.log(`- Fusion Prediction Yield: ${fusionPrediction.predictedYield} kg/ha`);
    console.log(`- Fusion Model Data Source: ${fusionPrediction.metadata.dataSource}`);

    if (
      basePrediction.metadata.dataSource === 'real-weather-partial-synthetic-npk' &&
      fusionPrediction.metadata.dataSource === 'real-weather-partial-synthetic-npk-simulated-ndvi'
    ) {
      console.log('✅ Passed: new precise descriptive data source labels verified.');
    } else {
      console.log('❌ Failed: dataSource labels do not match expected schema!');
    }

    // ----------------------------------------------------
    // TEST 7: Blockchain event listener and confirmation sync
    // ----------------------------------------------------
    console.log('\n⛓️ [TEST 7] Waiting for blockchain transaction confirmation and event listener sync...');
    let confirmed = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const predObj = await prisma.yieldPrediction.findUnique({
        where: { id: basePrediction.id }
      });
      if (predObj && predObj.provenanceStatus === 'CONFIRMED') {
        confirmed = true;
        console.log(`- Updated status: ${predObj.provenanceStatus}`);
        console.log(`- Tx Hash: ${predObj.txHash}`);
        break;
      }
    }

    if (confirmed) {
      console.log('✅ Passed: provenance status successfully synced to CONFIRMED on block mine.');
    } else {
      console.log('❌ Failed: transaction was not confirmed or synced within 15 seconds!');
    }

    // ----------------------------------------------------
    // TEST 8: Cryptographic provenance validation and historical record immutability
    // ----------------------------------------------------
    console.log('\n🧮 [TEST 8] Verifying cryptographic input hash determinism...');
    
    const provRecord = await prisma.provenanceRecord.findFirst({
      where: { predictionId: basePrediction.id }
    });

    if (provRecord) {
      const locallyComputedHash = computeLocalPredictionHash(
        provRecord.inputSnapshot,
        provRecord.modelVersion,
        basePrediction.predictedYield
      );

      console.log(`- Debug inputSnapshot:`, JSON.stringify(provRecord.inputSnapshot));
      console.log(`- Debug modelVersion:`, provRecord.modelVersion);
      console.log(`- Debug predictedYield:`, basePrediction.predictedYield);
      
      console.log(`- Local computed hash: ${locallyComputedHash}`);
      console.log(`- Database saved hash: ${basePrediction.predictionHash}`);

      if (locallyComputedHash === basePrediction.predictionHash) {
        console.log('✅ Passed: input snapshots match locally computed hash deterministically.');
      } else {
        console.log('❌ Failed: verification hash mismatch!');
      }
    } else {
      console.log('❌ Failed: ProvenanceRecord not found!');
    }

    console.log('\n🏁 Milestone 3 Verification Completed.');

  } catch (error: any) {
    console.error('❌ Verification run failed with error:', error.message || error);
    if (error.response) {
      console.error('API Response error details:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
