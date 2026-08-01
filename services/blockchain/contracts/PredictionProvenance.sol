// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionProvenance
 * @dev Smart contract for anchoring crop yield predictions and recommendations
 */
contract PredictionProvenance is AccessControl, Pausable, ReentrancyGuard {
    
    // Prediction types
    enum PredictionType {
        YIELD,
        CROP
    }
    
    // Mapping from prediction ID to its cryptographic hash
    mapping(bytes32 => bytes32) public predictionHashes;
    
    // Mapping from prediction ID to its type
    mapping(bytes32 => PredictionType) public predictionTypes;
    
    // Mapping from prediction ID to anchoring block number
    mapping(bytes32 => uint256) public anchoredBlocks;
    
    // Mapping from prediction ID to anchoring timestamp
    mapping(bytes32 => uint256) public anchoredTimestamps;

    // Roles
    bytes32 public constant WRITER_ROLE = keccak256("WRITER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Contract owner
    address public owner;

    // Events
    event PredictionAnchored(
        bytes32 indexed predictionId,
        bytes32 indexed hash,
        PredictionType predictionType,
        uint256 blockNumber
    );

    constructor() {
        owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(WRITER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not owner");
        _;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Record prediction hash on-chain for verification
     * @param predictionId Unique identifier of prediction (UUID converted to bytes32)
     * @param hash SHA-256 hash of inputs, model version, and outputs
     * @param predictionType Type of prediction (0 = YIELD, 1 = CROP)
     */
    function recordPredictionHash(
        bytes32 predictionId,
        bytes32 hash,
        PredictionType predictionType
    ) public whenNotPaused onlyRole(WRITER_ROLE) nonReentrant returns (bool) {
        require(predictionId != bytes32(0), "Prediction ID cannot be empty");
        require(hash != bytes32(0), "Prediction hash cannot be empty");
        require(predictionHashes[predictionId] == bytes32(0), "Prediction already anchored");

        predictionHashes[predictionId] = hash;
        predictionTypes[predictionId] = predictionType;
        anchoredBlocks[predictionId] = block.number;
        anchoredTimestamps[predictionId] = block.timestamp;

        emit PredictionAnchored(predictionId, hash, predictionType, block.number);
        return true;
    }

    /**
     * @dev Retrieve prediction verification details
     */
    function getPredictionProvenance(bytes32 predictionId)
        public
        view
        returns (
            bytes32 hash,
            PredictionType predictionType,
            uint256 blockNumber,
            uint256 timestamp
        )
    {
        require(predictionHashes[predictionId] != bytes32(0), "Prediction provenance not found");
        return (
            predictionHashes[predictionId],
            predictionTypes[predictionId],
            anchoredBlocks[predictionId],
            anchoredTimestamps[predictionId]
        );
    }
}
