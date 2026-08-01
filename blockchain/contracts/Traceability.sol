// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Traceability {
    address public owner;

    // Struct to store a supply chain event
    struct SupplyChainEvent {
        string batchId; // Order ID or Product SKU
        string eventType; // e.g. "SOLD", "IN_TRANSIT", "DELIVERED"
        string metadataHash; // SHA-256 hash of the off-chain MongoDB document
        uint256 timestamp;
        address recordedBy;
    }

    // Mapping from batchId to its array of events
    mapping(string => SupplyChainEvent[]) private batchHistory;

    // Mapping for authorized relayer actors
    mapping(address => bool) public authorizedActors;

    // Events emitted for off-chain indexing
    event EventRecorded(
        string indexed batchId,
        string eventType,
        string metadataHash,
        uint256 timestamp,
        address recordedBy
    );
    event ActorAuthorized(address actor);
    event ActorRevoked(address actor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedActors[msg.sender], "Not authorized to record events");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedActors[msg.sender] = true; // Owner is authorized by default
    }

    function authorizeActor(address actor) external onlyOwner {
        authorizedActors[actor] = true;
        emit ActorAuthorized(actor);
    }

    function revokeActor(address actor) external onlyOwner {
        authorizedActors[actor] = false;
        emit ActorRevoked(actor);
    }

    function recordEvent(
        string memory batchId,
        string memory eventType,
        string memory metadataHash
    ) external onlyAuthorized {
        SupplyChainEvent memory newEvent = SupplyChainEvent({
            batchId: batchId,
            eventType: eventType,
            metadataHash: metadataHash,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        });

        batchHistory[batchId].push(newEvent);

        emit EventRecorded(
            batchId,
            eventType,
            metadataHash,
            block.timestamp,
            msg.sender
        );
    }

    function getBatchHistory(string memory batchId) external view returns (SupplyChainEvent[] memory) {
        return batchHistory[batchId];
    }
}
