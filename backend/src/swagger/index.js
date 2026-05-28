import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from '../config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let swaggerDocument = {};
try {
  const jsonPath = path.join(__dirname, 'openapi.json');
  swaggerDocument = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (err) {
  console.error('Error loading openapi.json:', err.message);
}

/**
 * Registers Swagger route on the Express application.
 * @param {import('express').Express} app - Express application instance
 */
export const registerSwagger = (app) => {
  if (swaggerConfig.enabled) {
    app.use(swaggerConfig.route, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log(`[Swagger] Documentation registered at ${swaggerConfig.route}`);
  } else {
    console.log('[Swagger] Disabled in configuration settings');
  }
};

export default registerSwagger;
