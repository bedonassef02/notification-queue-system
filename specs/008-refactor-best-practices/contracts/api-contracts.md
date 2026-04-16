# API Contracts: Code Quality and Performance Refactoring

**Feature**: [spec.md](spec.md)
**Date**: 2025-04-17
**Purpose**: Define public API interfaces and contracts for external integration

## Overview

The NotifyFlow system exposes RESTful APIs for notification management and system monitoring. These contracts define the expected request/response formats, error handling, and authentication requirements.

## API Endpoints

### 1. Enqueue Notification

**Endpoint**: `POST /api/notifications/enqueue`

**Purpose**: Create a new notification request and add it to the processing queue.

**Authentication**: Required (API Key or JWT token)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:

```typescript
{
  type: 'EMAIL' | 'SMS' | 'PUSH',
  recipient: string,           // Email address, phone number, or device token
  payload: Record<string, any>, // Notification content and metadata
  priority?: 'HIGH' | 'MEDIUM' | 'LOW', // Optional, defaults to 'MEDIUM'
  scheduledAt?: string,         // ISO 8601 datetime, optional
  idempotencyKey?: string      // Optional, prevents duplicate processing
}
```

**Validation Rules**:
- `type`: Required, must be one of EMAIL, SMS, PUSH
- `recipient`: Required, 1-500 characters
- `payload`: Required, valid JSON object, <10KB
- `priority`: Optional, defaults to MEDIUM
- `scheduledAt`: Optional, future date if provided
- `idempotencyKey`: Optional, max 255 characters, must be unique if provided

**Success Response** (201 Created):

```typescript
{
  success: true,
  data: {
    id: string,              // UUID of created notification
    status: 'PENDING',
    type: string,
    recipient: string,
    priority: string,
    scheduledAt?: string,
    createdAt: string,        // ISO 8601 datetime
    queuePosition?: number     // Position in processing queue
  }
}
```

**Error Responses**:

| Status | Error Code | Description |
|---------|-------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 409 | DUPLICATE_REQUEST | Idempotency key already exists |
| 429 | RATE_LIMITED | Too many requests, rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error during processing |

**Error Response Format**:

```typescript
{
  success: false,
  error: {
    code: string,        // Error code from table above
    message: string,     // Human-readable error message
    details?: {          // Additional error context
      field?: string,
      value?: any,
      constraint?: string
    }
  }
}
```

---

### 2. Get Notification Logs

**Endpoint**: `GET /api/notifications/{id}/logs`

**Purpose**: Retrieve the complete audit trail for a specific notification.

**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the notification

**Query Parameters**:
- `limit`: Optional, number of log entries to return (default: 50, max: 100)
- `offset`: Optional, pagination offset (default: 0)

**Success Response** (200 OK):

```typescript
{
  success: true,
  data: {
    notificationId: string,
    logs: Array<{
      id: string,
      provider: string,
      status: 'SUCCESS' | 'FAILURE',
      errorMessage?: string,
      providerResponse?: Record<string, any>,
      attemptNumber: number,
      duration?: number,
      createdAt: string
    }>,
    pagination: {
      total: number,
      limit: number,
      offset: number,
      hasMore: boolean
    }
  }
}
```

**Error Responses**:

| Status | Error Code | Description |
|---------|-------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 404 | NOT_FOUND | Notification not found |
| 500 | INTERNAL_ERROR | Server error during processing |

---

### 3. Get Dead Letter Queue

**Endpoint**: `GET /api/notifications/dlq`

**Purpose**: Retrieve notifications that have exceeded their retry limit and require manual intervention.

**Authentication**: Required (Admin only)

**Query Parameters**:
- `limit`: Optional, number of entries to return (default: 50, max: 100)
- `offset`: Optional, pagination offset (default: 0)
- `status`: Optional, filter by status (PERMANENT_FAILURE)
- `fromDate`: Optional, ISO 8601 datetime for filtering
- `toDate`: Optional, ISO 8601 datetime for filtering

**Success Response** (200 OK):

```typescript
{
  success: true,
  data: {
    notifications: Array<{
      id: string,
      type: string,
      recipient: string,
      status: string,
      attempts: number,
      lastAttemptAt?: string,
      payload: Record<string, any>,
      createdAt: string
    }>,
    pagination: {
      total: number,
      limit: number,
      offset: number,
      hasMore: boolean
    }
  }
}
```

**Error Responses**:

| Status | Error Code | Description |
|---------|-------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions (admin only) |
| 500 | INTERNAL_ERROR | Server error during processing |

---

### 4. Retry DLQ Notification

**Endpoint**: `POST /api/notifications/dlq/{id}/retry`

**Purpose**: Manually retry a notification that failed permanently.

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: UUID of the notification to retry

**Request Body**: Empty (no body required)

**Success Response** (200 OK):

```typescript
{
  success: true,
  data: {
    id: string,
    status: 'PENDING',      // Reset to pending for reprocessing
    retryCount: number,      // Incremented retry count
    queuedAt: string         // Timestamp when re-enqueued
  }
}
```

**Error Responses**:

