import app from './app.js';
import appConfig from './config/app.js';

/**
 * Boots the Express Server.
 */
const startServer = () => {
  const server = app.listen(appConfig.port, () => {
    console.log('==========================================');
    console.log('🚀 SupplyChain+ Backend Server Started');
    console.log(`🔧 Environment: ${appConfig.env}`);
    console.log(`🔌 Port: ${appConfig.port}`);
    console.log(`📌 API Version: /api/${appConfig.apiVersion}`);
    console.log('==========================================');
  });

  // Handle server errors gracefully
  const handleShutdown = (signal) => {
    console.log(`Received signal ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log('HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
