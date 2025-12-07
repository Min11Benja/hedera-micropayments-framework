# Architecture Documentation

## System Architecture

```mermaid
graph TB
    Client[Client App (Frontend)] -->|Watch Events| Server[Server API]
    Server -->|Write to HCS| HCS[Hedera Consensus Service]
    HCS -->|Mirror Stream| Worker[Settlement Worker]
    Worker -->|Batch HBAR Transfers| Wallets[User Wallets]
    Worker -->|Status Updates| Server
    
    subgraph "Hedera Network"
    HCS
    end
    
    subgraph "Backend Infrastructure"
    Server
    Worker
    end
```

## Sequence Diagram: Payment Flow

```mermaid
sequenceDiagram
    participant Viewer
    participant Client
    participant Server
    participant Hedera
    
    Viewer->>Client: Press PLAY
    Client->>Server: Request stream
    Server-->>Client: 402 Payment Required
    Client->>Viewer: Request Payment Authorization
    Viewer->>Client: Sign Intent
    Client->>Server: Send Signed Intent
    Server->>Hedera: Log to HCS
    Server-->>Client: Stream Content (Chunk 1)
    
    loop Every Second
        Client->>Server: Heartbeat/Watch Event
        Server->>Hedera: Log Event
    end
    
    Note over Hedera: Settlement Worker processes events asynchronously
```
