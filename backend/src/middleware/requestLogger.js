import morgan from 'morgan';
import appConfig from '../config/app.js';

// Define custom token for Request ID
morgan.token('id', (req) => req.id);

/**
 * Configure Morgan request logging based on running environments.
 */
const logFormat = appConfig.isProduction
  ? ':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
  : ':id :method :url :status :response-time ms - :res[content-length]';

export const requestLogger = morgan(logFormat);

export default requestLogger;
