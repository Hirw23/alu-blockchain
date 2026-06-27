import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Config and Middleware
import appConfig from './config/app.js';
import { requestId, requestLogger, errorHandler, notFound } from './middleware/index.js';
import registerSwagger from './swagger/index.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import businessesRoutes from './routes/businesses.routes.js';
import productsRoutes from './routes/products.routes.js';
import productCategoriesRoutes from './routes/productCategories.routes.js';
import supplychainRoutes from './routes/supplychain.routes.js';
import qrRoutes from './routes/qr.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import cooperativesRoutes from './routes/cooperatives.routes.js';
import adminRoutes from './routes/admin.routes.js';
import blockchainRoutes from './routes/blockchain.routes.js';
import healthRoutes from './routes/health.routes.js';
import announcementsRoutes from './routes/announcements.routes.js';
import checkMaintenanceMode from './middleware/maintenance.js';

const app = express();

// Initialize basic middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (appConfig.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom tracking headers and request logging
app.use(requestId);
app.use(requestLogger);

// Setup Swagger Documentation (serves at /api/docs)
registerSwagger(app);

// Base routing prefix definition helper
const apiPrefix = `/api/${appConfig.apiVersion}`;

// Mount health routes first so monitoring works even during maintenance lockout
app.use(`${apiPrefix}/health`, healthRoutes);

// Apply maintenance mode filter for all other operational endpoints
app.use(checkMaintenanceMode);

// Register feature module endpoints
app.use(`${apiPrefix}/announcements`, announcementsRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/businesses`, businessesRoutes);
app.use(`${apiPrefix}/products`, productsRoutes);
app.use(`${apiPrefix}/product-categories`, productCategoriesRoutes);
app.use(`${apiPrefix}/supply-chain`, supplychainRoutes);
app.use(`${apiPrefix}/verification`, verificationRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/cooperatives`, cooperativesRoutes);
app.use(`${apiPrefix}/blockchain`, blockchainRoutes);
app.use('/', qrRoutes);

// Fallback handlers
app.use(notFound);
app.use(errorHandler);

export default app;
