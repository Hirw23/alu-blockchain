import dotenv from 'dotenv';
dotenv.config();

/**
 * Database configuration loader.
 */
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/supplychain_db',
};

export default databaseConfig;
