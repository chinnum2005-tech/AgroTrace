# FarmConnect Database Schema - Visual Diagram

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| Farm : "owns (1:1)"
    User ||--o{ SupplyChainEvent : "acts in"
    Farm ||--o{ Crop : "contains"
    Crop ||--o{ Product : "produces"
    Crop ||--o{ AIPrediction : "has predictions"
    Crop ||--o{ SupplyChainEvent : "tracked by"
    Product ||--o{ SupplyChainEvent : "tracked by"

    User {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        Role role
        string phone
        datetime createdAt
        datetime updatedAt
    }

    Farm {
        uuid id PK
        string name
        string description
        json location
        float size
        string certification
        uuid userId FK UK
        datetime createdAt
        datetime updatedAt
    }

    Crop {
        uuid id PK
        string name
        CropType type
        string variety
        datetime plantingDate
        datetime expectedHarvest
        GrowthStage growthStage
        float area
        float estimatedYield
        float actualYield
        uuid farmId FK
        string qrCode UK
        datetime createdAt
        datetime updatedAt
    }

    Product {
        uuid id PK
        string name
        string sku UK
        uuid cropId FK
        float quantity
        datetime packagingDate
        datetime expiryDate
        string batchNumber
        string storageLocation
        string status
        datetime createdAt
        datetime updatedAt
    }

    AIPrediction {
        uuid id PK
        uuid cropId FK
        float predictedYield
        float confidence
        json factors
        datetime createdAt
    }

    SupplyChainEvent {
        uuid id PK
        string productId
        EventType eventType
        datetime timestamp
        string location
        uuid actorId FK
        string metadata
        string transactionHash UK
        int blockNumber
        boolean verified
        datetime createdAt
    }

    AuditLog {
        uuid id PK
        string action
        string entity
        string entityId
        string userId
        datetime timestamp
        json details
    }
```

## Enum Types

```mermaid
classDiagram
    class Role {
        <<enumeration>>
        ADMIN
        FARMER
        DISTRIBUTOR
        CONSUMER
    }

    class CropType {
        <<enumeration>>
        WHEAT
        RICE
        CORN
        SOYBEANS
        BARLEY
        OATS
        CANOLA
        SORGHUM
        OTHER
    }

    class GrowthStage {
        <<enumeration>>
        PLANTED
        GERMINATION
        VEGETATIVE
        FLOWERING
        FRUITING
        MATURING
        READY_FOR_HARVEST
        HARVESTED
    }

    class EventType {
        <<enumeration>>
        PLANTED
        HARVESTED
        PROCESSED
        PACKAGED
        SHIPPED
        RECEIVED
        QUALITY_CHECK
        RETAIL
        SOLD
    }
```

## Data Flow Diagram

```mermaid
flowchart TD
    A[User Registration] --> B{User Role}
    B -->|FARMER| C[Register Farm]
    B -->|DISTRIBUTOR| D[Access Distribution Network]
    B -->|CONSUMER| E[Browse Products]
    
    C --> F[Plant Crops]
    F --> G[Request AI Prediction]
    G --> H[Monitor Growth Stages]
    H --> I[Harvest Crop]
    I --> J[Create Product]
    J --> K[Generate QR Code]
    K --> L[Record Supply Chain Events]
    L --> M[Blockchain Transaction]
    
    D --> N[Receive Product]
    N --> O[Record Event]
    O --> P[Ship to Retail]
    
    E --> Q[Scan QR Code]
    Q --> R[View Product Journey]
    R --> S[Verify Authenticity]
    
    M --> T[(PostgreSQL Database)]
    T --> R
```

## Architecture Layers

```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        A[Web Dashboard]
        B[Mobile App]
    end

    subgraph API["API Layer"]
        C[Express REST API]
    end

    subgraph Services["Services"]
        D[Auth Service]
        E[Farm Service]
        F[Crop Service]
        G[AI Service]
        H[Blockchain Service]
    end

    subgraph Data["Data Layer"]
        I[(PostgreSQL)]
        J[Prisma ORM]
    end

    A --> C
    B --> C
    C --> J
    J --> I
    C --> G
    C --> H
```

## Supply Chain Event Flow

```mermaid
sequenceDiagram
    participant F as Farmer
    participant S as System
    participant D as Database
    participant B as Blockchain
    participant C as Consumer

    F->>S: Plant Crop
    S->>D: Create Crop Record
    S->>D: Log SupplyChainEvent (PLANTED)
    S->>B: Record on Blockchain
    
    F->>S: Update Growth Stage
    S->>D: Update Crop Status
    
    F->>S: Harvest Crop
    S->>D: Create Product
    S->>D: Log SupplyChainEvent (HARVESTED)
    
    F->>S: Package Product
    S->>D: Update Product Status
    S->>D: Log SupplyChainEvent (PACKAGED)
    S->>B: Record on Blockchain
    
    Note over F,B: Product moves through supply chain
    
    C->>S: Scan QR Code
    S->>D: Query Complete History
    S->>B: Verify Blockchain Events
    S->>C: Display Product Journey
```

## Index Strategy

```mermaid
flowchart TD
    subgraph UserIndexes["User Indexes"]
        U1[email - Unique Login]
        U2[role - RBAC Filtering]
    end

    subgraph FarmIndexes["Farm Indexes"]
        F1[userId - Owner Lookup]
    end

    subgraph CropIndexes["Crop Indexes"]
        C1[farmId - Farm Crops]
        C2[type - Crop Filtering]
        C3[growthStage - Stage Filtering]
    end

    subgraph ProductIndexes["Product Indexes"]
        P1[cropId - Source Crops]
        P2[sku - POS Lookup]
        P3[batchNumber - Recall Mgmt]
        P4[status - Inventory Filter]
    end

    subgraph EventIndexes["Event Indexes"]
        E1[productId - Product History]
        E2[eventType - Event Queries]
        E3[transactionHash - Blockchain Verify]
        E4[cropId - Crop Events]
    end

    UserIndexes
    FarmIndexes
    CropIndexes
    ProductIndexes
    EventIndexes
```

## Cascade Delete Flow

```mermaid
flowchart TD
    A[Delete User] --> B[Delete Farm]
    B --> C[Delete Crops]
    C --> D[Delete Products]
    D --> E[Delete Related Events]
    C --> F[Delete AI Predictions]
    C --> G[Set Null on Crop Events]
    
    style A fill:#ff6b6b
    style B fill:#ffa502
    style C fill:#ff6b6b
    style D fill:#ffa502
    style E fill:#ff6b6b
    style F fill:#ff6b6b
    style G fill:#7bed9f
```

## Query Performance

```mermaid
mindmap
  root((Performance))
    Indexes
      Foreign Keys
      Unique Fields
      Filter Fields
      Time Series
    Query Optimization
      Select Fields
      Include Relations
      Avoid N+1
      Use Transactions
    Connection Pooling
      Pool Size
      Timeout Settings
      Retry Logic
    Caching Strategy
      Redis Layer
      Query Cache
      Session Cache
```

---

**Legend:**
- PK = Primary Key
- UK = Unique Key
- FK = Foreign Key
- JSON = JSONB data type

For detailed field descriptions and usage examples, see [SCHEMA_DOCS.md](./SCHEMA_DOCS.md)
