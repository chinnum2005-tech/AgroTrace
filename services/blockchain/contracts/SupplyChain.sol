// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SupplyChain
 * @dev Smart contract for tracking agricultural supply chain events on blockchain
 */
contract SupplyChain is AccessControl, Pausable, ReentrancyGuard {
    
    // Event types enum
    enum EventType {
        PLANTED,
        HARVESTED,
        PROCESSED,
        PACKAGED,
        SHIPPED,
        RECEIVED,
        QUALITY_CHECK,
        RETAIL,
        SOLD
    }
    
    // Supply chain event structure
    struct Event {
        string productId;
        EventType eventType;
        uint256 timestamp;
        string location;
        address actor;
        string metadata;
        bool verified;
    }
    
    // Contract owner
    address public owner;
    
    // Global nonce for event hash collision resistance
    uint256 public eventNonce;
    
    // Roles
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Mapping from product ID to array of events
    mapping(string => Event[]) public productEvents;
    
    // Mapping from event hash to existence check
    mapping(bytes32 => bool) public eventRegistry;
    
    // Events
    event SupplyChainEventRecorded(
        string indexed productId,
        EventType eventType,
        uint256 timestamp,
        address indexed actor
    );
    
    event EventVerified(
        string indexed productId,
        bytes32 indexed eventHash
    );
    
    /**
     * @dev Constructor - sets contract owner and roles
     */
    constructor() {
        owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Modifier to restrict access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            hasRole(FARMER_ROLE, msg.sender) || 
            hasRole(DISTRIBUTOR_ROLE, msg.sender) || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller does not have authorization"
        );
        _;
    }
    
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Record a new supply chain event
     * @param productId Unique identifier for the product
     * @param eventType Type of event (see EventType enum)
     * @param location Location where event occurred
     * @param metadata Additional event data (JSON string)
     */
    function recordEvent(
        string memory productId,
        EventType eventType,
        string memory location,
        string memory metadata
    ) public whenNotPaused onlyAuthorized nonReentrant returns (bool) {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(bytes(metadata).length <= 2048, "Metadata length exceeds 2048 bytes");
        
        // Create event
        Event memory newEvent = Event({
            productId: productId,
            eventType: eventType,
            timestamp: block.timestamp,
            location: location,
            actor: msg.sender,
            metadata: metadata,
            verified: true
        });
        
        // Store event
        productEvents[productId].push(newEvent);
        
        // Create unique event hash for registry
        eventNonce++;
        bytes32 eventHash = keccak256(abi.encodePacked(
            productId,
            eventType,
            block.timestamp,
            msg.sender,
            block.number,
            blockhash(block.number - 1),
            metadata,
            eventNonce
        ));
        
        eventRegistry[eventHash] = true;
        
        // Emit event
        emit SupplyChainEventRecorded(
            productId,
            eventType,
            block.timestamp,
            msg.sender
        );
        
        return true;
    }
    
    /**
     * @dev Record multiple supply chain events in a single transaction (MED-012)
     */
    function recordBatchEvents(
        string[] memory productIds,
        EventType[] memory eventTypes,
        string[] memory locations,
        string[] memory metadatas
    ) 
        public 
        whenNotPaused 
        onlyAuthorized
        nonReentrant
        returns (bool) 
    {
        require(
            productIds.length == eventTypes.length && 
            productIds.length == locations.length && 
            productIds.length == metadatas.length,
            "Array lengths must match"
        );
        
        for(uint i = 0; i < productIds.length; i++) {
            // We duplicate the internal logic of recordEvent here to save gas on function calls
            require(bytes(productIds[i]).length > 0, "Product ID cannot be empty");
            require(bytes(locations[i]).length > 0, "Location cannot be empty");
            require(bytes(metadatas[i]).length <= 2048, "Metadata exceeds size limit");
            
            Event memory newEvent = Event({
                productId: productIds[i],
                eventType: eventTypes[i],
                timestamp: block.timestamp,
                location: locations[i],
                actor: msg.sender,
                metadata: metadatas[i],
                verified: true
            });
            
            productEvents[productIds[i]].push(newEvent);
            
            eventNonce++;
            bytes32 eventHash = keccak256(abi.encodePacked(
                productIds[i],
                eventTypes[i],
                block.timestamp,
                msg.sender,
                block.number,
                blockhash(block.number - 1),
                metadatas[i],
                eventNonce
            ));
            
            eventRegistry[eventHash] = true;
            
            emit SupplyChainEventRecorded(
                productIds[i],
                eventTypes[i],
                block.timestamp,
                msg.sender
            );
        }
        
        return true;
    }
    
    /**
     * @dev Get all events for a product
     * @param productId Product identifier
     * @return Array of events for this product
     */
    function getProductEvents(string memory productId) 
        public 
        view 
        returns (Event[] memory) 
    {
        return productEvents[productId];
    }
    
    /**
     * @dev Get event count for a product
     * @param productId Product identifier
     * @return Number of events
     */
    function getEventCount(string memory productId) 
        public 
        view 
        returns (uint256) 
    {
        return productEvents[productId].length;
    }
    
    /**
     * @dev Get specific event by index
     * @param productId Product identifier
     * @param index Event index
     * @return Event details
     */
    function getEventByIndex(string memory productId, uint256 index)
        public
        view
        returns (Event memory)
    {
        require(
            index < productEvents[productId].length,
            "Event index out of bounds"
        );
        return productEvents[productId][index];
    }
    
    /**
     * @dev Verify an event exists in registry by hash
     * @param eventHash The hash of the event
     * @return True if event exists
     */
    function verifyEvent(bytes32 eventHash) public view returns (bool) {
        return eventRegistry[eventHash];
    }
    
    /**
     * @dev Get the latest event for a product
     * @param productId Product identifier
     * @return Latest event details
     */
    function getLatestEvent(string memory productId)
        public
        view
        returns (Event memory)
    {
        uint256 count = productEvents[productId].length;
        require(count > 0, "No events for this product");
        return productEvents[productId][count - 1];
    }
}
