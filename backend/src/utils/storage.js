import fs from 'fs';
import path from 'path';
import appConfig from '../config/app.js';

/**
 * Ensures the upload directory exists at startup.
 *
 * On Render, the filesystem is ephemeral — the directory cannot be assumed
 * to persist from a previous deployment. This function creates it
 * programmatically each time the server starts.
 */
export const ensureUploadsDirectory = () => {
  const uploadDir = path.resolve(appConfig.uploadDirectory);

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`✓ Upload directory created: ${uploadDir}`);
    } else {
      console.log(`✓ Upload directory ready: ${uploadDir}`);
    }
  } catch (err) {
    console.error(`✗ Failed to create upload directory at '${uploadDir}': ${err.message}`);
    // Non-fatal — do not exit; some deployments may use cloud storage instead
  }
};
