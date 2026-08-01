import { expect } from "chai";
import { ethers } from "hardhat";
import { PredictionProvenance } from "../typechain-types";

describe("PredictionProvenance", function () {
  let provenance: PredictionProvenance;
  let owner: any;
  let writer: any;
  let unauthorizedUser: any;

  // Generate 32 bytes hex helper
  const randomBytes32 = (prefix: string) => {
    const hex = Buffer.from(prefix.padEnd(32, "x")).toString("hex");
    return "0x" + hex.slice(0, 64);
  };

  const predictionId = randomBytes32("PRED-12345");
  const predictionHash = randomBytes32("HASH-abcde");

  beforeEach(async function () {
    [owner, writer, unauthorizedUser] = await ethers.getSigners();

    // Deploy contract
    const PredictionProvenanceFactory = await ethers.getContractFactory("PredictionProvenance");
    provenance = await PredictionProvenanceFactory.deploy();
    await provenance.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner and admin role", async function () {
      expect(await provenance.owner()).to.equal(owner.address);
      const adminRole = await provenance.DEFAULT_ADMIN_ROLE();
      expect(await provenance.hasRole(adminRole, owner.address)).to.be.true;
    });
  });

  describe("Access Control & Role Setup", function () {
    it("Should allow owner to grant WRITER_ROLE", async function () {
      const writerRole = await provenance.WRITER_ROLE();
      await provenance.grantRole(writerRole, writer.address);
      expect(await provenance.hasRole(writerRole, writer.address)).to.be.true;
    });

    it("Should reject non-writer actions", async function () {
      const provenanceConnected = provenance.connect(unauthorizedUser);
      await expect(
        provenanceConnected.recordPredictionHash(predictionId, predictionHash, 0)
      ).to.be.revertedWithCustomError(provenance, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Prediction Archiving & Verification", function () {
    beforeEach(async function () {
      const writerRole = await provenance.WRITER_ROLE();
      await provenance.grantRole(writerRole, writer.address);
    });

    it("Should successfully record hash as a writer", async function () {
      const provenanceConnected = provenance.connect(writer);
      const tx = await provenanceConnected.recordPredictionHash(predictionId, predictionHash, 0);

      // Verify event emitted
      await expect(tx)
        .to.emit(provenance, "PredictionAnchored")
        .withArgs(predictionId, predictionHash, 0, await getBlockNumber(tx));

      // Query verification details
      const result = await provenance.getPredictionProvenance(predictionId);
      expect(result.hash).to.equal(predictionHash);
      expect(result.predictionType).to.equal(0n); // YIELD
    });

    it("Should reject duplicate prediction records", async function () {
      const provenanceConnected = provenance.connect(writer);
      await provenanceConnected.recordPredictionHash(predictionId, predictionHash, 0);

      await expect(
        provenanceConnected.recordPredictionHash(predictionId, predictionHash, 0)
      ).to.be.revertedWith("Prediction already anchored");
    });
  });

  async function getBlockNumber(tx: any): Promise<number> {
    const receipt = await tx.wait();
    return receipt.blockNumber;
  }
});
