# Feature Specification: Architectural Hardening

**Feature Branch**: `007-architectural-hardening`  
**Created**: 2026-03-30  
**Status**: Draft  
**Input**: User request: "Review the entire notification queue system implementation. Improve: Code structure, Naming consistency, Error handling, Scalability, Maintainability. Refactor where needed and explain improvements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Productivity & Testability (Priority: P1)

As a backend developer, I want all services to use Dependency Injection so that I can easily mock the database or external providers in unit tests.

**Why this priority**: High. Foundational for code quality and testing.

**Independent Test**: Successfully run a unit test for `NotificationService` with a mocked `NotificationRepository`.

**Acceptance Scenarios**:
1. **Given** a `NotificationService`, **When** initialized, **Then** it accepts its dependencies via constructor instead of instantiating them internally.

---

### User Story 2 - System Reliability (Fail-Fast Config) (Priority: P1)

As an operations engineer, I want the application to validate all required configuration variables during startup so that it doesn't fail unexpectedly at runtime due to a missing API key.

**How it works**: Use a centralized `ConfigService` with Zod validation.

**Acceptance Scenarios**:
1. **Given** a missing `TWILIO_AUTH_TOKEN`, **When** the application starts, **Then** it exits immediately with a clear validation error.

---

### User Story 3 - Operational Observability (Priority: P2)

As a DevOps engineer, I want structured error logging across all layers so that I can distinguish between network timeouts, provider rejects, and internal logic bugs.

**Acceptance Scenarios**:
1. **Given** a provider failure, **When** logged, **Then** it includes a specific `errorCode` (e.g., `ERR_PROVIDER_REJECT`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Implement **Constructor Injection** for all Services and Repositories.
- **FR-002**: Centralize all `process.env` lookups into a Zod-validated `AppConfig` singleton.
- **FR-003**: Create typed **Application Errors** (Infrastructure, Domain, Validation).
- **FR-004**: Replace `any` payloads with channel-specific **Payload Interfaces**.
- **FR-005**: Standardize naming to **kebab-case** for file paths and **CamelCase** for classes.

### Success Criteria *(mandatory)*

- **SC-001**: Zero `process.env` calls outside the `ConfigService`.
- **SC-002**: 100% of services are testable via dependency injection.
- **SC-003**: All API error responses follow the standard `ApiResponse` format with appropriate HTTP status codes.

## Assumptions

- [Assumption 1]: This refactor focuses on the internal architecture and will not change the public API behavior (except for error structure improvements).
- [Assumption 2]: Performance will remain stable or improve due to singleton reuse.
