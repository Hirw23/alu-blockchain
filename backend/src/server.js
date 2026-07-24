import { validateConfig } from './config/validate.js';
import app from './app.js';
import appConfig from './config/app.js';
import { ensureUploadsDirectory } from './utils/storage.js';
import blockchainService from './services/blockchain.service.js';
import { processPendingAnchors, startAnchorWorker, stopAnchorWorker } from './blockchain/anchorWorker.js';

// ── 1. Validate environment before anything else ─────────────────────────────
validateConfig();

// ── 2. Ensure upload directory exists (programmatic — required on Render) ────
ensureUploadsDirectory();

/**
 * Boots the Express Server.
 */
const startServer = () => {
  const server = app.listen(appConfig.port, () => {
    console.log('==========================================');
    console.log('🚀 SupplyChain+ Backend Server Started');
    console.log(`🔧 Environment : ${appConfig.env}`);
    console.log(`📦 Version     : ${appConfig.appVersion}`);
    console.log(`🔌 Port        : ${appConfig.port}`);
    console.log(`📌 API Prefix  : /api/${appConfig.apiVersion}`);
    console.log(`🌐 CORS Origins: ${appConfig.corsOrigins.join(', ')}`);
    console.log('==========================================');
  });

  blockchainService
    .connect()
    .then((status) => {
      console.log(`[Blockchain] ${status.status}: ${status.message}`);
      startAnchorWorker();
      return processPendingAnchors();
    })
    .catch((error) => {
      console.error('[Blockchain] Startup connection failed:', error.message);
    });

  // Handle server errors gracefully
  const handleShutdown = (signal) => {
    console.log(`Received signal ${signal}. Shutting down server gracefully...`);
    stopAnchorWorker();
    blockchainService.disconnect().catch((error) => {
      console.error('[Blockchain] Disconnect failure:', error.message);
    });
    server.close(() => {
      console.log('HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
};

startServer();
