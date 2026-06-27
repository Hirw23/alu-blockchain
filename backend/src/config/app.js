import dotenv from 'dotenv';
dotenv.config();

/**
 * Application config object grouping basic app and environment configurations.
 */
export const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'SupplyChain+',
  appVersion: process.env.APP_VERSION || '1.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  uploadDirectory: process.env.UPLOAD_DIRECTORY || 'uploads',

  // Legacy alias kept so existing code that references appConfig.frontendUrl still works
  get frontendUrl() {
    return this.corsOrigins[0] || 'http://localhost:5173';
  },

  /**
   * Parsed CORS allowed origins.
   * CORS_ORIGIN may be a single URL or a comma-separated list.
   * Example: "https://app.onrender.com,https://custom-domain.com"
   */
  get corsOrigins() {
    const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  },

  /**
   * Public base URL used by Swagger for the server definition.
   * Set API_BASE_URL in the Render dashboard to the deployed service URL.
   */
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
};

export default appConfig;
