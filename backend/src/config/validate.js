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

const FABRIC_REQUIRED_VARS = [
  'FABRIC_CHANNEL_NAME',
  'FABRIC_CHAINCODE_NAME',
  'FABRIC_MSP_ID',
  'FABRIC_PEER_ENDPOINT',
  'FABRIC_PEER_HOST_ALIAS',
  'FABRIC_TLS_CERT_PATH',
  'FABRIC_IDENTITY_CERT_PATH',
  'FABRIC_IDENTITY_KEY_PATH',
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

  if (process.env.BLOCKCHAIN_ENABLED === 'true') {
    const missingFabricVars = FABRIC_REQUIRED_VARS.filter(
      (key) => !process.env[key] || process.env[key].trim() === ''
    );

    if (missingFabricVars.length > 0) {
      console.error('\n========================================================');
      console.error('  STARTUP FAILURE - Missing Fabric Environment Vars');
      console.error('========================================================');
      missingFabricVars.forEach((key) => console.error(`  ✗ ${key}`));
      console.error('\nDisable blockchain mode or provide the Fabric wallet and endpoint settings.\n');
      process.exit(1);
    }
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
