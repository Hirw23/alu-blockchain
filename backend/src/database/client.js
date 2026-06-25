import { PrismaClient } from '@prisma/client';
import appConfig from '../config/app.js';

// Setup Prisma client with log configuration based on active environment state
const prismaLog = appConfig.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'];

export const prisma = new PrismaClient({
  log: prismaLog,
});

export default prisma;
