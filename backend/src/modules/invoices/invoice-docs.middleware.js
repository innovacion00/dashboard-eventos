import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads/invoice-docs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const invoiceDocsUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se aceptan imágenes (JPG, PNG, WebP) y PDF.'));
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});
