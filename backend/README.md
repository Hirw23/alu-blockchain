# SupplyChain+ Backend

Foundational Express.js backend infrastructure and database/authentication layer for the blockchain-enabled SupplyChain+ platform.

---

## 🏗 Modular Architecture Overview

The backend uses a modular, layered architecture to separate database access, business rules, routing, and controller schemas cleanly.

```
Request ──> [Routes] ──> [Middleware/Validator] ──> [Controllers] ──> [Services] ──> [Repositories] ──> Prisma ORM ──> PostgreSQL
```

---

## 🔐 Authentication & Authorization Flows

### 1. Registration
- Request body is validated against `registerSchema` using Joi.
- User password is encrypted with `bcrypt` (10 salt rounds).
- Newly created users are assigned the default `Entrepreneur` role.
- An email verification token is created, saved to the database, and logged (email mocked).

### 2. Login & Token Rotation
- Validate password hash.
- Verify user's email is verified (`emailVerified = true`).
- Generate a JWT Access Token (expires in 1h) and a JWT Refresh Token (expires in 7d).
- Persist the refresh token. When a user requests a new Access Token using their Refresh Token, the API performs **Token Rotation**; issuing a new Access/Refresh pair and revoking the old Refresh Token.
- **Threat Detection**: If a revoked refresh token is presented, the system immediately invalidates all active refresh tokens for that user to prevent token theft.

### 3. Role-Based Access Control (RBAC) & Permissions
- Authentication middleware loads the caller profile, role, and inherited permissions into `req.user`.
- `authorize(...roles)` blocks callers whose role is not in the allowed list.
- `checkPermission(permission)` checks if the user possesses the required capability key (e.g. `products:create`). `PlatformAdmin` bypasses all permission checks automatically.

---

## 🗄 Database & Prisma Setup

We use **Prisma ORM** to connect to our PostgreSQL database.

### 1. Environment Configurations
Verify your `.env` contains the correct PostgreSQL URL:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/supplychain_db"
JWT_SECRET="your-super-secret-jwt-signing-key"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-signing-key"
```

### 2. Database Models
- **User**: Profile, role reference, status, and verification state.
- **Role**: Standard system roles (`Entrepreneur`, `CooperativeAdmin`, `Buyer`, `FinancialInstitution`, `PlatformAdmin`).
- **Permission**: Granular capability keys (e.g. `products:create`, `admin:access`).
- **RolePermission**: Many-to-many relationship map.
- **RefreshToken**, **PasswordResetToken**, **EmailVerificationToken**: Tokens lifecycle.

### 3. Setup and Migrations Commands
- Run initial database migration to create all tables:
  ```bash
  npx prisma migrate dev --name init
  ```
- Run the seeding script to populate default system roles and permission sets:
  ```bash
  npx prisma db seed
  ```
- Open Prisma Studio to inspect local database records visually:
  ```bash
  npx prisma studio
  ```

---

## 📡 API Endpoint Reference

- **Swagger Documentation UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check Endpoint**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

### Authentication Endpoints
- `POST /api/v1/auth/register` - Create a user profile.
- `POST /api/v1/auth/verify-email` - Verify token to activate account.
- `POST /api/v1/auth/login` - Authenticate and fetch tokens.
- `POST /api/v1/auth/refresh` - Rotate access/refresh tokens.
- `POST /api/v1/auth/logout` - Invalidate active refresh token.
- `POST /api/v1/auth/forgot-password` - Request password reset token.
- `POST /api/v1/auth/reset-password` - Update password using token.
- `POST /api/v1/auth/change-password` - Change password (authenticated).
- `GET /api/v1/auth/me` - Fetch caller profile.
- `PATCH /api/v1/auth/profile` - Modify caller profile details.

---

## 🧪 Testing

- Run the Jest integration test suite:
  ```bash
  npm test
  ```
- Verify ESLint and Prettier styling checks:
  ```bash
  npm run lint
  npm run format
  ```
