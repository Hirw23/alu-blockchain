/**
 * Startup configuration validator.
 *
 * Validates that all required environment variables are present before the
 * server boots. If any are missing the process exits with a clear error so
 * Render (and any other host) surfaces a meaningful failure rather than
 * starting a misconfigured application.
 *
 * Call validateConfig() as the very first thing in server.js.
 */

const REQUIRED_VARS = [
  { key: 'DATABASE_URL', hint: 'Render auto-injects this when a PostgreSQL service is linked' },
  { key: 'JWT_SECRET', hint: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"' },
  { key: 'JWT_REFRESH_SECRET', hint: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"' },
];

const WARN_IF_DEFAULT = [
  { key: 'CORS_ORIGIN', expected: 'https://your-frontend.onrender.com' },
  { key: 'API_BASE_URL', expected: 'https://your-api.onrender.com' },
];

export const validateConfig = () => {
  const missing = [];

  for (const { key, hint } of REQUIRED_VARS) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push(`  ✗ ${key}  →  ${hint}`);
    }
  }

  if (missing.length > 0) {
    console.error('\n========================================================');
    console.error('  STARTUP FAILURE — Missing Required Environment Vars');
    console.error('========================================================');
    missing.forEach((m) => console.error(m));
    console.error('\nSet these variables in the Render Dashboard → Environment');
    console.error('or in your local .env file before starting the server.\n');
    process.exit(1);
  }

  // Soft warnings — app will run, but these should be set in production
  if (process.env.NODE_ENV === 'production') {
    for (const { key, expected } of WARN_IF_DEFAULT) {
      if (!process.env[key]) {
        console.warn(`[CONFIG WARN] ${key} is not set. Expected value for production: ${expected}`);
      }
    }
  }

  console.log('✓ Configuration validation passed.');
};

export default validateConfig;
