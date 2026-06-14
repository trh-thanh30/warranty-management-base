# 📦 Modules & Business Logic

This directory houses the core functionality of the API, organized into domain-driven modules. Each module encapsulates its own controllers, services, and use-cases.

## 🔐 Auth Module

Handles the entire authentication lifecycle and security.

### Features

- **Dual-Token System**: Generation of Access and Refresh tokens.
- **Secure Sessions**: Automatic session tracking and revocation.
- **Multi-Step Verification**: Email-based account activation flow.
- **Password Recovery**: Secure token-based password reset mechanism.

### Usage Example: Login Flow

```typescript
// Authentication is handled via the LoginUseCase
const result = await this.loginUseCase.execute({
  usernameOrEmail: 'johndoe',
  password: 'Password123',
});

// Returns access token and sets refresh token in HttpOnly cookie
```

---

## 👥 User Module

Manages user profiles and administrative controls.

### Features

- **Profile Management**: CRUD operations for user data.
- **RBAC Enforcement**: Role assignments (User, Staff, Admin).
- **Status Control**: Toggle user status (Active, Inactive, Suspended).

### Example Data Transfer Object (DTO)

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsEnum(['ADMIN', 'STAFF', 'USER'])
  role: user_role;
}
```

---

## 📧 Email Module

Asynchronous email delivery system.

### Features

- **Handlebars Templates**: Rich HTML email support.
- **Queue Integration**: Emails are processed via Redis/BullMQ to prevent blocking.
- **Fail-Safe Processing**: Automatic retries for failed email deliveries.

---

## 🏥 Health Module

Monitoring endpoints for system reliability.

### Features

- **Database Pulse**: Checks connectivity to PostgreSQL.
- **System Metrics**: Reports memory usage and uptime.
- **Redis Check**: Validates connection to the cache/queue server.

### Example Endpoint

`GET /health` -> `{"status": "ok", "details": {...}}`
