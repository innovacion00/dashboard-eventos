import multer from 'multer';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se aceptan imágenes (JPG, PNG, WebP, GIF) y PDF.'));
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});
