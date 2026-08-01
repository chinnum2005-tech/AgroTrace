import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class BlockchainService {
  private abi = [
    "function recordEvent(string memory batchId, string memory eventType, string memory metadataHash) external",
    "function getBatchHistory(string memory batchId) external view returns (tuple(string batchId, string eventType, string metadataHash, uint256 timestamp, address recordedBy)[])",
    "event EventRecorded(string indexed batchId, string eventType, string metadataHash, uint256 timestamp, address recordedBy)"
  ];

  // Helper: Generates a SHA-256 hash of a metadata object
  generateMetadataHash(metadata: any): string {
    const jsonString = JSON.stringify(metadata);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  // Helper: Get network mode
  private getNetworkMode(): 'local' | 'amoy' {
    const mode = process.env.BLOCKCHAIN_NETWORK;
    if (mode === 'amoy') return 'amoy';
    // Default to local if unset or explicitly 'local'
    return 'local';
  }

  // Helper: Fetch dynamic contract address
  private getContractAddress(): string | null {
    const mode = this.getNetworkMode();
    if (mode === 'amoy') {
      return process.env.TRACEABILITY_CONTRACT_ADDRESS || null;
    } else {
      const addressPath = path.join(__dirname, '../../../../blockchain/contract-address.json');
      if (fs.existsSync(addressPath)) {
        try {
          const addressData = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
          return addressData.Traceability || null;
        } catch (e) {
          console.error('[BlockchainService] Error reading contract-address.json', e);
          return null;
        }
      }
      return null;
    }
  }

  // Helper: Construct contract instance dynamically
  private async getContract(): Promise<ethers.Contract | null> {
    const mode = this.getNetworkMode();
    const contractAddress = this.getContractAddress();

    if (!contractAddress) {
      if (mode === 'amoy') {
        throw new Error('TRACEABILITY_CONTRACT_ADDRESS is missing in amoy mode');
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
      rpcUrl = 'http://127.0.0.1:8545';
      // Use Hardhat's default Account #0. Never exposed/used in amoy.
      privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      return new ethers.Contract(contractAddress, this.abi, wallet);
    } catch (error) {
      if (mode === 'amoy') {
        throw new Error(`Failed to initialize ethers contract: ${error}`);
      }
      return null;
    }
  }

  /**
   * Records a supply chain event on the blockchain
   */
  async recordEvent(batchId: string, eventType: string, metadata: any): Promise<{ txHash: string; metadataHash: string; simulated?: boolean }> {
    const mode = this.getNetworkMode();
    const metadataHash = this.generateMetadataHash(metadata);
    let contract: ethers.Contract | null = null;

    try {
      contract = await this.getContract();
    } catch (error) {
      // getContract only throws in Amoy mode
      console.error('[BlockchainService] Contract Initialization Hard Fail (Amoy):', error);
      throw error;
    }

    if (!contract) {
      // This is local mode missing address or offline node
      console.warn('[BlockchainService] Contract not reachable in local mode. Executing SIMULATED FALLBACK.');
      const fakeHash = '0x' + crypto.randomBytes(32).toString('hex');
      return { txHash: fakeHash, metadataHash, simulated: true };
    }

    try {
      console.log(`[BlockchainService] Submitting tx for batchId: ${batchId}, eventType: ${eventType} on ${mode}...`);
      
      const tx = await contract.recordEvent(batchId, eventType, metadataHash);
      const confirmations = mode === 'amoy' ? 3 : 1;
      const receipt = await tx.wait(confirmations);

      console.log(`[BlockchainService] Tx confirmed in block ${receipt.blockNumber}: ${receipt.hash}`);
      
      return {
        txHash: receipt.hash,
        metadataHash,
        simulated: false
      };
    } catch (error) {
      if (mode === 'amoy') {
        console.error('[BlockchainService] Amoy Tx Hard Fail:', error);
        throw new Error('Blockchain transaction failed on Amoy');
      } else {
        console.warn('[BlockchainService] Local Tx Failed, falling back to SIMULATED:', error);
        const fakeHash = '0x' + crypto.randomBytes(32).toString('hex');
        return { txHash: fakeHash, metadataHash, simulated: true };
      }
    }
  }
}

export const blockchainService = new BlockchainService();
