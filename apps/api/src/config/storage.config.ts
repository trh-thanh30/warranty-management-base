import {
  parseOptionalPositiveInt,
  resolveFromWorkingDirectory,
} from '@/config/config.utils';
import { registerAs } from '@nestjs/config';

/**
 * Storage & Asset configuration
 * Reads from environment variables (validated by Zod in env.validation.ts)
 */
export default registerAs('storage', () => ({
  driver: process.env.STORAGE_DRIVER ?? 'local',
  capacityBytes: parseOptionalPositiveInt(process.env.STORAGE_CAPACITY_BYTES),
  rootDir: resolveFromWorkingDirectory(
    process.env.STORAGE_ROOT_DIR ?? '/app/storage',
  ),
  publicDirName: process.env.STORAGE_PUBLIC_DIR_NAME ?? 'public',
  privateDirName: process.env.STORAGE_PRIVATE_DIR_NAME ?? 'private',
  tempDirName: process.env.STORAGE_TEMP_DIR_NAME ?? 'temp',
  cdnUrl: (process.env.ASSET_CDN_URL ?? 'http://localhost:4100/cdn').replace(
    /\/$/,
    '',
  ),
  maxFileSize: parseInt(process.env.ASSET_MAX_FILE_SIZE ?? '10485760', 10),
  allowedMimeTypes: (
    process.env.ASSET_ALLOWED_MIME_TYPES ??
    'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/quicktime,audio/mpeg,audio/wav,application/pdf'
  ).split(','),
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'minio',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSsl: process.env.MINIO_USE_SSL === 'true',
    region: process.env.MINIO_REGION ?? 'us-east-1',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    publicBucket:
      process.env.MINIO_BUCKET_PUBLIC ?? 'warranty-management-base-public',
    privateBucket:
      process.env.MINIO_BUCKET_PRIVATE ?? 'warranty-management-base-private',
    tempBucket:
      process.env.MINIO_BUCKET_TEMP ?? 'warranty-management-base-temp',
  },
}));
