import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import path from 'path';

const s3 = new S3Client({
  endpoint: env.SPACES_ENDPOINT,
  region: env.SPACES_REGION,
  credentials: {
    accessKeyId: env.SPACES_KEY,
    secretAccessKey: env.SPACES_SECRET,
  },
  forcePathStyle: false,
});

/**
 * Uploads a buffer to DigitalOcean Spaces and returns the public URL.
 * @param {Buffer} buffer - file content
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @param {string} folder - destination folder inside the bucket (e.g. 'beo-payments')
 * @param {string} originalname - original filename (used for extension)
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadToSpaces(buffer, mimetype, folder, originalname) {
  const ext = path.extname(originalname || '').toLowerCase() || '.bin';
  const key = `dashboard-eventos/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: env.SPACES_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  }));

  return `https://${env.SPACES_BUCKET}.${env.SPACES_REGION}.digitaloceanspaces.com/${key}`;
}
