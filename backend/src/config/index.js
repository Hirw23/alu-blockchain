import appConfig from './app.js';
import databaseConfig from './database.js';
import jwtConfig from './jwt.js';
import swaggerConfig from './swagger.js';
import blockchainConfig from './blockchain.js';

export {
  appConfig as app,
  databaseConfig as database,
  jwtConfig as jwt,
  swaggerConfig as swagger,
  blockchainConfig as blockchain,
};

export default {
  app: appConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  swagger: swaggerConfig,
  blockchain: blockchainConfig,
};
