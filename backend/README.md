# SupplyChain+ Backend (Phase 1)

Foundational Express.js backend infrastructure for the blockchain-enabled SupplyChain+ platform.

---

## 🏗 Modular Architecture Overview

The backend uses a modular, layered architecture to separate database access, business rules, routing, and controller schemas cleanly.

```
Request ──> [Routes] ──> [Middleware/Validator] ──> [Controllers] ──> [Services] ──> [Repositories] ──> Mock DB / Ledger
```

Every domain module contains:
- **Routes**: Endpoints definition.
- **Controller**: Triggers services and returns standardized JSON responses.
- **Service**: Implements business and orchestration rules.
- **Repository**: Mimics relational queries and ledger nodes transactions.
- **Validator**: Connects Joi request validation middleware to input paths.
- **Schema**: Defines request body Joi structures.

---

## 📂 Folder Layout

```
backend/
├── src/
│   ├── config/          # Environment configuration loaders
│   ├── middleware/      # Global error wrappers, auth/RBAC filters, and Joi validation
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Controller handlers
│   ├── services/        # Business logic services
│   ├── repositories/    # Data storage operations
│   ├── validators/      # Route body validator definitions
│   ├── schemas/         # Joi schema layouts
│   ├── models/          # Relational entities definitions
│   ├── database/        # DB migration scripts
│   ├── swagger/         # OpenAPI configuration specifications
│   ├── utils/           # Shared helper functions (format response, custom AppErrors)
│   ├── constants/       # User roles & tracking statuses
│   ├── blockchain/      # Smart contracts client endpoints
│   ├── docs/            # Developer API references
│   ├── tests/           # Preparing unit tests
│   ├── public/          # Static file serving directory
│   ├── logs/            # App file logging output
│   ├── uploads/         # File attachments uploads directory
│   ├── app.js           # App config setup
│   └── server.js        # Boot entrypoint script
├── .env.example         # System variables format
├── .env                 # Config overrides
├── eslint.config.js     # Code standards checks
├── .prettierrc          # Prettier code rules
└── package.json         # NPM manifest
```

---

## 🚀 Environment Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Verify the environment values in `.env` are correct. By default, it runs on port `3000`.

3. **Running in Development (Auto-Reload)**
   ```bash
   npm run dev
   ```

4. **Running in Production**
   ```bash
   npm start
   ```

---

## 📡 API Endpoint Reference

- **Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check Endpoint**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## 🧪 Linting & Testing

- Run ESLint to verify standard structure rules:
  ```bash
  npm run lint
  ```
- Run Prettier to format Javascript code styling:
  ```bash
  npm run format
  ```
