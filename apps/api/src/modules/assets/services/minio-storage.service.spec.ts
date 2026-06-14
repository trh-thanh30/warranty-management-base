import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { MinioStorageService } from '@/modules/assets/services/minio-storage.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  class MockS3Client {
    send = sendMock;
  }

  class MockCommand {
    constructor(public readonly input: Record<string, unknown>) {}
  }

  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockCommand,
    DeleteObjectCommand: MockCommand,
    GetObjectCommand: MockCommand,
  };
});

const config = {
  publicDirName: 'public',
  privateDirName: 'private',
  tempDirName: 'temp',
  minio: {
    endpoint: 'minio',
    port: 9000,
    useSsl: false,
    region: 'us-east-1',
    accessKey: 'access-key',
    secretKey: 'secret-key',
    publicBucket: 'public-bucket',
    privateBucket: 'private-bucket',
    tempBucket: 'temp-bucket',
  },
} as any;

describe('MinioStorageService', () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  it('saves public files to the public bucket and preserves local-compatible paths', async () => {
    sendMock.mockResolvedValue({});
    const service = new MinioStorageService(config);
    const file = {
      originalname: 'image.jpg',
      mimetype: 'image/jpeg',
      size: 5,
      buffer: Buffer.from('image'),
    } as Express.Multer.File;

    const result = await service.save(
      file,
      '2026/06/products',
      'image.jpg',
      'PUBLIC',
    );

    expect(result).toEqual({
      path: 'public/2026/06/products/image.jpg',
      size: 5,
    });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'public-bucket',
          Key: '2026/06/products/image.jpg',
          Body: file.buffer,
          ContentType: 'image/jpeg',
        }),
      }),
    );
  });

  it('deletes private files from the private bucket', async () => {
    sendMock.mockResolvedValue({});
    const service = new MinioStorageService(config);

    await service.delete('private/2026/06/invoice.pdf');

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'private-bucket',
          Key: '2026/06/invoice.pdf',
        }),
      }),
    );
  });

  it('returns object streams', async () => {
    const stream = Readable.from(Buffer.from('file'));
    sendMock.mockResolvedValue({ Body: stream });
    const service = new MinioStorageService(config);

    await expect(service.getStream('public/2026/06/image.jpg')).resolves.toBe(
      stream,
    );
  });

  it('maps missing objects to NotFoundException', async () => {
    sendMock.mockRejectedValue({
      name: 'NoSuchKey',
      $metadata: { httpStatusCode: 404 },
    });
    const service = new MinioStorageService(config);

    await expect(
      service.getStream('public/2026/06/missing.jpg'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
