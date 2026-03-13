// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain
 * @dev Smart contract for tracking agricultural supply chain events on blockchain
 */
contract SupplyChain {
    
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
     * @dev Constructor - sets contract owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Modifier to restrict access to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
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
    ) public returns (bool) {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        
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
        bytes32 eventHash = keccak256(abi.encodePacked(
            productId,
            eventType,
            block.timestamp,
            msg.sender
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
     * @dev Verify an event exists in registry
     * @param productId Product identifier
     * @param eventType Event type
     * @param timestamp Event timestamp
     * @param actor Actor address
     * @return True if event exists
     */
    function verifyEvent(
        string memory productId,
        EventType eventType,
        uint256 timestamp,
        address actor
    ) public view returns (bool) {
        bytes32 eventHash = keccak256(abi.encodePacked(
            productId,
            eventType,
            timestamp,
            actor
        ));
        
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
