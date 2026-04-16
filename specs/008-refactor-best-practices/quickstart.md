# Quickstart Guide: Code Quality and Performance Refactoring

**Feature**: [spec.md](spec.md)
**Date**: 2025-04-17
**Purpose**: Developer onboarding and setup guide for the refactored NotifyFlow system

## Prerequisites

Before starting development, ensure you have:

- **Node.js 20+** with npm
- **Git** for version control
- **Docker** and **Docker Compose** for local development
- **VS Code** with recommended extensions
- Account access to:
  - **Neon PostgreSQL** (database)
  - **Upstash Redis** (queue)
  - Provider accounts (ZeptoMail, Twilio, OneSignal)

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/notifyflow.git
cd notifyflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Redis
UPSTASH_REDIS_URL="rediss://default:password@xxx.upstash.io:6379"

# Email Provider (ZeptoMail)
ZEPTOMAIL_API_KEY="your-api-key"
ZEPTOMAIL_SENDER="noreply@yourdomain.com"

# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Push Provider (OneSignal)
ONESIGNAL_APP_ID="your-app-id"
ONESIGNAL_API_KEY="your-api-key"
ONESIGNAL_USER_AUTH_KEY="your-user-auth-key"

# Application
NODE_ENV="development"
PORT=3000
```

### 3. Start Development

```bash
# Start all services (app, worker, redis, database)
docker-compose up -d

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev

# Start worker process (in separate terminal)
npm run worker:start
```

### 4. Verify Setup

```bash
# Health check
curl http://localhost:3000/api/health

# Send test notification
curl -X POST http://localhost:3000/api/notifications/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EMAIL",
    "recipient": "test@example.com",
    "payload": {"subject": "Test", "body": "Hello!"}
  }'
```

## Project Structure

```
notifyflow/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   ├── notifications/  # Notification endpoints
│   │   │   └── dlq/          # Dead Letter Queue
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Home page
│   ├── application/            # Use cases & orchestration
│   │   └── services/
│   │       ├── notification-service.ts
│   │       └── queue-service.ts
│   ├── domain/                # Core business logic
│   │   ├── entities/          # Domain entities
│   │   └── repositories/      # Repository interfaces
│   ├── infrastructure/         # External dependencies
│   │   ├── database/          # Prisma & repositories
│   │   ├── queue/             # BullMQ setup
│   │   └── providers/         # Notification providers
│   ├── shared/                # Shared utilities
│   │   ├── validators/        # Zod schemas
│   │   ├── utils/            # Helper functions
│   │   └── errors/           # Error classes
│   ├── workers/               # Background workers
│   │   └── processor.ts
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                  # End-to-end tests
└── docker-compose.yml          # Local development
```

## Development Workflow

### Adding a New Notification Provider

1. **Create Provider Implementation**:

```typescript
// src/infrastructure/providers/whatsapp-provider.ts
import { INotificationProvider } from '@/domain/repositories/inotification-repository'

export class WhatsAppProvider implements INotificationProvider {
  async send(notification: Notification): Promise<SendResult> {
    // Implementation here
    return { success: true, providerResponse: {...} }
  }
}
```

2. **Register in Factory**:

```typescript
// src/infrastructure/providers/factory.ts
import { WhatsAppProvider } from './whatsapp-provider'

export class ProviderFactory {
  static getProvider(type: NotificationType): INotificationProvider {
    switch (type) {
      case 'WHATSAPP':
        return new WhatsAppProvider()
      // ... other providers
    }
  }
}
```

3. **Update Enums**:

```typescript
// src/domain/entities/notification.ts
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP'  // Add new type
}
```

4. **Add Tests**:

```typescript
// tests/unit/infrastructure/providers/whatsapp-provider.test.ts
import { describe, it, expect } from 'vitest'
import { WhatsAppProvider } from '@/infrastructure/providers/whatsapp-provider'

describe('WhatsAppProvider', () => {
  it('should send notification successfully', async () => {
    const provider = new WhatsAppProvider()
    const result = await provider.send(mockNotification)
    expect(result.success).toBe(true)
  })
})
```

### Creating a New API Endpoint

1. **Create Route Handler**:

```typescript
// src/app/api/notifications/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/application/services/notification-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    const service = new NotificationService()
    const status = await service.getStatus(notificationId)

    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: handleError(error) },
      { status: getStatusCode(error) }
    )
  }
}
```

2. **Add Validation**:

```typescript
// src/shared/validators/status-validator.ts
import { z } from 'zod'

