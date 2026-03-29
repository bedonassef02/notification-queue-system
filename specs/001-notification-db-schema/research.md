# Research: Notification Queue System

## 1. BullMQ with Upstash Redis
**Decision**: Use `bullmq` with `ioredis` connecting to Upstash.
- **Rationale**: BullMQ is the most robust queueing library for Node.js. Upstash Redis is managed and serverless-friendly.
- **Best Practice**: Use `maxRetriesPerRequest: null` and `enableReadyCheck: false` in `ioredis` configuration for BullMQ compatibility with some serverless/managed Redis environments.
- **Alternatives**: RabbitMQ, AWS SQS. Rejected due to higher setup complexity and lack of native Node.js ecosystem maturity compared to BullMQ.

## 2. PostgreSQL JSONB vs. Relational for Payloads
**Decision**: Use `JSONB` for the `payload` field.
- **Rationale**: Notification metadata (templates, variables) varies significantly between providers (ZeptoMail vs Twilio). JSONB allows schema flexibility while maintaining binary performance and indexing.
- **Alternatives**: Multiple nullable columns, Entity-Attribute-Value (EAV). Rejected as they are unwieldy and hard to maintain.

## 3. Idempotency Implementation
**Decision**: Database-level `UNIQUE` constraint on `idempotency_key`.
- **Rationale**: Ensures atomic protection against duplicate notifications at the ingestion point.
- **Alternative**: Redis-based locking. Rejected because the primary record already exists in SQL, so SQL is the most reliable source of truth.

## 4. Provider Strategy
**Decision**: Interface-based injection.
- **Interface**: `INotificationProvider { send(notification: Notification): Promise<ProviderResponse> }`
- **Rationale**: Allows the system to remain agnostic of the specific vendor.
- **Implementation**: Factories will instantiate the correct provider based on the `type` column.
