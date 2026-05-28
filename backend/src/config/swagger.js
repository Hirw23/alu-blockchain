import dotenv from 'dotenv';
dotenv.config();

/**
 * Swagger and API Documentation configuration settings.
 */
export const swaggerConfig = {
  enabled: process.env.SWAGGER_ENABLED === 'true' || process.env.SWAGGER_ENABLED === undefined,
  route: '/api/docs',
};

export default swaggerConfig;