export const GetStatusSchema = z.object({
  id: z.string().uuid('Invalid notification ID')
})
```

3. **Write Tests**:

```typescript
// tests/integration/api/notifications/status.test.ts
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/notifications/status/route'

describe('GET /api/notifications/status', () => {
  it('should return notification status', async () => {
    const request = new Request('http://localhost:3000/api/notifications/status?id=xxx')
    const response = await GET(request)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test path/to/file.test.ts

# Run only unit tests
npm test:unit

# Run only integration tests
npm test:integration
```

## Common Development Tasks

### Database Operations

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name add_new_field

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npm run prisma:seed
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run all quality checks
npm run quality
```

### Docker Operations

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
docker-compose logs -f worker

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Execute command in container
docker-compose exec app npm test
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Debugging API Routes

```typescript
// Add breakpoints or console.log
export async function POST(request: NextRequest) {
  console.log('Request body:', await request.json())
  const data = await request.json()
  debugger // Breakpoint
  // ... rest of code
}
```

### Debugging Worker Process

```bash
# Run worker in debug mode
node --inspect-brk src/workers/main-worker.ts
```

Then attach VS Code debugger to localhost:9229.

## Performance Monitoring

### Local Monitoring

```bash
# Check Redis queue size
docker-compose exec redis redis-cli LLEN notifications:queue

# Monitor Redis in real-time
docker-compose exec redis redis-cli MONITOR

# Check database connections
docker-compose exec db psql -U user -d neondb -c "SELECT count(*) FROM pg_stat_activity;"
```

### Performance Testing

```bash
# Install load testing tool
npm install -g autocannon

# Test enqueue endpoint
autocannon -c 10 -d 30 http://localhost:3000/api/notifications/enqueue \
  -H "Content-Type: application/json" \
  -B '{"type":"EMAIL","recipient":"test@example.com","payload":{"subject":"Test"}}'

# Test concurrent load
autocannon -c 100 -d 60 http://localhost:3000/api/health
```

## Troubleshooting

### Common Issues

**Issue**: Database connection failed
```bash
# Check DATABASE_URL in .env
# Verify network connectivity to Neon
# Check Prisma schema: npx prisma validate
```

**Issue**: Redis connection refused
```bash
# Check if Redis is running: docker-compose ps
# Verify UPSTASH_REDIS_URL
# Test Redis connection: redis-cli -u REDIS_URL ping
```

**Issue**: Worker not processing jobs
```bash
# Check worker logs: docker-compose logs -f worker
# Verify queue: redis-cli LLEN notifications:queue
# Check for TypeScript errors: npm run type-check
```

**Issue**: Tests failing
```bash
# Clear cache: rm -rf node_modules/.cache
# Reinstall dependencies: npm install
# Check environment variables in test setup
```

### Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Discord**: Join our developer community
- **Email**: support@notifyflow.com

## Best Practices

### Code Organization

- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Orchestration and use cases
- **Infrastructure Layer**: External integrations
- **Shared Layer**: Utilities and helpers

### Error Handling

```typescript
// Always handle errors
try {
  await someOperation()
} catch (error) {
  logger.error('Operation failed', error)
  throw new AppError('Failed to process', 500)
}
```

### Type Safety

```typescript
// Use TypeScript types, never 'any'
const notification: Notification = { ... }

// Use Zod for validation
const validated = CreateNotificationSchema.parse(input)
```

### Testing

```typescript
// Write tests for business logic
describe('NotificationService', () => {
  it('should create notification', async () => {
    const result = await service.create(notificationData)
    expect(result.status).toBe('PENDING')
  })
})

// Test error cases
it('should throw validation error for invalid data', async () => {
  await expect(service.create(invalidData))
    .rejects.toThrow(ValidationError)
})
```

## Next Steps

1. **Explore the codebase**: Read through the main files
2. **Run the example**: Send a test notification
3. **Write your first test**: Add a test for existing code
4. **Make a small change**: Fix a bug or add a feature
5. **Submit a PR**: Contribute to the project

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **BullMQ Docs**: https://docs.bullmq.io/
- **Vitest Docs**: https://vitest.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

## Support

Need help? Reach out:

- **Documentation**: `/docs` folder
- **GitHub Issues**: Report bugs and request features
- **Discord**: Real-time help from community
- **Email**: support@notifyflow.com

Happy coding! 🚀