| Status | Error Code | Description |
|---------|-------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions (admin only) |
| 404 | NOT_FOUND | Notification not found or not in DLQ |
| 500 | INTERNAL_ERROR | Server error during processing |

---

## Common Response Patterns

### Pagination

All list endpoints support consistent pagination:

```typescript
{
  pagination: {
    total: number,      // Total number of items
    limit: number,      // Items per page
    offset: number,     // Current offset
    hasMore: boolean    // Whether more items exist
  }
}
```

### Rate Limiting

API endpoints implement rate limiting based on:

- **Per-IP limits**: 100 requests per minute
- **Per-API Key limits**: 1000 requests per minute
- **Per-endpoint limits**: Specific to endpoint type

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Error Handling

All errors follow consistent format:

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, any>
  }
}
```

**Error Codes**:

| Code | HTTP Status | Description |
|-------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required or invalid |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_REQUEST | 409 | Duplicate request detected |
| RATE_LIMITED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Server error |

## Authentication

### API Key Authentication

**Header**: `Authorization: Bearer {api_key}`

**How to obtain**:
- Contact system administrator
- API keys are generated with specific permissions
- Keys can be revoked at any time

### JWT Authentication (Future)

**Header**: `Authorization: Bearer {jwt_token}`

**How to obtain**:
- POST `/api/auth/login` with credentials
- Token expires after 1 hour
- Refresh token available

## Data Types

### Notification Type

```typescript
type NotificationType = 'EMAIL' | 'SMS' | 'PUSH'
```

### Notification Status

```typescript
type NotificationStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'PERMANENT_FAILURE'
```

### Notification Priority

```typescript
type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW'
```

### Log Status

```typescript
type LogStatus = 'SUCCESS' | 'FAILURE'
```

## Webhooks (Future)

### Delivery Status Webhook

**Endpoint**: Client-provided webhook URL

**Purpose**: Notify clients when notification delivery status changes.

**Event Types**:
- `notification.sent`: Successfully delivered
- `notification.failed`: Delivery failed
- `notification.permanent_failure`: Max retries exceeded

**Webhook Payload**:

```typescript
{
  event: string,
  timestamp: string,
  data: {
    notificationId: string,
    status: string,
    recipient: string,
    type: string,
    attemptNumber?: number,
    errorMessage?: string
  }
}
```

**Retry Policy**:
- Webhooks are retried up to 3 times with exponential backoff
- Timeout: 10 seconds per attempt
- Webhook must respond with 200 OK to acknowledge

## Versioning

### Current Version: v1

**Base URL**: `/api/v1` (or `/api` for backward compatibility)

**Versioning Strategy**:
- URL path versioning (`/api/v1`, `/api/v2`)
- Major version changes indicate breaking changes
- Minor version changes indicate additions
- Patch version changes indicate fixes

**Deprecation Policy**:
- Versions are supported for 12 months after deprecation
- Deprecation warnings sent 3 months in advance
- Clients must upgrade before support ends

## Security Considerations

### HTTPS Required

All API endpoints require HTTPS. HTTP requests are redirected to HTTPS.

### CORS Configuration

```
Access-Control-Allow-Origin: {allowed_origins}
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Input Sanitization

- All user inputs are validated and sanitized
- SQL injection protection via parameterized queries
- XSS protection via output encoding
- CSRF protection via token validation

### Rate Limiting

- Per-IP rate limiting prevents abuse
- Per-API key limits prevent overuse
- Burst capacity allows temporary spikes
- Exponential backoff for rate-limited clients

## Testing

### Example cURL Commands

**Enqueue Notification**:
```bash
curl -X POST https://api.notifyflow.com/api/notifications/enqueue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "EMAIL",
    "recipient": "user@example.com",
    "payload": {
      "subject": "Welcome",
      "body": "Hello!"
    },
    "priority": "HIGH"
  }'
```

**Get Notification Logs**:
```bash
curl https://api.notifyflow.com/api/notifications/{id}/logs \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Get DLQ**:
```bash
curl https://api.notifyflow.com/api/notifications/dlq?limit=10 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Monitoring

### API Health Check

**Endpoint**: `GET /api/health`

**Response**:
```typescript
{
  status: 'healthy',
  version: '1.0.0',
  uptime: number,
  database: 'connected',
  redis: 'connected'
}
```

### Metrics Endpoint (Admin Only)

**Endpoint**: `GET /api/metrics`

**Response**:
```typescript
{
  requestsPerMinute: number,
  averageResponseTime: number,
  errorRate: number,
  queueSize: number,
  activeWorkers: number
}
```

## Summary

The API contracts provide a stable, well-documented interface for external integration. Key aspects:

- **RESTful Design**: Consistent HTTP methods and status codes
- **Type Safety**: TypeScript definitions for all request/response types
- **Error Handling**: Comprehensive error codes and messages
- **Authentication**: Multiple authentication methods supported
- **Rate Limiting**: Protection against abuse and overuse
- **Pagination**: Consistent pagination across list endpoints
- **Versioning**: Clear versioning strategy for future changes
- **Security**: HTTPS, CORS, input sanitization, and rate limiting

These contracts enable reliable integration with external systems while maintaining security, performance, and backward compatibility.
