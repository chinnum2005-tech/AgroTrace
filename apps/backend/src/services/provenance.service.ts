import crypto from 'crypto';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import prisma from '../database/prisma';

// Human-readable ABI for contract interaction
const PredictionProvenanceABI = [
  "function recordPredictionHash(bytes32 predictionId, bytes32 hash, uint8 predictionType) public returns (bool)",
  "function getPredictionProvenance(bytes32 predictionId) public view returns (bytes32 hash, uint8 predictionType, uint256 blockNumber, uint256 timestamp)"
];

// Helper to get network mode
function getNetworkMode(): 'local' | 'amoy' {
  const mode = process.env.BLOCKCHAIN_NETWORK;
  if (mode === 'amoy') return 'amoy';
  return 'local';
}

// Helper to load deployed contract address dynamically
function getContractAddress(): string | null {
  const mode = getNetworkMode();
  if (mode === 'amoy') {
    return process.env.PROVENANCE_CONTRACT_ADDRESS || null;
  } else {
    const deployInfoPath = path.join(__dirname, '../../../../services/blockchain/deployment-info.json');
    if (fs.existsSync(deployInfoPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(deployInfoPath, 'utf8'));
        return data.provenanceAddress || null;
      } catch (e) {
        console.error('[ProvenanceService] Error reading deployment-info.json', e);
        return null;
      }
    }
    return null;
  }
}

// Helper to construct contract instance dynamically
async function getContract(): Promise<ethers.Contract | null> {
  const mode = getNetworkMode();
  const contractAddress = getContractAddress();

  if (!contractAddress) {
    if (mode === 'amoy') {
      throw new Error('PROVENANCE_CONTRACT_ADDRESS is missing in amoy mode');
    }
    return null; // Fallback permitted in local mode
  }

  let rpcUrl: string;
  let privateKey: string;

  if (mode === 'amoy') {
    rpcUrl = process.env.RPC_URL || '';
    privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY || '';

    if (!rpcUrl || !privateKey) {
      throw new Error('RPC_URL or CONTRACT_OWNER_PRIVATE_KEY is missing in amoy mode');
    }
  } else {
    rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(contractAddress, PredictionProvenanceABI, wallet);
  } catch (error) {
    if (mode === 'amoy') {
      throw new Error(`Failed to initialize ethers provenance contract: ${error}`);
    }
    return null;
  }
}

/**
 * Compute reproducible deterministic SHA-256 hash of inputs, model, and output
 */
export function computePredictionHash(inputSnapshot: any, modelVersion: string, output: number | string): string {
  const sortedInput: any = {};
  Object.keys(inputSnapshot).sort().forEach(key => {
    sortedInput[key] = inputSnapshot[key];
  });
  
  const dataToHash = JSON.stringify({
    inputs: sortedInput,
    modelVersion,
    output
  });
  
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Anchor a prediction hash on-chain asynchronously
 */
export async function anchorPrediction(
  predictionId: string,
  predictionHash: string,
  predictionType: 'YIELD' | 'CROP'
): Promise<string | null> {
  const mode = getNetworkMode();
  let contract: ethers.Contract | null = null;

  try {
    contract = await getContract();
  } catch (error) {
    console.error('[ProvenanceService] Contract Initialization Hard Fail (Amoy):', error);
    await updatePredictionStatus(predictionId, predictionType, 'NOT_CONFIGURED');
    if (mode === 'amoy') {
      throw error;
    }
    return null;
  }

  if (!contract) {
    console.warn('[ProvenanceService] Provenance contract not reachable in local mode. Executing SIMULATED FALLBACK.');
    const fakeHash = '0x' + crypto.randomBytes(32).toString('hex');
    await updatePredictionStatus(predictionId, predictionType, 'SIMULATED', fakeHash);
    return fakeHash;
  }

  try {
    // Format UUID as bytes32
    const cleanUuid = predictionId.replace(/-/g, '');
    const bytes32Id = '0x' + cleanUuid.padEnd(64, '0');
    
    // predictionHash is a 32-byte hex string (sha256 output)
    const bytes32Hash = '0x' + predictionHash;
    const typeInt = predictionType === 'YIELD' ? 0 : 1;

    console.log(`[ProvenanceService] Submitting anchor tx for predictionId: ${predictionId} on ${mode}...`);
    const tx = await contract.recordPredictionHash(bytes32Id, bytes32Hash, typeInt);
    
    const confirmations = mode === 'amoy' ? 3 : 1;

    // Asynchronous mining resolution
    tx.wait(confirmations).then(async (receipt: any) => {
      console.log(`✅ [ProvenanceService] Anchor tx confirmed for prediction ${predictionId} at block ${receipt.blockNumber}`);
      await prisma.provenanceRecord.updateMany({
        where: { predictionId },
        data: {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          confirmedAt: new Date()
        }
      });
      
      await updatePredictionStatus(predictionId, predictionType, 'CONFIRMED', receipt.hash);
    }).catch(async (err: any) => {
      console.error(`❌ [ProvenanceService] Anchor tx reverted for prediction ${predictionId}:`, err);
      await updatePredictionStatus(predictionId, predictionType, 'FAILED');
    });

    return tx.hash;

  } catch (error) {
    if (mode === 'amoy') {
      console.error('[ProvenanceService] Amoy Anchor Tx Hard Fail:', error);
      await updatePredictionStatus(predictionId, predictionType, 'FAILED');
      throw new Error(`Provenance anchoring failed on Amoy: ${error}`);
    } else {
      console.warn('[ProvenanceService] Local Anchor Tx Failed, falling back to SIMULATED:', error);
      const fakeHash = '0x' + crypto.randomBytes(32).toString('hex');
      await updatePredictionStatus(predictionId, predictionType, 'SIMULATED', fakeHash);
      return fakeHash;
    }
  }
}

async function updatePredictionStatus(
  predictionId: string,
  type: 'YIELD' | 'CROP',
  status: 'PENDING' | 'CONFIRMED' | 'SIMULATED' | 'NOT_CONFIGURED' | 'FAILED',
  txHash?: string
) {
  try {
    const updateData: any = { provenanceStatus: status };
    if (txHash) {
      updateData.txHash = txHash;
    }

    if (type === 'YIELD') {
      await prisma.yieldPrediction.updateMany({
        where: { id: predictionId },
        data: updateData
      });
    } else {
      await prisma.cropRecommendation.updateMany({
        where: { id: predictionId },
        data: updateData
      });
    }
  } catch (e) {
    console.error('[ProvenanceService] Failed to update prediction status in DB:', e);
  }
}
