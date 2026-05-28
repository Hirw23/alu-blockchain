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
import supplychainRoutes from './routes/supplychain.routes.js';
import qrRoutes from './routes/qr.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import cooperativesRoutes from './routes/cooperatives.routes.js';
import adminRoutes from './routes/admin.routes.js';
import blockchainRoutes from './routes/blockchain.routes.js';

const app = express();

// Initialize basic middlewares
app.use(helmet());
app.use(cors({ origin: appConfig.frontendUrl, credentials: true }));
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

/**
 * Health Check Endpoint
 */
app.get(`${apiPrefix}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    version: appConfig.apiVersion,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// Register feature module endpoints
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/businesses`, businessesRoutes);
app.use(`${apiPrefix}/products`, productsRoutes);
app.use(`${apiPrefix}/supply-chain`, supplychainRoutes);
app.use(`${apiPrefix}/verification`, verificationRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/cooperatives`, cooperativesRoutes);
app.use(`${apiPrefix}/blockchain`, blockchainRoutes);
app.use(`${apiPrefix}/qr`, qrRoutes);

// Fallback handlers
app.use(notFound);
app.use(errorHandler);

export default app;
