import { expect } from "chai";
import { ethers } from "hardhat";
import { SupplyChain } from "../typechain-types";

describe("SupplyChain", function () {
  let supplyChain: SupplyChain;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const productId = "CROP-001";
  const location = "Farm A, Location B";
  const metadata = '{"temperature": 25, "humidity": 60}';

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChainFactory.deploy();
    await supplyChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await supplyChain.owner()).to.equal(owner.address);
    });
  });

  describe("Event Recording", function () {
    it("Should record an event successfully", async function () {
      await supplyChain.recordEvent(
        productId,
        0, // PLANTED
        location,
        metadata
      );

      const eventCount = await supplyChain.getEventCount(productId);
      expect(eventCount).to.equal(1);
    });

    it("Should emit SupplyChainEventRecorded event", async function () {
      const tx = await supplyChain.recordEvent(
        productId,
        0, // PLANTED
        location,
        metadata
      );

      await expect(tx)
        .to.emit(supplyChain, "SupplyChainEventRecorded")
        .withArgs(productId, 0, await getBlockTimestamp(tx), owner.address);
    });

    it("Should record multiple events for same product", async function () {
      // Record first event
      await supplyChain.recordEvent(productId, 0, location, metadata);
      
      // Record second event
      await supplyChain.recordEvent(productId, 1, location, metadata);
      
      const eventCount = await supplyChain.getEventCount(productId);
      expect(eventCount).to.equal(2);
    });
  });

  describe("Event Retrieval", function () {
    beforeEach(async function () {
      await supplyChain.recordEvent(productId, 0, location, metadata);
    });

    it("Should get all events for a product", async function () {
      const events = await supplyChain.getProductEvents(productId);
      expect(events.length).to.equal(1);
      expect(events[0].productId).to.equal(productId);
      expect(events[0].eventType).to.equal(0);
    });

    it("Should get event by index", async function () {
      const event = await supplyChain.getEventByIndex(productId, 0);
      expect(event.productId).to.equal(productId);
      expect(event.location).to.equal(location);
      expect(event.actor).to.equal(owner.address);
    });

    it("Should get latest event", async function () {
      await supplyChain.recordEvent(productId, 1, "Location 2", "metadata 2");
      
      const latestEvent = await supplyChain.getLatestEvent(productId);
      expect(latestEvent.eventType).to.equal(1);
    });

    it("Should return empty array for non-existent product", async function () {
      const events = await supplyChain.getProductEvents("NON_EXISTENT");
      expect(events.length).to.equal(0);
    });
  });

  describe("Event Verification", function () {
    let tx: any;

    beforeEach(async function () {
      tx = await supplyChain.recordEvent(productId, 0, location, metadata);
    });

    it("Should verify event exists", async function () {
      const timestamp = await getBlockTimestamp(tx);
      
      const exists = await supplyChain.verifyEvent(
        productId,
        0,
        timestamp,
        owner.address
      );
      
      expect(exists).to.be.true;
    });

    it("Should return false for invalid event", async function () {
      const exists = await supplyChain.verifyEvent(
        productId,
        1, // Wrong event type
        await getBlockTimestamp(tx),
        owner.address
      );
      
      expect(exists).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should allow anyone to record events (permissionless)", async function () {
      const supplyChainConnected = supplyChain.connect(addr1);
      
      await supplyChainConnected.recordEvent(
        "CROP-002",
        0,
        location,
        metadata
      );
      
      const eventCount = await supplyChain.getEventCount("CROP-002");
      expect(eventCount).to.equal(1);
    });
  });

  // Helper function to get block timestamp
  async function getBlockTimestamp(tx: any): Promise<number> {
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    return block!.timestamp;
  }
});
