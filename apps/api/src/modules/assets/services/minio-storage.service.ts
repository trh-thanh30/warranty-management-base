import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { storageConfig } from '@/config';
import { Readable } from 'stream';
import type {
  IStorageService,
  SaveResult,
} from '@/modules/assets/services/storage.interface';

type AccessType = 'PUBLIC' | 'PRIVATE' | 'TEMP';

interface ObjectLocation {
  bucket: string;
  key: string;
}

@Injectable()
export class MinioStorageService implements IStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: S3Client;

  constructor(private readonly config: ConfigType<typeof storageConfig>) {
    const { endpoint, port, useSsl, region, accessKey, secretKey } =
      config.minio;

    if (!accessKey || !secretKey) {
      throw new Error(
        'MINIO_ACCESS_KEY and MINIO_SECRET_KEY are required when STORAGE_DRIVER=minio',
      );
    }

    const protocol = useSsl ? 'https' : 'http';
    const clientConfig: S3ClientConfig = {
      region,
      endpoint: `${protocol}://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    };

    this.client = new S3Client(clientConfig);
  }

  async save(
    file: Express.Multer.File,
    folder: string,
    filename: string,
    accessType: AccessType,
  ): Promise<SaveResult> {
    const bucket = this.getBucket(accessType);
    const key = this.normalizeKey(`${folder}/${filename}`);

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.mimetype,
      }),
    );

    const relativePath = `${this.getDirName(accessType)}/${key}`;
    this.logger.debug(`Saved file to MinIO: ${bucket}/${key}`);

    return {
      path: relativePath,
      size: file.size,
    };
  }

  async delete(relativePath: string): Promise<void> {
    const { bucket, key } = this.resolveObjectLocation(relativePath);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    this.logger.debug(`Deleted file from MinIO: ${bucket}/${key}`);
  }

  async getStream(relativePath: string): Promise<Readable> {
    const { bucket, key } = this.resolveObjectLocation(relativePath);

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      if (!response.Body) {
        throw new NotFoundException(`File not found: ${relativePath}`);
      }

      return this.toReadable(response.Body);
    } catch (error: any) {
      const statusCode = error?.$metadata?.httpStatusCode;
      if (statusCode === 404 || error?.name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${relativePath}`);
      }

      throw error;
    }
  }

  private resolveObjectLocation(relativePath: string): ObjectLocation {
    const normalizedPath = this.normalizeKey(relativePath);
    const [dirName, ...keyParts] = normalizedPath.split('/');
    const key = keyParts.join('/');

    if (!key) {
      throw new NotFoundException(`File not found: ${relativePath}`);
    }

    return {
      bucket: this.getBucketByDirName(dirName),
      key,
    };
  }

  private getBucket(accessType: AccessType): string {
    switch (accessType) {
      case 'PUBLIC':
        return this.config.minio.publicBucket;
      case 'PRIVATE':
        return this.config.minio.privateBucket;
      case 'TEMP':
        return this.config.minio.tempBucket;
    }
  }

  private getBucketByDirName(dirName: string): string {
    if (dirName === this.config.publicDirName) {
      return this.config.minio.publicBucket;
    }

    if (dirName === this.config.privateDirName) {
      return this.config.minio.privateBucket;
    }

    if (dirName === this.config.tempDirName) {
      return this.config.minio.tempBucket;
    }

    throw new NotFoundException(`Unknown asset storage path: ${dirName}`);
  }

  private getDirName(accessType: AccessType): string {
    switch (accessType) {
      case 'PUBLIC':
        return this.config.publicDirName;
      case 'PRIVATE':
        return this.config.privateDirName;
      case 'TEMP':
        return this.config.tempDirName;
    }
  }

  private normalizeKey(value: string): string {
    return value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }

  private toReadable(body: unknown): Readable {
    if (body instanceof Readable) {
      return body;
    }

    if (body && typeof (body as any).pipe === 'function') {
      return body as Readable;
    }

    if (body && Symbol.asyncIterator in Object(body)) {
      return Readable.from(body as AsyncIterable<Uint8Array>);
    }

    throw new Error('Unsupported MinIO response stream');
  }
}
