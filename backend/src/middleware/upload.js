import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../utils/errors.js';

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }
    cb(new BadRequestError('Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, PDF.'));
  },
});

/**
 * Express middleware factory: accepts a single file under `fieldName`,
 * converting multer's callback-style errors into the app's error pipeline.
 */
export const uploadSingle = (fieldName) => (req, res, next) => {
  multerUpload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new BadRequestError(err.message));
    }
    if (err) {
      return next(err);
    }
    if (!req.file) {
      return next(new BadRequestError(`No file uploaded under field "${fieldName}"`));
    }
    next();
  });
};

/**
 * Builds the publicly-servable URL for an uploaded file.
 */
export const buildFileUrl = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/${filename}`;

export default uploadSingle;
