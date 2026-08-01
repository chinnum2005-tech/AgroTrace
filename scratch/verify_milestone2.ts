import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../apps/backend/.env') });

import axios from 'axios';
import { computePredictionHash } from '../apps/backend/src/services/provenance.service';
import { execSync } from 'child_process';

const BACKEND_URL = 'http://localhost:3001/api/v1';
const AI_SERVICE_URL = 'http://localhost:8000';

async function runTests() {
  const prisma = require('../apps/backend/src/database/prisma').default;
  console.log('🏁 Starting Milestone 2 Verification Script...\n');

  let token: string = '';
  let testUser: any = null;
  let testFarm: any = null;
  let testField: any = null;
  let testCrop: any = null;

  try {
    // 0. Clean database test records first to ensure fresh state
    console.log('🧼 Cleaning database test records...');
    await prisma.provenanceRecord.deleteMany({});
    await prisma.yieldPrediction.deleteMany({});
    await prisma.cropRecommendation.deleteMany({});
    await prisma.soilReading.deleteMany({});
    await prisma.weatherSnapshot.deleteMany({});
    await prisma.crop.deleteMany({});
    await prisma.field.deleteMany({});
    await prisma.farm.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'farmer.test@example.com' } });

    // 1. Register & Login test user
    console.log('👤 Registering test farmer...');
    await axios.post(`${BACKEND_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Farmer',
      email: 'farmer.test@example.com',
      password: 'password123',
      role: 'FARMER',
      phone: '+1234567890'
    });

    console.log('🔑 Logging in to retrieve JWT token...');
    const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'farmer.test@example.com',
      password: 'password123'
    });
    const cookies = loginRes.headers['set-cookie'] || [];
    const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
    if (tokenCookie) {
      const tokenVal = tokenCookie.split(';')[0].split('=')[1];
      token = `Bearer ${tokenVal}`;
    }
    testUser = loginRes.data.data.user;

    // Grant roles on localhost blockchain for signers if running
    console.log('🔗 Setting up farm and field database structures...');
    testFarm = await prisma.farm.create({
      data: {
        name: 'Milestone 2 Farm',
        size: 12.5,
        location: 'Nellore, India',
        userId: testUser.id
      }
    });

    testField = await prisma.field.create({
      data: {
        name: 'Field A1',
        soilType: 'Alluvial',
        farmId: testFarm.id
      }
    });

    testCrop = await prisma.crop.create({
      data: {
        name: 'Rice Crop',
        type: 'RICE',
        area: 6.0,
        growthStage: 'VEGETATIVE',
        plantingDate: new Date(),
        fieldId: testField.id,
        farmId: testFarm.id
      }
    });

    // ----------------------------------------------------
    // TEST 1: Direct call to AI Service without Auth
    // ----------------------------------------------------
    console.log('\n❌ [TEST 1] Testing direct call to AI Service without auth...');
    try {
      await axios.post(`${AI_SERVICE_URL}/predict/yield`, {
        cropType: 'RICE',
        area: 6.0,
        rainfall: 800.0,
        soilQuality: { ph: 6.5 }
      });
      console.log('❌ Failed: call succeeded without authorization!');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Passed: direct call returned 401 Unauthorized.');
      } else {
        console.log('❌ Failed: unexpected response', err.message);
      }
    }

    // ----------------------------------------------------
    // TEST 2: HTTP Fail-Closed Smoke Test
    // ----------------------------------------------------
    console.log('\n🛡️ [TEST 2] Testing HTTP Fail-Closed behavior (prediction without soil/weather)...');
    try {
      await axios.post(
        `${BACKEND_URL}/predict/crop/${testCrop.id}`,
        {},
        { headers: { Authorization: token } }
      );
      console.log('❌ Failed: prediction succeeded despite missing soil/weather data!');
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Passed: Gateway returned 400 Bad Request on missing data.');
      } else {
        console.log('❌ Failed: unexpected response', err.message);
      }
    }

    // ----------------------------------------------------
    // Add weather and soil records to fulfill fail-closed gate
    // ----------------------------------------------------
    console.log('\n📝 Adding soil and weather snapshots...');
    const soil = await prisma.soilReading.create({
      data: {
        fieldId: testField.id,
        pH: 6.5,
        N: 70,
        P: 40,
        K: 50,
        moisture: 25.5
      }
    });

    const weather = await prisma.weatherSnapshot.create({
      data: {
        fieldId: testField.id,
        temperature: 26.5,
        humidity: 68.0,
        rainfall: 950.0,
        source: 'API'
      }
    });

    // ----------------------------------------------------
    // TEST 3: Generate prediction & verify provenance metadata
    // ----------------------------------------------------
    console.log('\n🔮 [TEST 3] Generating yield prediction & verifying response structure...');
    const predRes = await axios.post(
      `${BACKEND_URL}/predict/crop/${testCrop.id}`,
      {},
      { headers: { Authorization: token } }
    );

    const { prediction } = predRes.data.data;
    console.log(`- Yield prediction: ${prediction.predictedYield} kg/ha`);
    console.log(`- Model version: ${prediction.modelVersion}`);
    console.log(`- Data source: ${prediction.metadata.dataSource}`);
    console.log(`- Confidence score: ${prediction.confidenceInterval.score}`);
    console.log(`- Initial Provenance Status: ${prediction.provenanceStatus}`);

    if (
      prediction.predictedYield > 0 &&
      prediction.modelVersion === 'random-forest-v1' &&
      prediction.metadata.dataSource === 'real-partial-synthetic-npk' &&
      prediction.provenanceStatus === 'PENDING'
    ) {
      console.log('✅ Passed: prediction fields, confidence, and status verified.');
    } else {
      console.log('❌ Failed: verification mismatch!');
    }

    // ----------------------------------------------------
    // TEST 4: Wait for blockchain confirmation & Event Sync
    // ----------------------------------------------------
    console.log('\n⛓️ [TEST 4] Waiting for blockchain transaction confirmation and sync...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const confirmedPred = await prisma.yieldPrediction.findUnique({
      where: { id: prediction.id }
    });

    console.log(`- Updated status: ${confirmedPred?.provenanceStatus}`);
    console.log(`- Tx Hash: ${confirmedPred?.txHash}`);

    if (confirmedPred?.provenanceStatus === 'CONFIRMED' && confirmedPred.txHash) {
      console.log('✅ Passed: status synced to CONFIRMED on blockchain block mine.');
    } else {
      console.log('❌ Failed: provenance was not confirmed on-chain!');
    }

    // ----------------------------------------------------
    // TEST 5: Verify Deterministic Input Hash
    // ----------------------------------------------------
    console.log('\n🧮 [TEST 5] Verifying deterministic prediction input hash...');
    const inputSnapshot = {
      cropType: testCrop.type,
      area: testCrop.area,
      rainfall: weather.rainfall,
      ph: soil.pH,
      nitrogen: soil.N,
      phosphorus: soil.P,
      potassium: soil.K
    };

    const calculatedHash = computePredictionHash(inputSnapshot, prediction.modelVersion, prediction.predictedYield);
    console.log(`- Local computed hash: ${calculatedHash}`);
    console.log(`- Database saved hash: ${confirmedPred?.predictionHash}`);

    if (calculatedHash === confirmedPred?.predictionHash) {
      console.log('✅ Passed: hashes match deterministically.');
    } else {
      console.log('❌ Failed: local hash and database hash differ!');
    }

    // ----------------------------------------------------
    // TEST 6: NDVI Ingestion and Fusion Triggering
    // ----------------------------------------------------
    console.log('\n📡 [TEST 6] Ingesting stress-flagged NDVI reading & verifying fusion trigger...');
    const ndviRes = await axios.post(
      `${BACKEND_URL}/ndvi`,
      {
        fieldId: testField.id,
        red: 0.4, // red: 0.4, nir: 0.5 -> NDVI = 0.11 (stress flag true)
        nir: 0.5,
        imageSource: 'Sentinel-2'
      },
      { headers: { Authorization: token } }
    );

    const { fusionTriggered, prediction: fusionPred } = ndviRes.data.data;
    console.log(`- Stress flag calculated: ${ndviRes.data.data.ndviReading.stressFlag}`);
    console.log(`- Fusion trigger fired: ${fusionTriggered}`);
    
    if (fusionTriggered && fusionPred) {
      console.log(`- Fusion prediction yield: ${fusionPred.predictedYield} kg/ha`);
      console.log(`- Fusion data source: ${fusionPred.metadata.dataSource}`);
      console.log('✅ Passed: NDVI stress correctly triggered yield re-forecasting.');
    } else {
      console.log('❌ Failed: NDVI stress did not trigger dynamic yield prediction!');
    }

    // ----------------------------------------------------
    // TEST 7: NDVI Ingestion Debouncing (48 hours)
    // ----------------------------------------------------
    console.log('\n⏳ [TEST 7] Testing 48h debouncer for NDVI Fusion triggers...');
    const duplicateNdviRes = await axios.post(
      `${BACKEND_URL}/ndvi`,
      {
        fieldId: testField.id,
        red: 0.4,
        nir: 0.5,
        imageSource: 'Sentinel-2'
      },
      { headers: { Authorization: token } }
    );

    const { fusionTriggered: dupTriggered } = duplicateNdviRes.data.data;
    console.log(`- Second fusion trigger fired: ${dupTriggered}`);

    if (!dupTriggered) {
      console.log('✅ Passed: second trigger debounced successfully.');
    } else {
      console.log('❌ Failed: debouncing did not suppress rapid duplicate triggers!');
    }

    // ----------------------------------------------------
    // TEST 8: Blockchain Offline Fail-Soft
    // ----------------------------------------------------
    console.log('\n🔌 [TEST 8] Testing fail-soft blockchain handling (Offline RPC simulation)...');
    // Set RPC_URL to offline port in process.env
    process.env.RPC_URL = 'http://localhost:9999';

    // Create a new crop to bypass debouncer or change inputs
    const testCrop2 = await prisma.crop.create({
      data: {
        name: 'Corn Crop',
        type: 'CORN',
        area: 4.5,
        growthStage: 'VEGETATIVE',
        plantingDate: new Date(),
        fieldId: testField.id,
        farmId: testFarm.id
      }
    });

    const offlinePredRes = await axios.post(
      `${BACKEND_URL}/predict/crop/${testCrop2.id}`,
      {},
      { headers: { Authorization: token } }
    );

    const offlinePred = offlinePredRes.data.data.prediction;
    console.log(`- Prediction generated: ${offlinePred.predictedYield} kg/ha`);
    console.log(`- Provenance status: ${offlinePred.provenanceStatus}`);

    if (offlinePred.predictedYield > 0 && offlinePred.provenanceStatus === 'PENDING') {
      console.log('✅ Passed: prediction successfully returned; fail-soft did not crash gateway.');
    } else {
      console.log('❌ Failed: offline handler crashed or returned invalid status.');
    }

  } catch (error: any) {
    console.error('❌ Verification script crashed with error:', JSON.stringify(error.response?.data || error.message || error));
  } finally {
    console.log('\n🏁 Milestone 2 Verification Completed.');
  }
}

runTests();
